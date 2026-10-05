// Damage simulator. Formula (official rune-list glossary, plus community-tested crit/resist models):
//
//   hit   = (main-element flat + skill flat) × skill% × (1 + Σinc) × Π(1 + amp) × Π(1 − damp)
//   crit% = rating × (1 + Σrating%) / (1 + 0.04 × enemyLv) + flat crit chance
//   crit× = 1.5 + ΣcritDMG            (ΣcritDMG capped at 1300%)
//   resist = min(85%, R / (1 + enemyLv / 100)),  R = res × (1 − pen%) − flatPen
//   speed = weaponSpeed × (1 + local%) × (1 + Σinc) × Π(1 + amp) × Π(1 − damp), capped at 5/s
//
// Results are estimates: the game applies extra hidden factors that are not public.
import type { AwakeningTier, LinkRules, Rune, RuneGrade, UniqueItem } from '../data/types'
import { gradeLines, resolveRolls, runeLinesAt } from './runeLevel'
import { ELEMENTAL, flatApplies, parseLine, scopeApplies, type Element, type LineContext, type Mod } from './statParser'

export type SlotId =
  | 'weapon'
  | 'offhand'
  | 'helmet'
  | 'armor'
  | 'gloves'
  | 'shoes'
  | 'spaulders'
  | 'belt'
  | 'necklace'
  | 'ring1'
  | 'ring2'

export interface RuneSetup {
  rune: Rune
  level: number
  grade: RuneGrade
  awakening: Partial<Record<AwakeningTier, boolean>>
}

export interface SimInput {
  skill: RuneSetup | null
  links: (RuneSetup | null)[]
  gear: Partial<Record<SlotId, UniqueItem>>
  /** 0 = every [min-max] roll at minimum, 1 = at maximum. */
  rollQuality: number
  /** Keys (see lineKey) of conditional lines the user switched on. */
  enabledConditions: ReadonlySet<string>
  /** Which damage component of the skill to use for DPS (index into result.components). */
  componentIndex: number
  allProjectilesHit: boolean
  custom: {
    flatMin: number
    flatMax: number
    incDmg: number
    ampDmg: number
    critRating: number
    critDmg: number
    baseSpeed: number
    incSpeed: number
  }
  target: {
    level: number
    elementResist: number
    chaosResist: number
    /** Physical damage reduction from armor, in %. The armor formula is not public, so this is a direct input. */
    armorReduction: number
  }
}

export type LineStatus = 'used' | 'conditional-on' | 'conditional-off' | 'inactive' | 'not-counted'

export interface LineReport {
  key: string
  source: string
  line: string
  status: LineStatus
  condition?: string
  note?: string
}

export interface Contribution {
  source: string
  value: number
}

export interface Component {
  label: string
  pct: number
  flat: number
  hitMin: number
  hitMax: number
  hitAvg: number
}

export interface SimResult {
  ready: boolean
  problems: string[]
  warnings: string[]
  element: Element | null
  skillTags: string[]
  estimatedLevel: boolean
  base: { min: number; max: number; sources: (Contribution & { min: number; max: number })[] }
  strikeMultBonus: number
  components: Component[]
  inc: { total: number; sources: Contribution[] }
  amps: Contribution[]
  damps: Contribution[]
  multiplier: number
  crit: { rating: number; chance: number; multiplier: number; guaranteed: boolean; disabled: boolean }
  enemy: { reduction: number; resist: number; penetration: number }
  additional: Contribution[]
  hit: { min: number; max: number; avg: number; afterEnemy: number; expected: number }
  speed: { kind: 'attack' | 'cast'; base: number; perSecond: number; capped: boolean }
  cooldown: { base: number; effective: number } | null
  projectiles: number
  usesPerSecond: number
  dps: number
  manaCost: number | null
  lines: LineReport[]
}

export const SPEED_CAP = 5
export const CRIT_DMG_CAP = 1300
export const RESIST_CAP = 85

export const lineKey = (source: string, line: string) => `${source}::${line}`

/** Can this link rune be linked to that skill rune? */
export function checkLink(rules: LinkRules | undefined, skillTags: readonly string[]): { ok: boolean; reason?: string } {
  if (!rules || rules.groups.length === 0) return { ok: false, reason: 'รูนทริกเกอร์/เปิดใช้งาน — ตัวจำลองยังไม่รองรับ' }
  const tags = new Set(skillTags)
  for (const g of rules.groups) {
    const pass = g.mode === 'all' ? g.tags.every((t) => tags.has(t)) : g.tags.some((t) => tags.has(t))
    if (!pass) return { ok: false, reason: `ต้องมีแท็ก ${g.tags.join(g.mode === 'all' ? ' + ' : ' หรือ ')}` }
  }
  const bad = rules.exclude.find((t) => tags.has(t))
  if (bad) return { ok: false, reason: `ลิงก์กับสกิลแท็ก ${bad} ไม่ได้` }
  return { ok: true }
}

interface Collected {
  source: string
  mod: Mod
}

export function simulate(input: SimInput): SimResult {
  const problems: string[] = []
  const warnings: string[] = []
  const reports: LineReport[] = []
  const mods: Collected[] = []

  const take = (source: string, rawLines: string[], ctx: LineContext, active = true) => {
    for (const raw of rawLines) {
      const line = resolveRolls(raw, input.rollQuality)
      const key = lineKey(source, raw)
      const p = parseLine(line, ctx)
      if (!active) {
        reports.push({ key, source, line, status: 'inactive' })
        continue
      }
      if (!p.mod) {
        reports.push({ key, source, line, status: 'not-counted', note: p.note })
        continue
      }
      if (p.condition) {
        const on = input.enabledConditions.has(key)
        reports.push({ key, source, line, status: on ? 'conditional-on' : 'conditional-off', condition: p.condition })
        if (!on) continue
      } else {
        reports.push({ key, source, line, status: 'used' })
      }
      mods.push({ source, mod: p.mod })
    }
  }

  // ---- collect modifiers
  const skill = input.skill
  let estimatedLevel = false
  const runeLines = (s: RuneSetup) => {
    const at = runeLinesAt(s.rune, s.level)
    if (at.estimated) estimatedLevel = true
    const awakened = (['source', 'origin', 'verity'] as const).filter((t) => s.awakening[t]).flatMap((t) => s.rune.awakening[t])
    return [...at.lines, ...gradeLines(s.rune, s.grade), ...awakened]
  }

  if (skill) take(`รูนสกิล ${skill.rune.name}`, runeLines(skill), 'skill')
  else problems.push('ลากรูนสกิลมาวางตรงกลางก่อน')

  const skillTags = skill ? skill.rune.tags : []
  input.links.forEach((l) => {
    if (!l) return
    const check = checkLink(l.rune.linkRules, skillTags)
    const source = `รูนลิงก์ ${l.rune.name}`
    if (skill && !check.ok) warnings.push(`${l.rune.name}: ${check.reason}`)
    take(source, runeLines(l), 'link', !skill || check.ok)
  })

  const weapon = input.gear.weapon
  for (const [slot, item] of Object.entries(input.gear) as [SlotId, UniqueItem | undefined][]) {
    if (!item) continue
    const ctx: LineContext = slot === 'weapon' ? 'weapon' : 'gear'
    take(`ไอเทม ${item.name}`, [...item.implicit, ...item.innate, ...item.options], ctx)
  }

  if (skill?.rune.tags.includes('Bow') && weapon && !/Bow$/.test(weapon.gearType)) warnings.push('สกิลนี้ต้องใช้ธนู')
  if (skill?.rune.tags.includes('Bowgun') && weapon && weapon.gearType !== 'Bowgun') warnings.push('สกิลนี้ต้องใช้โบว์กัน')
  if (skill && skill.rune.tags.some((t) => ['Minion', 'Sentry', 'Totem', 'Trap'].includes(t))) {
    warnings.push('สกิลมินเนียน/เซนทรี/โทเทม/กับดัก ใช้สูตรแยกในเกม ผลลัพธ์อาจคลาดเคลื่อนมาก')
  }

  const of = <T extends Mod['type']>(type: T) =>
    mods.filter((c): c is Collected & { mod: Extract<Mod, { type: T }> } => c.mod.type === type)

  // ---- skill identity
  const tags = new Set(skillTags)
  const isAttack = tags.has('Attack')
  const declared = of('element').map((c) => c.mod.element)
  const flats = of('flat')
  let element: Element | null = null
  if (skill) {
    const named = declared.find((e): e is Element => e !== 'Highest')
    if (named) element = named
    else if (declared.includes('Highest')) {
      // Highest Element skills use whichever elemental flat damage is largest.
      let best: Element = 'Fire'
      let bestSum = -1
      for (const e of ELEMENTAL) {
        const sum = flats.filter((f) => f.mod.source === e).reduce((a, f) => a + f.mod.min + f.mod.max, 0)
        if (sum > bestSum) [best, bestSum] = [e, sum]
      }
      element = best
    } else {
      element = (['Physical', 'Fire', 'Cold', 'Lightning', 'Poison', 'Chaos'] as const).find((e) => tags.has(e)) ?? 'Physical'
    }
  }
  const el: Element = element ?? 'Physical'

  // ---- base flat damage (weapon + gear + links + custom)
  const baseSources: SimResult['base']['sources'] = []
  for (const f of flats) {
    if (!flatApplies(f.mod.source, tags, el)) continue
    baseSources.push({ source: f.source, min: f.mod.min, max: f.mod.max, value: (f.mod.min + f.mod.max) / 2 })
  }
  if (input.custom.flatMin || input.custom.flatMax) {
    baseSources.push({ source: 'ค่ากำหนดเอง', min: input.custom.flatMin, max: input.custom.flatMax, value: (input.custom.flatMin + input.custom.flatMax) / 2 })
  }
  const baseMin = baseSources.reduce((a, s) => a + s.min, 0)
  const baseMax = baseSources.reduce((a, s) => a + s.max, 0)

  // ---- stacking buckets
  const incSources: Contribution[] = []
  const amps: Contribution[] = []
  const damps: Contribution[] = []
  for (const c of of('dmg')) {
    if (!scopeApplies(c.mod.scope, tags, el)) continue
    const entry = { source: c.source, value: c.mod.value }
    if (c.mod.stack === 'inc') incSources.push(entry)
    else if (c.mod.stack === 'amp') amps.push(entry)
    else damps.push(entry)
  }
  if (input.custom.incDmg) incSources.push({ source: 'ค่ากำหนดเอง', value: input.custom.incDmg })
  if (input.custom.ampDmg) amps.push({ source: 'ค่ากำหนดเอง', value: input.custom.ampDmg })
  const incTotal = incSources.reduce((a, s) => a + s.value, 0)
  const multiplier =
    Math.max(0, 1 + incTotal / 100) *
    amps.reduce((a, s) => a * (1 + s.value / 100), 1) *
    damps.reduce((a, s) => a * Math.max(0, 1 - s.value / 100), 1)

  const strikeMultBonus = tags.has('Strike') ? of('strikeMult').reduce((a, c) => a + c.mod.value, 0) : 0

  // ---- damage components of the skill
  const pcts = of('skillPct').filter((c) => c.source.startsWith('รูนสกิล'))
  const skillFlats = of('skillFlat').filter((c) => c.source.startsWith('รูนสกิล'))
  const flatsByKey = new Map<string, number[]>()
  for (const f of skillFlats) flatsByKey.set(f.mod.key, [...(flatsByKey.get(f.mod.key) ?? []), f.mod.value])
  const seen = new Map<string, number>()
  const components: Component[] = pcts.map((p, n) => {
    const i = seen.get(p.mod.key) ?? 0
    seen.set(p.mod.key, i + 1)
    const own = flatsByKey.get(p.mod.key)
    const flat = own?.[i] ?? own?.[0] ?? flatsByKey.get('')?.[0] ?? 0
    const pct = (p.mod.pct + strikeMultBonus) / 100
    const hitMin = (baseMin + flat) * pct * multiplier
    const hitMax = (baseMax + flat) * pct * multiplier
    const generic = !p.mod.label || p.mod.label === el || p.mod.label === 'Highest Element'
    const label = generic ? (pcts.length > 1 ? `ดาเมจ #${n + 1}` : 'ดาเมจหลัก') : p.mod.label
    return { label, pct: p.mod.pct, flat, hitMin, hitMax, hitAvg: (hitMin + hitMax) / 2 }
  })
  if (skill && components.length === 0) problems.push('รูนสกิลนี้ไม่มีค่าดาเมจโดยตรง (เป็นบัฟ/ยูทิลิตี้) จึงคำนวณดาเมจไม่ได้')
  const comp = components[Math.min(input.componentIndex, components.length - 1)] ?? null

  // ---- critical
  const guaranteed = of('guaranteedCrit').length > 0
  const disabled = of('noCrit').length > 0
  const scopeOk = (scope: string) => scope === '' || tags.has(scope)
  const gearCrit = of('gearCrit').reduce((a, c) => a + c.mod.value, 0)
  const gearCritInc = of('gearCritInc').reduce((a, c) => a + c.mod.value, 0)
  const flatRating = of('critRating').filter((c) => scopeOk(c.mod.scope)).reduce((a, c) => a + c.mod.value, 0)
  const ratingInc = of('critRatingInc').filter((c) => scopeOk(c.mod.scope)).reduce((a, c) => a + c.mod.value, 0)
  const rating = (gearCrit * (1 + gearCritInc / 100) + flatRating + input.custom.critRating) * (1 + ratingInc / 100)
  const flatChance = of('critChance').reduce((a, c) => a + c.mod.value, 0)
  const lvl = input.target.level
  const chance = disabled ? 0 : guaranteed ? 100 : Math.min(100, rating / (1 + 0.04 * lvl) + flatChance)
  const critDmgSum = Math.min(
    CRIT_DMG_CAP,
    of('critDmg').filter((c) => scopeOk(c.mod.scope)).reduce((a, c) => a + c.mod.value, 0) + input.custom.critDmg,
  )
  const critMult = 1.5 + critDmgSum / 100

  // ---- enemy mitigation
  const pens = of('pen')
  const penPct = (targets: string[]) => {
    const parts = pens.filter((p) => p.mod.pct && targets.includes(p.mod.target)).map((p) => p.mod.value / 100)
    return Math.min(0.6, 1 - parts.reduce((a, p) => a * (1 - p), 1))
  }
  const penFlat = (targets: string[]) => pens.filter((p) => !p.mod.pct && targets.includes(p.mod.target)).reduce((a, p) => a + p.mod.value, 0)
  const resistDamp = (target: 'Armor' | 'Element') =>
    of('resistDamp')
      .filter((c) => c.mod.target === target)
      .reduce((a, c) => a * (1 - c.mod.value / 100), 1)

  let reduction: number
  let resist: number
  let penetration: number
  if (el === 'Physical') {
    penetration = penPct(['Armor', 'Physical', 'DMG'])
    resist = input.target.armorReduction * resistDamp('Armor')
    reduction = Math.min(RESIST_CAP, resist * (1 - penetration))
  } else {
    const targets = el === 'Chaos' ? ['Chaos', 'DMG'] : ['Element', el, 'DMG']
    penetration = penPct(targets)
    const raw = el === 'Chaos' ? input.target.chaosResist : input.target.elementResist * resistDamp('Element')
    resist = Math.max(0, raw * (1 - penetration) - penFlat(targets))
    reduction = Math.min(RESIST_CAP, resist / (1 + lvl / 100))
  }
  const enemyMult = 1 - reduction / 100

  // ---- per-hit totals
  const hitAvg = comp?.hitAvg ?? 0
  const additional = of('additional').map((c) => ({ source: c.source, value: (hitAvg * c.mod.pct) / 100 }))
  const afterEnemy = hitAvg * enemyMult + additional.reduce((a, s) => a + s.value, 0)
  const expected = afterEnemy * (1 + (chance / 100) * (critMult - 1))

  // ---- speed
  const kind: 'attack' | 'cast' = isAttack ? 'attack' : 'cast'
  const weaponSpeed = of('weaponSpeed').reduce((a, c) => a + c.mod.value, 0)
  const localSpeed = of('weaponSpeedInc').reduce((a, c) => a + c.mod.value, 0)
  const baseSpeed = (weaponSpeed || input.custom.baseSpeed) * (1 + localSpeed / 100)
  const speedMods = of('speed').filter((c) => (c.mod.kind === 'both' || c.mod.kind === kind) && scopeOk(c.mod.scope))
  const speedInc = speedMods.filter((c) => c.mod.stack === 'inc').reduce((a, c) => a + c.mod.value, 0) + input.custom.incSpeed
  const speedRaw =
    baseSpeed *
    (1 + speedInc / 100) *
    speedMods.filter((c) => c.mod.stack === 'amp').reduce((a, c) => a * (1 + c.mod.value / 100), 1) *
    speedMods.filter((c) => c.mod.stack === 'damp').reduce((a, c) => a * (1 - c.mod.value / 100), 1)
  const perSecond = Math.min(SPEED_CAP, speedRaw)

  // ---- cooldown, projectiles, uses per second
  const cdBase = of('cooldown').find((c) => c.source.startsWith('รูนสกิล'))?.mod.value ?? 0
  const cdr = of('cdr').reduce((a, c) => a + c.mod.value, 0)
  const cooldown = cdBase > 0 ? { base: cdBase, effective: cdBase / (1 + cdr / 100) } : null
  const usesPerSecond = cooldown ? Math.min(perSecond, 1 / cooldown.effective) : perSecond

  const baseProj = of('baseProjectiles').find((c) => c.source.startsWith('รูนสกิล'))?.mod.value ?? (tags.has('Projectile') ? 1 : 0)
  const projectiles = tags.has('Projectile') ? baseProj + of('projectiles').reduce((a, c) => a + c.mod.value, 0) : 0
  const hitsPerUse = input.allProjectilesHit && projectiles > 1 ? projectiles : 1

  const dps = expected * hitsPerUse * usesPerSecond

  // ---- mana
  const manaBase = of('manaCost').find((c) => c.source.startsWith('รูนสกิล'))?.mod.value ?? null
  const costs = of('cost')
  const manaCost =
    manaBase === null
      ? null
      : manaBase *
        Math.max(0, 1 + costs.filter((c) => c.mod.stack === 'inc').reduce((a, c) => a + c.mod.value, 0) / 100) *
        costs.filter((c) => c.mod.stack === 'amp').reduce((a, c) => a * (1 + c.mod.value / 100), 1) *
        costs.filter((c) => c.mod.stack === 'damp').reduce((a, c) => a * (1 - c.mod.value / 100), 1)

  if (!weapon && !input.custom.flatMin && !input.custom.flatMax && skill) {
    warnings.push('ยังไม่ได้ใส่อาวุธ — ดาเมจจะมาจากค่าคงที่ของรูนอย่างเดียว ใส่อาวุธหรือกรอกดาเมจอาวุธเองในแผง "ค่าตัวละคร"')
  }

  return {
    ready: problems.length === 0,
    problems,
    warnings,
    element,
    skillTags,
    estimatedLevel,
    base: { min: baseMin, max: baseMax, sources: baseSources },
    strikeMultBonus,
    components,
    inc: { total: incTotal, sources: incSources },
    amps,
    damps,
    multiplier,
    crit: { rating, chance, multiplier: critMult, guaranteed, disabled },
    enemy: { reduction, resist, penetration },
    additional,
    hit: { min: comp?.hitMin ?? 0, max: comp?.hitMax ?? 0, avg: hitAvg, afterEnemy, expected },
    speed: { kind, base: baseSpeed, perSecond, capped: speedRaw > SPEED_CAP },
    cooldown,
    projectiles,
    usesPerSecond,
    dps,
    manaCost,
    lines: reports,
  }
}
