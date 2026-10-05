// Turns English stat lines into structured modifiers for the damage simulator.
// Stacking follows the wording the game uses (official rune-list glossary):
//   "+X% … DMG"            → inc  (all inc lines add together)
//   "X% … DMG Amplification" → amp  (each multiplies separately)
//   "X% … DMG Dampening"     → damp (each multiplies by 1 − X)
// Anything the simulator can't use is returned as `null` and listed as "not counted" in the UI.

export type Element = 'Physical' | 'Fire' | 'Cold' | 'Lightning' | 'Poison' | 'Chaos'
export const ELEMENTS: Element[] = ['Physical', 'Fire', 'Cold', 'Lightning', 'Poison', 'Chaos']
export const ELEMENTAL = new Set<Element>(['Fire', 'Cold', 'Lightning', 'Poison'])
const isElement = (s: string): s is Element => (ELEMENTS as string[]).includes(s)

export type LineContext = 'skill' | 'link' | 'gear' | 'weapon'
export type FlatSource = 'Attack' | 'Spell' | 'Attack and Spell' | 'Main Element' | Element
export type SpeedKind = 'attack' | 'cast' | 'both'
export type Stack = 'inc' | 'amp' | 'damp'
export type PenTarget = 'Armor' | 'Element' | 'DMG' | Element

export type Mod =
  | { type: 'element'; element: Element | 'Highest' }
  | { type: 'skillPct'; key: string; label: string; pct: number }
  | { type: 'skillFlat'; key: string; value: number }
  | { type: 'flat'; source: FlatSource; min: number; max: number }
  | { type: 'dmg'; stack: Stack; scope: string; value: number }
  | { type: 'strikeMult'; value: number }
  | { type: 'additional'; element: Element; pct: number }
  | { type: 'speed'; kind: SpeedKind; stack: Stack; scope: string; value: number }
  | { type: 'weaponSpeed'; value: number }
  | { type: 'weaponSpeedInc'; value: number }
  | { type: 'critRating'; scope: string; value: number }
  | { type: 'critRatingInc'; scope: string; value: number }
  | { type: 'gearCrit'; value: number }
  | { type: 'gearCritInc'; value: number }
  | { type: 'critChance'; value: number }
  | { type: 'critDmg'; scope: string; value: number }
  | { type: 'guaranteedCrit' }
  | { type: 'noCrit' }
  | { type: 'projectiles'; value: number }
  | { type: 'baseProjectiles'; value: number }
  | { type: 'cooldown'; value: number }
  | { type: 'cdr'; value: number }
  | { type: 'manaCost'; value: number }
  | { type: 'cost'; stack: Stack; value: number }
  | { type: 'pen'; target: PenTarget; pct: boolean; value: number }
  | { type: 'resistDamp'; target: 'Armor' | 'Element'; value: number }

export interface ParsedLine {
  line: string
  mod: Mod | null
  /** Trailing condition such as "against Burning enemies" — the mod only counts when the user enables it. */
  condition?: string
  /** Why a line is not counted when `mod` is null. */
  note?: 'scaling' | 'unsupported'
}

const N = '(-?\\d+(?:\\.\\d+)?)'
const re = (s: string) => new RegExp(`^${s}$`)

// Scope words that may precede "DMG". Anything else (Critical, Maximized, Burn, Reflect…) is not a hit-damage scope.
const DMG_SCOPES = new Set([
  '',
  'Attack',
  'Spell',
  'Attack and Spell',
  'Main Element',
  'Skill',
  'Element',
  'Elemental',
  ...ELEMENTS,
  'Melee',
  'Projectile',
  'Area',
  'Strike',
  'Trap',
  'Sentry',
  'Minion',
  'Totem',
  'Shout',
  'Channeling',
  'Rune Knight',
  'Abyssling',
  'Overheat',
  'Charge',
  'Blow',
  'Move Attack',
  'Shadow',
])

const SPEED_SCOPES = new Set(['', 'Sentry', 'Minion', 'Abyssling', 'Rune Knight', 'Totem', 'Shout', 'Melee', 'Projectile'])

/** Does a scope word apply to a skill with these tags and main element? */
export function scopeApplies(scope: string, tags: ReadonlySet<string>, element: Element): boolean {
  switch (scope) {
    case '':
    case 'Main Element':
    case 'Skill':
      return true
    case 'Attack and Spell':
      return tags.has('Attack') || tags.has('Spell')
    case 'Element':
    case 'Elemental':
      return ELEMENTAL.has(element)
    case 'Area':
      return tags.has('Area of Effect')
    case 'Channeling':
      return tags.has('Channel')
    default:
      return isElement(scope) ? element === scope : tags.has(scope)
  }
}

export function flatApplies(source: FlatSource, tags: ReadonlySet<string>, element: Element): boolean {
  switch (source) {
    case 'Main Element':
      return true
    case 'Attack':
      return tags.has('Attack')
    case 'Spell':
      return tags.has('Spell')
    case 'Attack and Spell':
      return tags.has('Attack') || tags.has('Spell')
    default:
      return source === element
  }
}

// ---------------------------------------------------------------- skill damage components

const ELEMENT_SUFFIX = /\s*(?:Physical|Fire|Cold|Lightning|Poison|Chaos|Highest Element)$/
const NOT_BASE = /Amplification|Dampening|Multiplier|Taken|Increase|chance|Chance|Critical|Maximized|Burn|Bleed|Venom|Reflect|Toggle|Status/

function componentKey(prefix: string, suffix?: string) {
  if (suffix) return { key: suffix.toLowerCase(), label: suffix }
  const p = prefix.trim()
  return { key: p.replace(ELEMENT_SUFFIX, '').trim().toLowerCase(), label: p }
}

function parseSkillDamage(line: string): Mod | null {
  if (NOT_BASE.test(line)) return null
  let m
  // "Fire DMG 645%", "Icy Arrow Cold DMG 422%", "Lightning DMG +1067%"
  if ((m = line.match(re(`(?!\\+)(.*?)\\s*DMG \\+?${N}%`)))) {
    const { key, label } = componentKey(m[1])
    return { type: 'skillPct', key, label, pct: Number(m[2]) }
  }
  // "584% Physical DMG upon throwing"
  if ((m = line.match(re(`${N}% (.*?)\\s*DMG (upon .+)`)))) {
    const { key, label } = componentKey(m[2], m[3])
    return { type: 'skillPct', key, label, pct: Number(m[1]) }
  }
  // "Fire DMG +1115", "Fire Blow DMG +329"
  if ((m = line.match(re(`(?!\\+)(.*?)\\s*DMG \\+${N}`)))) {
    return { type: 'skillFlat', key: componentKey(m[1]).key, value: Number(m[2]) }
  }
  // "+317 Physical DMG upon throwing", "+1271 Arrow DMG"
  if ((m = line.match(re(`\\+${N} (.*?)\\s*DMG(?: (upon .+))?`)))) {
    return { type: 'skillFlat', key: componentKey(m[2], m[3]).key, value: Number(m[1]) }
  }
  return null
}

// ---------------------------------------------------------------- generic lines

const CONDITION =
  / (against .+|when .+|while .+|upon .+|on (?:hit|Hit|Critical Hit|critical hit|kill|Kill)\b.*|at \d+(?:\.\d+)?% or (?:more|less) .+|for \d+(?:\.\d+)? s\b.*|if .+|during .+|after .+|to (?:enemies|targets) .+|of (?:enemies|targets) .+)$/
const SCALING = /\bper\b|\bfor every\b|\(Max/i

function parseFlatSource(s: string): FlatSource | null {
  if (s === 'Attack' || s === 'Spell' || s === 'Attack and Spell' || s === 'Main Element') return s
  return isElement(s) ? s : null
}

function parseCore(line: string, ctx: LineContext): Mod | null {
  let m

  if ((m = line.match(re(`(Physical|Fire|Cold|Lightning|Poison|Chaos) Element`)))) return { type: 'element', element: m[1] as Element }
  if (line === 'Highest Element DMG') return { type: 'element', element: 'Highest' }
  if (line === 'Guaranteed Critical Hit') return { type: 'guaranteedCrit' }
  if (line === 'Critical Hit Disabled') return { type: 'noCrit' }

  // flat added damage "+36-54 Attack DMG" / "+5-10 Attack DMG"
  if ((m = line.match(re(`\\+${N}-${N} (.+?) DMG`)))) {
    const source = parseFlatSource(m[3])
    return source ? { type: 'flat', source, min: Number(m[1]), max: Number(m[2]) } : null
  }

  if (ctx === 'skill') {
    const skill = parseSkillDamage(line)
    if (skill) return skill
    if ((m = line.match(re(`Mana Cost ${N}`)))) return { type: 'manaCost', value: Number(m[1]) }
    if ((m = line.match(re(`Cost ${N} Mana`)))) return { type: 'manaCost', value: Number(m[1]) }
    if ((m = line.match(re(`Cooldown ${N} s`)))) return { type: 'cooldown', value: Number(m[1]) }
    if ((m = line.match(re(`Projectile Count ${N}(?: \\(Max ${N}\\))?`)))) return { type: 'baseProjectiles', value: Number(m[1]) }
  }

  if (ctx === 'weapon') {
    if ((m = line.match(re(`\\+${N} Speed`)))) return { type: 'weaponSpeed', value: Number(m[1]) }
    if ((m = line.match(re(`\\+${N}% Speed`)))) return { type: 'weaponSpeedInc', value: Number(m[1]) }
    if ((m = line.match(re(`\\+${N} Gear Critical Rate`)))) return { type: 'gearCrit', value: Number(m[1]) }
    if ((m = line.match(re(`\\+${N}% Gear Critical Rate`)))) return { type: 'gearCritInc', value: Number(m[1]) }
  }

  // damage stacking
  if ((m = line.match(re(`\\+${N}% (?:(.+?) )?DMG`))) && DMG_SCOPES.has(m[2] ?? '')) {
    return { type: 'dmg', stack: 'inc', scope: m[2] ?? '', value: Number(m[1]) }
  }
  if ((m = line.match(re(`${N}% (?:(.+?) )?DMG (Amplification|Dampening)`))) && DMG_SCOPES.has(m[2] ?? '')) {
    return { type: 'dmg', stack: m[3] === 'Amplification' ? 'amp' : 'damp', scope: m[2] ?? '', value: Number(m[1]) }
  }
  if ((m = line.match(re(`Amplify DMG by ${N}%`)))) return { type: 'dmg', stack: 'amp', scope: '', value: Number(m[1]) }
  if ((m = line.match(re(`\\+${N}% Strike DMG Multiplier`)))) return { type: 'strikeMult', value: Number(m[1]) }
  if ((m = line.match(re(`Additional (Physical|Fire|Cold|Lightning|Poison|Chaos) DMG (?:on DMG )?equal to ${N}% of DMG on every hit`)))) {
    return { type: 'additional', element: m[1] as Element, pct: Number(m[2]) }
  }

  // speed
  if ((m = line.match(re(`\\+${N}% (?:(.+?) )?(Attack|Cast) Speed`))) && SPEED_SCOPES.has(m[2] ?? '')) {
    return { type: 'speed', kind: m[3] === 'Attack' ? 'attack' : 'cast', stack: 'inc', scope: m[2] ?? '', value: Number(m[1]) }
  }
  if ((m = line.match(re(`${N}% (?:(.+?) )?(Attack|Cast|Base) Speed (Amplification|Dampening)`))) && SPEED_SCOPES.has(m[2] ?? '')) {
    const kind: SpeedKind = m[3] === 'Attack' ? 'attack' : m[3] === 'Cast' ? 'cast' : 'both'
    return { type: 'speed', kind, stack: m[4] === 'Amplification' ? 'amp' : 'damp', scope: m[2] ?? '', value: Number(m[1]) }
  }
  if ((m = line.match(re(`\\+${N}% Speed`)))) return { type: 'speed', kind: 'both', stack: 'inc', scope: '', value: Number(m[1]) }

  // critical
  if ((m = line.match(re(`\\+${N}% (?:(Attack|Spell|Minion|Sentry) )?Critical (?:Rate|Chance)`)))) {
    // "Critical Chance" with % is a flat chance; "Critical Rate" with % scales the rating
    if (line.endsWith('Chance') && !m[2]) return { type: 'critChance', value: Number(m[1]) }
    return { type: 'critRatingInc', scope: m[2] ?? '', value: Number(m[1]) }
  }
  if ((m = line.match(re(`\\+${N} (?:(Attack|Spell|Minion|Sentry) )?Critical Rate`)))) {
    return { type: 'critRating', scope: m[2] ?? '', value: Number(m[1]) }
  }
  if ((m = line.match(re(`\\+${N}% (?:(Attack|Spell|Minion|Sentry) )?Critical DMG`)))) {
    return { type: 'critDmg', scope: m[2] ?? '', value: Number(m[1]) }
  }

  // projectiles, cooldown, cost
  if ((m = line.match(re(`\\+${N} Projectile Count`)))) return { type: 'projectiles', value: Number(m[1]) }
  if ((m = line.match(re(`Projectile Count \\+${N}`)))) return { type: 'projectiles', value: Number(m[1]) }
  if ((m = line.match(re(`\\+${N}% Skill Rune Cooldown Recovery Speed`)))) return { type: 'cdr', value: Number(m[1]) }
  if ((m = line.match(re(`Resource Cost Increase ${N}%`)))) return { type: 'cost', stack: 'inc', value: Number(m[1]) }
  if ((m = line.match(re(`([+-]${N})% Resource Cost`)))) return { type: 'cost', stack: 'inc', value: Number(m[1]) }
  if ((m = line.match(re(`${N}% Resource Cost (Amplification|Dampening)`)))) {
    return { type: 'cost', stack: m[2] === 'Amplification' ? 'amp' : 'damp', value: Number(m[1]) }
  }

  // penetration and enemy debuffs
  if ((m = line.match(re(`\\+${N}(%)? (Armor|Element|DMG|Physical|Fire|Cold|Lightning|Poison|Chaos) Penetration`)))) {
    return { type: 'pen', target: m[3] as PenTarget, pct: !!m[2], value: Number(m[1]) }
  }
  if ((m = line.match(re(`${N}% (Armor|Element Resist) Dampening`)))) {
    return { type: 'resistDamp', target: m[2] === 'Armor' ? 'Armor' : 'Element', value: Number(m[1]) }
  }

  return null
}

export function parseLine(line: string, ctx: LineContext): ParsedLine {
  const text = line.trim()
  const direct = parseCore(text, ctx)
  if (direct) return { line, mod: direct }

  if (SCALING.test(text)) return { line, mod: null, note: 'scaling' }

  // "+249% DMG upon Spell" means damage of Spell skills — a tag scope, not a condition.
  const tagged = text.match(/^(.+) upon (\w[\w ]*)$/)
  if (tagged && DMG_SCOPES.has(tagged[2])) {
    const mod = parseCore(tagged[1], ctx)
    if (mod?.type === 'dmg' && mod.scope === '') return { line, mod: { ...mod, scope: tagged[2] } }
  }

  const cond = text.match(CONDITION)
  if (cond && cond.index) {
    const mod = parseCore(text.slice(0, cond.index), ctx)
    if (mod) return { line, mod, condition: cond[1] }
  }
  return { line, mod: null, note: 'unsupported' }
}
