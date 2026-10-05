import { MAX_RUNE_LEVEL, RUNE_BY_ID, UNIQUE_BY_ID } from '../data'
import type { AwakeningTier, Rune, RuneGrade, UniqueItem } from '../data/types'
import type { RuneSetup, SimInput, SlotId } from './damage'
import { ALL_WHITE, DIRS, LAYOUTS, connect, hexKey, neighbour, parseKey, type BoardMode, type Connection, type SlotColor } from './hexBoard'

export interface PlacedRune {
  id: string
  level: number
  grade: RuneGrade
  awakening: Partial<Record<AwakeningTier, boolean>>
}

export interface CellRune extends PlacedRune {
  kind: 'skill' | 'link'
  /** Skill runes only: colour of the link slot in each of the six directions. */
  slots?: SlotColor[]
}

/** Board contents keyed by hexKey ("q,r"). */
export type Cells = Record<string, CellRune>

export interface BuildState {
  mode: BoardMode
  boards: Record<BoardMode, Cells>
  /** The skill cell whose damage is shown, per board. */
  focus: Record<BoardMode, string | null>
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

export const CENTER = '0,0'

export function newCell(kind: 'skill' | 'link', id: string): CellRune {
  return { kind, id, level: 45, grade: 'normal', awakening: {}, ...(kind === 'skill' ? { slots: [...ALL_WHITE] } : {}) }
}

export const EMPTY_BUILD: BuildState = {
  mode: 'single',
  boards: { single: {}, full: {} },
  focus: { single: CENTER, full: null },
  gear: {},
  rollQuality: 0.5,
  enabledConditions: [],
  componentIndex: 0,
  allProjectilesHit: false,
  custom: { flatMin: 0, flatMax: 0, incDmg: 0, ampDmg: 0, critRating: 0, critDmg: 0, baseSpeed: 1, incSpeed: 0 },
  target: { level: 100, elementResist: 55, chaosResist: 30, armorReduction: 30 },
}

export const runeOf = (c: CellRune | undefined): Rune | undefined => (c ? RUNE_BY_ID.get(`${c.kind}:${c.id}`) : undefined)

// ---------------------------------------------------------------- board queries

export const skillKeys = (cells: Cells) => Object.keys(cells).filter((k) => cells[k].kind === 'skill')

/** The game won't equip the same skill rune twice: the other cell holding it, if any. */
export const duplicateSkill = (cells: Cells, id: string, key: string) =>
  Object.keys(cells).find((k) => k !== key && cells[k].kind === 'skill' && cells[k].id === id) ?? null

/** The skill cell being analysed: the chosen one if it still holds a skill, else the first skill on the board. */
export function focusKey(build: BuildState): string | null {
  const cells = build.boards[build.mode]
  const f = build.focus[build.mode]
  if (f && cells[f]?.kind === 'skill') return f
  return skillKeys(cells)[0] ?? null
}

export interface LinkInfo {
  key: string
  dir: number
  cell: CellRune
  rune: Rune
  connection: Connection
  /** A white slot gives the linked rune +1 level. */
  bonusLevel: number
}

/** Link runes adjacent to a skill cell, with whether each one actually links. */
export function linksOf(cells: Cells, skillKey: string): LinkInfo[] {
  const skillCell = cells[skillKey]
  const skill = runeOf(skillCell)
  if (!skill || skillCell.kind !== 'skill') return []
  const at = parseKey(skillKey)
  const slots = skillCell.slots ?? ALL_WHITE
  const out: LinkInfo[] = []
  DIRS.forEach((_, dir) => {
    const key = hexKey(neighbour(at, dir))
    const cell = cells[key]
    const rune = runeOf(cell)
    if (!cell || cell.kind !== 'link' || !rune) return
    let connection = connect(rune, skill, slots, dir)
    // the same link rune twice on one skill only counts once
    if (connection.ok && out.some((o) => o.connection.ok && o.rune.id === rune.id)) {
      connection = { ok: false, reason: `${rune.name} ซ้ำกับอีกช่องที่ลิงก์กับ ${skill.name} อยู่แล้ว (ไม่นับซ้ำ)` }
    }
    out.push({ key, dir, cell, rune, connection, bonusLevel: connection.ok && slots[dir] === 'white' ? 1 : 0 })
  })
  return out
}

/** Skill cells adjacent to a cell (the skills a link rune placed there would serve). */
export function adjacentSkills(cells: Cells, key: string): { key: string; dirFromSkill: number; cell: CellRune; rune: Rune }[] {
  const at = parseKey(key)
  return DIRS.flatMap((_, dir) => {
    const k = hexKey(neighbour(at, dir))
    const cell = cells[k]
    const rune = runeOf(cell)
    // seen from the skill, this cell lies in the opposite direction
    return cell?.kind === 'skill' && rune ? [{ key: k, dirFromSkill: (dir + 3) % 6, cell, rune }] : []
  })
}

// ---------------------------------------------------------------- persistence

const STORAGE_KEY = 'ud-sim-build-v2'
const LEGACY_KEY = 'ud-sim-build-v1'

/** Drops anything that no longer exists in the data or on the layout. */
function sanitizeCells(mode: BoardMode, raw: unknown): Cells {
  const layout = LAYOUTS[mode]
  const valid = new Set(layout.cells.map(hexKey))
  const out: Cells = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [key, c] of Object.entries(raw as Record<string, CellRune>)) {
    if (!valid.has(key) || !c || (c.kind !== 'skill' && c.kind !== 'link')) continue
    if (!RUNE_BY_ID.has(`${c.kind}:${c.id}`) || !layout.accepts(parseKey(key), c.kind)) continue
    const base = newCell(c.kind, c.id)
    out[key] = { ...base, ...c, ...(c.kind === 'skill' ? { slots: Array.isArray(c.slots) && c.slots.length === 6 ? c.slots : base.slots } : {}) }
  }
  return out
}

function sanitize(raw: Partial<BuildState>): BuildState {
  const gear: BuildState['gear'] = {}
  for (const s of GEAR_SLOTS) {
    const id = raw.gear?.[s.id]
    if (id && UNIQUE_BY_ID.has(id)) gear[s.id] = id
  }
  return {
    ...EMPTY_BUILD,
    ...raw,
    mode: raw.mode === 'full' ? 'full' : 'single',
    boards: { single: sanitizeCells('single', raw.boards?.single), full: sanitizeCells('full', raw.boards?.full) },
    focus: { ...EMPTY_BUILD.focus, ...raw.focus },
    gear,
    custom: { ...EMPTY_BUILD.custom, ...raw.custom },
    target: { ...EMPTY_BUILD.target, ...raw.target },
    enabledConditions: Array.isArray(raw.enabledConditions) ? raw.enabledConditions : [],
  }
}

/** v1 kept one skill and six links in a fixed order (E, SE, SW, W, NW, NE — the DIRS order). */
function migrateV1(old: { skill?: PlacedRune | null; links?: (PlacedRune | null)[] } & Partial<BuildState>): BuildState {
  const single: Cells = {}
  if (old.skill) single[CENTER] = { ...newCell('skill', old.skill.id), ...old.skill, kind: 'skill' }
  old.links?.forEach((l, i) => {
    if (l) single[hexKey(DIRS[i])] = { ...newCell('link', l.id), ...l, kind: 'link' }
  })
  const { skill: _s, links: _l, ...rest } = old
  return sanitize({ ...rest, boards: { single, full: {} } })
}

export function loadBuild(): BuildState {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s) return sanitize(JSON.parse(s))
    const legacy = localStorage.getItem(LEGACY_KEY)
    return legacy ? migrateV1(JSON.parse(legacy)) : EMPTY_BUILD
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

// ---------------------------------------------------------------- simulator input

const setup = (c: CellRune, rune: Rune, blocked?: string, bonusLevel = 0): RuneSetup => ({
  rune,
  level: Math.min(MAX_RUNE_LEVEL, c.level + bonusLevel),
  grade: c.grade,
  awakening: c.awakening,
  blocked,
})

export function toSimInput(b: BuildState, skillKey: string | null = focusKey(b)): SimInput {
  const cells = b.boards[b.mode]
  const skillCell = skillKey ? cells[skillKey] : undefined
  const skillRune = runeOf(skillCell)
  const gear: SimInput['gear'] = {}
  for (const [slot, id] of Object.entries(b.gear) as [SlotId, string][]) {
    const item = UNIQUE_BY_ID.get(id)
    if (item) gear[slot] = item
  }
  return {
    skill: skillCell && skillRune ? setup(skillCell, skillRune) : null,
    links: skillKey ? linksOf(cells, skillKey).map((l) => setup(l.cell, l.rune, l.connection.ok ? undefined : l.connection.reason, l.bonusLevel)) : [],
    gear,
    rollQuality: b.rollQuality,
    enabledConditions: new Set(b.enabledConditions),
    componentIndex: b.componentIndex,
    allProjectilesHit: b.allProjectilesHit,
    custom: b.custom,
    target: b.target,
  }
}
