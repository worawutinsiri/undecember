import { UNIQUE_BY_ID } from '../../data'
import { CENTER, GEAR_SLOTS, duplicateSkill, focusKey, newCell, type BuildState, type Cells } from '../../lib/buildState'
import type { SlotId } from '../../lib/damage'
import { DIRS, LAYOUTS, hexKey, neighbour, parseKey, type Hex } from '../../lib/hexBoard'
import type { DragPayload, DropTarget } from './dnd'

export type Selection = { type: 'cell'; key: string } | { type: 'gear'; slot: SlotId } | null

const distance = (h: Hex) => (Math.abs(h.q) + Math.abs(h.r) + Math.abs(h.q + h.r)) / 2

export const cellsOf = (b: BuildState) => b.boards[b.mode]
export const withCells = (b: BuildState, cells: Cells): BuildState => ({ ...b, boards: { ...b.boards, [b.mode]: cells } })
export const withFocus = (b: BuildState, key: string | null): BuildState =>
  b.focus[b.mode] === key ? b : { ...b, focus: { ...b.focus, [b.mode]: key }, componentIndex: 0 }

export function canHold(b: BuildState, key: string, kind: 'skill' | 'link') {
  return LAYOUTS[b.mode].accepts(parseKey(key), kind)
}

/**
 * Puts a rune into a cell. Replacing a rune of the same kind keeps its level, grade and awakening.
 * A skill rune already on the board elsewhere is refused, as in the game.
 */
export function placeRune(b: BuildState, kind: 'skill' | 'link', id: string, key: string): BuildState {
  if (!canHold(b, key, kind)) return b
  if (kind === 'skill' && duplicateSkill(cellsOf(b), id, key)) return b
  const cells = { ...cellsOf(b) }
  const prev = cells[key]
  const fresh = newCell(kind, id)
  cells[key] = prev?.kind === kind ? { ...prev, id } : fresh
  const next = withCells(b, cells)
  return kind === 'skill' ? withFocus({ ...next, componentIndex: 0 }, key) : next
}

/** Moves a rune between cells, swapping when the target is occupied. Returns null if not allowed. */
export function moveRune(b: BuildState, from: string, to: string): BuildState | null {
  if (from === to) return b
  const cells = { ...cellsOf(b) }
  const a = cells[from]
  const c = cells[to]
  if (!a || !canHold(b, to, a.kind) || (c && !canHold(b, from, c.kind))) return null
  cells[to] = a
  if (c) cells[from] = c
  else delete cells[from]
  const f = b.focus[b.mode]
  const focus = f === from ? to : f === to && c ? from : f
  return { ...withCells(b, cells), focus: { ...b.focus, [b.mode]: focus } }
}

export function removeRune(b: BuildState, key: string): BuildState {
  const cells = { ...cellsOf(b) }
  delete cells[key]
  return withCells(b, cells)
}

/** The cell the "+" button fills: links go next to the analysed skill, skills to the most central free cell. */
export function autoCell(b: BuildState, kind: 'skill' | 'link'): string | null {
  const cells = cellsOf(b)
  const free = (k: string) => !cells[k] && canHold(b, k, kind)
  if (kind === 'skill' && b.mode === 'single') return CENTER
  if (kind === 'link') {
    const f = focusKey(b)
    if (f) {
      const near = DIRS.map((_, d) => hexKey(neighbour(parseKey(f), d))).find((k) => LAYOUTS[b.mode].cells.some((h) => hexKey(h) === k) && free(k))
      if (near) return near
      if (b.mode === 'single') return null
    }
  }
  const byDistance = [...LAYOUTS[b.mode].cells].sort((x, y) => distance(x) - distance(y)).map(hexKey)
  return byDistance.find(free) ?? null
}

/** Applies a drop. Returns null when the drop isn't allowed. */
export function applyDrop(b: BuildState, payload: DragPayload, target: DropTarget): [BuildState, Selection] | null {
  if (target.type === 'gear') {
    const item = payload.kind === 'item' ? UNIQUE_BY_ID.get(payload.id) : undefined
    const slot = GEAR_SLOTS.find((s) => s.id === target.slot)
    if (!item || !slot?.accepts(item)) return null
    return [{ ...b, gear: { ...b.gear, [target.slot]: payload.id } }, target]
  }
  if (payload.kind === 'item') return null
  const sel: Selection = { type: 'cell', key: target.key }
  if (payload.from) {
    const moved = moveRune(b, payload.from, target.key)
    return moved ? [moved, sel] : null
  }
  if (!canHold(b, target.key, payload.kind)) return null
  return [placeRune(b, payload.kind, payload.id, target.key), sel]
}
