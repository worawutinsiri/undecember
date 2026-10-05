// Hex geometry for the Rune Cast board: pointy-top hexes in axial coordinates (q, r).
// Directions run clockwise from the right, matching the order of a skill rune's six link slots.
import type { Rune, RuneColor } from '../data/types'
import { checkLink } from './damage'

export interface Hex {
  q: number
  r: number
}

export type DirIndex = 0 | 1 | 2 | 3 | 4 | 5
export const DIRS: readonly Hex[] = [
  { q: 1, r: 0 }, // E
  { q: 0, r: 1 }, // SE
  { q: -1, r: 1 }, // SW
  { q: -1, r: 0 }, // W
  { q: 0, r: -1 }, // NW
  { q: 1, r: -1 }, // NE
]
export const DIR_TH = ['ขวา', 'ขวาล่าง', 'ซ้ายล่าง', 'ซ้าย', 'ซ้ายบน', 'ขวาบน'] as const

export const hexKey = (h: Hex) => `${h.q},${h.r}`
export function parseKey(key: string): Hex {
  const [q, r] = key.split(',').map(Number)
  return { q, r }
}

export const neighbour = (h: Hex, d: number): Hex => ({ q: h.q + DIRS[d].q, r: h.r + DIRS[d].r })

/** Direction index from a to b when they are adjacent, else -1. */
export function directionTo(a: Hex, b: Hex): number {
  return DIRS.findIndex((d) => a.q + d.q === b.q && a.r + d.r === b.r)
}

/** Centre of a hex in units of the centre-to-centre distance. */
export function hexCenter(h: Hex): { x: number; y: number } {
  return { x: h.q + h.r / 2, y: (Math.sqrt(3) / 2) * h.r }
}

/** All cells within `radius` steps of the origin (radius 1 = 7 cells, 3 = 37 cells). */
export function hexagon(radius: number): Hex[] {
  const cells: Hex[] = []
  for (let r = -radius; r <= radius; r++) {
    for (let q = Math.max(-radius, -r - radius); q <= Math.min(radius, -r + radius); q++) cells.push({ q, r })
  }
  return cells
}

/**
 * The in-game Rune Cast: rows of 5,6,7,8,7,6,5 = 44 cells (row length 8 − |r|), centred on x = 0.5.
 * The first and last cell of every row (14 in all) are expansion cells unlocked with Traum's Crystal;
 * the other 30 are open from the start.
 */
export function runeCastCells(): { cells: Hex[]; expansion: Set<string> } {
  const cells: Hex[] = []
  const expansion = new Set<string>()
  for (let r = -3; r <= 3; r++) {
    const len = 8 - Math.abs(r)
    const start = 0.5 - (len - 1) / 2 - r / 2
    for (let i = 0; i < len; i++) {
      const h = { q: start + i, r }
      cells.push(h)
      if (i === 0 || i === len - 1) expansion.add(hexKey(h))
    }
  }
  return { cells, expansion }
}
const RUNE_CAST = runeCastCells()

export type BoardMode = 'single' | 'full'

export interface BoardLayout {
  mode: BoardMode
  cells: Hex[]
  /** Cells that must be unlocked in the game (shown differently, still usable). */
  expansion: Set<string>
  /** Which rune kinds a cell accepts; the single-skill layout pins the skill to the centre. */
  accepts: (h: Hex, kind: 'skill' | 'link') => boolean
}

export const LAYOUTS: Record<BoardMode, BoardLayout> = {
  single: {
    mode: 'single',
    cells: hexagon(1),
    expansion: new Set(),
    accepts: (h, kind) => (h.q === 0 && h.r === 0 ? kind === 'skill' : kind === 'link'),
  },
  full: {
    mode: 'full',
    cells: RUNE_CAST.cells,
    expansion: RUNE_CAST.expansion,
    accepts: () => true,
  },
}

// ---------------------------------------------------------------- link slots

/** A skill rune's link slot in one direction: a colour, white (any colour) or closed. */
export type SlotColor = RuneColor | 'white' | 'closed'
export const SLOT_CYCLE: SlotColor[] = ['white', 'red', 'green', 'blue', 'closed']
export const SLOT_TH: Record<SlotColor, string> = {
  white: 'ขาว (ทุกสี +1 เลเวล)',
  red: 'แดง',
  green: 'เขียว',
  blue: 'น้ำเงิน',
  closed: 'ปิดอยู่',
}
export const ALL_WHITE: SlotColor[] = ['white', 'white', 'white', 'white', 'white', 'white']

export interface Connection {
  ok: boolean
  reason?: string
}

/**
 * Can `link` (sitting in direction `dir` of the skill) link to `skill`?
 * The slot in that direction must be open and match the link rune's colour (white matches any),
 * and the link rune's tag rules must accept the skill.
 */
export function connect(link: Rune, skill: Rune, slots: readonly SlotColor[], dir: number): Connection {
  const slot = slots[dir] ?? 'white'
  if (slot === 'closed') return { ok: false, reason: `ช่องลิงก์ทิศ${DIR_TH[dir]}ของ ${skill.name} ปิดอยู่` }
  if (slot !== 'white' && link.color && link.color !== slot) {
    return { ok: false, reason: `สีไม่ตรง: ช่อง${SLOT_TH[slot]} แต่รูนเป็นสี${SLOT_TH[link.color]}` }
  }
  const tags = checkLink(link.linkRules, skill.tags)
  return tags.ok ? { ok: true } : { ok: false, reason: tags.reason }
}
