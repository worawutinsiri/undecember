export type RuneKind = 'skill' | 'link'
export type RuneColor = 'red' | 'green' | 'blue'
export type RuneGrade = 'normal' | 'magic' | 'rare' | 'legendary'
export type AwakeningTier = 'source' | 'origin' | 'verity'

export interface LinkRuleGroup {
  mode: 'all' | 'any'
  tags: string[]
}

export interface LinkRules {
  groups: LinkRuleGroup[]
  exclude: string[]
  minions: boolean
}

export interface Rune {
  id: string
  name: string
  kind: RuneKind
  /** changed = balance-changed this season, new = added this season */
  status: 'changed' | 'new'
  color: RuneColor | null
  minRarity: string | null
  howToGet: string[]
  description: string
  tags: string[]
  restrictions: string[]
  lv1: string[]
  lv45: string[]
  /** Extra lines per grade at Lv45 (Magic / Rare / Legendary, occasionally Relic). */
  grades: Partial<Record<RuneGrade | 'relic', string[]>>
  awakening: Record<AwakeningTier, string[]>
  linkRules?: LinkRules
  /** Lv45 lines before this season's balance change (only when they differ). */
  prevLv45?: string[]
  /** minor = numbers moved ≤10% (S12's general nudge), major = bigger or structural change. */
  change?: 'minor' | 'major'
}

export type ItemCategory = 'weapon1h' | 'weapon2h' | 'offhand' | 'armor' | 'accessory' | 'other'

export interface UniqueItem {
  id: string
  name: string
  transcendent: boolean
  tier: number | null
  gearType: string
  category: ItemCategory
  reqLevel: number | null
  requirement: string | null
  /** Base stats of the gear (weapon damage, speed, armor…). */
  implicit: string[]
  /** Fixed bonus between base stats and the unique options. */
  innate: string[]
  options: string[]
  season: string
  status: 'changed' | 'new'
}
