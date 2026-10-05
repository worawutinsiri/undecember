import { RUNE_BY_ID, UNIQUE_BY_ID } from '../data'
import type { AwakeningTier, RuneGrade, UniqueItem } from '../data/types'
import type { RuneSetup, SimInput, SlotId } from './damage'

export const LINK_SOCKETS = 6

export interface PlacedRune {
  id: string
  level: number
  grade: RuneGrade
  awakening: Partial<Record<AwakeningTier, boolean>>
}

export interface BuildState {
  skill: PlacedRune | null
  links: (PlacedRune | null)[]
  gear: Partial<Record<SlotId, string>>
  rollQuality: number
  enabledConditions: string[]
  componentIndex: number
  allProjectilesHit: boolean
  custom: SimInput['custom']
  target: SimInput['target']
}

export interface GearSlotDef {
  id: SlotId
  label: string
  accepts: (item: UniqueItem) => boolean
}

export const GEAR_SLOTS: GearSlotDef[] = [
  { id: 'weapon', label: 'อาวุธ', accepts: (i) => i.category === 'weapon1h' || i.category === 'weapon2h' },
  { id: 'offhand', label: 'อาวุธรอง', accepts: (i) => i.category === 'offhand' },
  { id: 'helmet', label: 'หมวก', accepts: (i) => i.gearType === 'Helmet' },
  { id: 'armor', label: 'เสื้อเกราะ', accepts: (i) => i.gearType === 'Armor' },
  { id: 'spaulders', label: 'เกราะไหล่', accepts: (i) => i.gearType === 'Spaulders' },
  { id: 'gloves', label: 'ถุงมือ', accepts: (i) => i.gearType === 'Gloves' },
  { id: 'belt', label: 'เข็มขัด', accepts: (i) => i.gearType === 'Belt' },
  { id: 'shoes', label: 'รองเท้า', accepts: (i) => i.gearType === 'Shoes' },
  { id: 'necklace', label: 'สร้อยคอ', accepts: (i) => i.gearType === 'Necklace' },
  { id: 'ring1', label: 'แหวน 1', accepts: (i) => i.gearType === 'Ring' },
  { id: 'ring2', label: 'แหวน 2', accepts: (i) => i.gearType === 'Ring' },
]

export const newPlaced = (id: string): PlacedRune => ({ id, level: 45, grade: 'normal', awakening: {} })

export const EMPTY_BUILD: BuildState = {
  skill: null,
  links: Array(LINK_SOCKETS).fill(null),
  gear: {},
  rollQuality: 0.5,
  enabledConditions: [],
  componentIndex: 0,
  allProjectilesHit: false,
  custom: { flatMin: 0, flatMax: 0, incDmg: 0, ampDmg: 0, critRating: 0, critDmg: 0, baseSpeed: 1, incSpeed: 0 },
  target: { level: 100, elementResist: 55, chaosResist: 30, armorReduction: 30 },
}

const STORAGE_KEY = 'ud-sim-build-v1'

/** Drops anything that no longer exists in the data (e.g. after a data update). */
function sanitize(raw: Partial<BuildState>): BuildState {
  const rune = (kind: 'skill' | 'link', p: PlacedRune | null | undefined) =>
    p && RUNE_BY_ID.has(`${kind}:${p.id}`) ? { ...newPlaced(p.id), ...p } : null
  const links = Array.from({ length: LINK_SOCKETS }, (_, i) => rune('link', raw.links?.[i]))
  const gear: BuildState['gear'] = {}
  for (const s of GEAR_SLOTS) {
    const id = raw.gear?.[s.id]
    if (id && UNIQUE_BY_ID.has(id)) gear[s.id] = id
  }
  return {
    ...EMPTY_BUILD,
    ...raw,
    skill: rune('skill', raw.skill),
    links,
    gear,
    custom: { ...EMPTY_BUILD.custom, ...raw.custom },
    target: { ...EMPTY_BUILD.target, ...raw.target },
    enabledConditions: Array.isArray(raw.enabledConditions) ? raw.enabledConditions : [],
  }
}

export function loadBuild(): BuildState {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? sanitize(JSON.parse(s)) : EMPTY_BUILD
  } catch {
    return EMPTY_BUILD
  }
}

export function saveBuild(b: BuildState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
  } catch {
    /* storage unavailable — the build just won't persist */
  }
}

const setup = (kind: 'skill' | 'link', p: PlacedRune | null): RuneSetup | null => {
  const rune = p && RUNE_BY_ID.get(`${kind}:${p.id}`)
  return rune && p ? { rune, level: p.level, grade: p.grade, awakening: p.awakening } : null
}

export function toSimInput(b: BuildState): SimInput {
  const gear: SimInput['gear'] = {}
  for (const [slot, id] of Object.entries(b.gear) as [SlotId, string][]) {
    const item = UNIQUE_BY_ID.get(id)
    if (item) gear[slot] = item
  }
  return {
    skill: setup('skill', b.skill),
    links: b.links.map((l) => setup('link', l)),
    gear,
    rollQuality: b.rollQuality,
    enabledConditions: new Set(b.enabledConditions),
    componentIndex: b.componentIndex,
    allProjectilesHit: b.allProjectilesHit,
    custom: b.custom,
    target: b.target,
  }
}
