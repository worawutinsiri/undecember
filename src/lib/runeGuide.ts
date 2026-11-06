// Answers "which link runes go on this skill?" for the home page guide.
// Stricter than checkLink, which reads only tag rules: this also reads a skill's restrictions and the
// rules that exist only in a rune's description (cooldown, use count, trigger runes).
import { LINK_RUNES } from '../data'
import type { AwakeningTier, Rune } from '../data/types'
import { checkLink } from './damage'
import { gradeLines } from './runeLevel'

export type DamageKind = 'hit' | 'dot' | 'mixed' | 'other'

export function damageKind(skill: Rune): DamageKind {
  const strike = skill.tags.includes('Strike')
  const dot = skill.tags.includes('DoT')
  if (strike && dot) return 'mixed'
  if (strike) return 'hit'
  return dot ? 'dot' : 'other'
}

const list = (text: string) =>
  text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

// Rune text uses these words where skills carry different tags.
const TAG_ALIASES: Record<string, string[]> = { Channeling: ['Channel'], Enhance: ['Attack Enhance', 'Defense Enhance'] }
const expand = (tag: string) => TAG_ALIASES[tag] ?? [tag]

const TRIGGER = /Must link (?:an Activation\((.+?)\) Skill and )?a Target\((.+?)\) Skill/
const TARGET_EXCLUDE = /Target Skill cannot be linked if any of the (.+?) tags exist/

export interface TriggerRoles {
  /** This skill can set the rune off. */
  activator: boolean
  /** This skill can be the one the rune casts. */
  target: boolean
}

/** The roles this skill can take on a trigger rune, or null when the rune is not a trigger rune. */
export function triggerRoles(link: Rune, skill: Rune): TriggerRoles | null {
  const m = TRIGGER.exec(link.description)
  if (!m) return null
  const has = (tag: string) => expand(tag).some((t) => skill.tags.includes(t))
  const excluded = list(TARGET_EXCLUDE.exec(link.description)?.[1] ?? '').some(has)
  return { activator: !!m[1] && list(m[1]).every(has), target: list(m[2]).some(has) && !excluded }
}

export interface LinkFit {
  ok: boolean
  reason?: string
}

/** Rules for the two runes whose wording the data build cannot parse (Time Warp, Convert Physical Damage). */
function sentenceRules(description: string, tokens: string[]): LinkFit {
  const both = /skills that are any one of (.+?) and are any one of (.+)/.exec(description)
  for (const group of both ? [both[1], both[2]] : []) {
    if (!list(group).some((t) => tokens.includes(t))) return { ok: false, reason: `ต้องมีแท็ก ${list(group).join(' หรือ ')}` }
  }
  const excluded = /^Cannot be linked with (?!Skills that)(.+?) [Ss]kills\.?$/m.exec(description)?.[1] ?? ''
  const bad = list(excluded)
    .flatMap(expand)
    .find((t) => tokens.includes(t))
  return bad ? { ok: false, reason: `ลิงก์กับสกิลแท็ก ${bad} ไม่ได้` } : { ok: true }
}

// "Applies to Minions when linked to Summon Skill" lets these runes onto summons, which have no such tags.
const SUMMON_COUNTS_AS = ['Attack', 'Spell', 'Strike', 'DoT']

/** Can this non-trigger link rune go on this skill? */
export function linkFit(link: Rune, skill: Rune): LinkFit {
  const d = link.description
  const summon = skill.tags.includes('Minion') && !!link.linkRules?.minions
  const tokens = [...skill.tags, ...skill.restrictions, ...(summon ? SUMMON_COUNTS_AS : [])]
  const byTags = link.linkRules?.groups.length ? checkLink(link.linkRules, tokens) : sentenceRules(d, tokens)
  if (!byTags.ok) return byTags
  const hasCooldown = skill.lv45.some((l) => /^Cooldown /.test(l))
  if (/Skills that have cooldown/.test(d) && !hasCooldown) return { ok: false, reason: 'ต้องเป็นสกิลที่มีคูลดาวน์' }
  if (/Skills that don't have cooldown/.test(d) && hasCooldown) return { ok: false, reason: 'ต้องเป็นสกิลที่ไม่มีคูลดาวน์' }
  if (/Use Count Skills/.test(d) && !skill.lv45.some((l) => /Max Use Count/.test(l))) return { ok: false, reason: 'ต้องเป็นสกิลที่มีจำนวนครั้งใช้งาน' }
  return { ok: true }
}

export interface AwakeningLink {
  tier: AwakeningTier
  rune: string
  /** Awakening gives this link rune's effect for free. */
  grants: boolean
  /** Awakening stops this link rune being linked. */
  forbids: boolean
}

/** Link runes a skill's awakening lines grant or forbid. */
export function awakeningLinks(skill: Rune): AwakeningLink[] {
  const found = new Map<string, AwakeningLink>()
  for (const tier of ['source', 'origin', 'verity'] as const) {
    for (const line of skill.awakening[tier]) {
      const grant = /^Gain (.+?) Link Rune Effect/.exec(line)?.[1]
      const forbid = /^Cannot link (.+?) Link Rune/.exec(line)?.[1]
      const rune = grant ?? forbid
      if (!rune) continue
      const entry = found.get(`${tier}:${rune}`) ?? { tier, rune, grants: false, forbids: false }
      found.set(`${tier}:${rune}`, { ...entry, grants: entry.grants || !!grant, forbids: entry.forbids || !!forbid })
    }
  }
  return [...found.values()]
}

/** What a link rune does at Lv45 Legendary, without its cost line. */
export const effectLines = (link: Rune) => [...link.lv45, ...gradeLines(link, 'legendary')].filter((l) => !/^Resource Cost Increase \d/.test(l))

export const resourceCost = (link: Rune) => /^Resource Cost Increase (.+)$/.exec(link.lv45.find((l) => /^Resource Cost Increase \d/.test(l)) ?? '')?.[1]

export const LINK_GROUPS = [
  { id: 'dmg', label: 'เพิ่มดาเมจ', pattern: /^\+[\d.-]+%? .*DMG/ },
  { id: 'amp', label: 'ขยายดาเมจ', pattern: /DMG Amplification|DoT Amplification/ },
  { id: 'crit', label: 'คริติคอล', pattern: /Critical/ },
  { id: 'max', label: 'Maximized', pattern: /Maximi[sz]/ },
  { id: 'dot', label: 'DoT', pattern: /\bDoT\b/ },
  { id: 'status', label: 'สถานะผิดปกติ', pattern: /Status Effect|Burn|Bleed|Venom|Shock|Chill|Freeze|Stun|Wound|Blind|Bind/ },
  { id: 'pen', label: 'เจาะค่าต้าน', pattern: /Penetration/ },
  { id: 'speed', label: 'ความเร็ว', pattern: /(Attack|Cast) Speed/ },
  { id: 'shape', label: 'จำนวนลูกและพื้นที่', pattern: /Projectile Count|Pierce|Chain|Area of Effect|Split|Weapon Range/ },
  { id: 'cost', label: 'มานา', pattern: /Resource Cost|Mana/ },
] as const

export type LinkGroupId = (typeof LINK_GROUPS)[number]['id']

export const groupsOf = (link: Rune): LinkGroupId[] => LINK_GROUPS.filter((g) => effectLines(link).some((l) => g.pattern.test(l))).map((g) => g.id)

export interface LinkAnalysis {
  usable: Rune[]
  triggers: { rune: Rune; roles: TriggerRoles }[]
  /** Runes that cannot go on this skill, grouped by the reason. */
  blocked: { reason: string; runes: Rune[] }[]
}

export function analyseLinks(skill: Rune, links: readonly Rune[] = LINK_RUNES): LinkAnalysis {
  const usable: Rune[] = []
  const triggers: LinkAnalysis['triggers'] = []
  const blocked = new Map<string, Rune[]>()
  const block = (reason: string, rune: Rune) => blocked.set(reason, [...(blocked.get(reason) ?? []), rune])
  for (const rune of links) {
    const roles = triggerRoles(rune, skill)
    if (roles) {
      if (roles.activator || roles.target) triggers.push({ rune, roles })
      else block('เป็นทั้งตัวเปิดและสกิลที่ถูกร่ายไม่ได้', rune)
      continue
    }
    const fit = linkFit(rune, skill)
    if (fit.ok) usable.push(rune)
    else block(fit.reason ?? 'ลิงก์ไม่ได้', rune)
  }
  return {
    usable,
    triggers,
    blocked: [...blocked.entries()].map(([reason, runes]) => ({ reason, runes })).sort((a, b) => b.runes.length - a.runes.length),
  }
}
