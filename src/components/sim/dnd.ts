import { pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core'
import { LINK_RUNES, SKILL_RUNES, UNIQUE_BY_ID } from '../../data'
import { GEAR_SLOTS } from '../../lib/buildState'
import type { SlotId } from '../../lib/damage'

/** What is being dragged: a palette entry, or a rune already on the board (`from` = its cell). */
export interface DragPayload {
  kind: 'skill' | 'link' | 'item'
  id: string
  from?: string
}

/** Where it can be dropped: a board cell (with the rune kinds it takes) or a gear slot. */
export type DropTarget = { type: 'cell'; key: string; kinds: ('skill' | 'link')[] } | { type: 'gear'; slot: SlotId }

export const dropId = (t: DropTarget) => (t.type === 'cell' ? `cell-${t.key}` : `gear-${t.slot}`)

export function accepts(target: DropTarget, payload: DragPayload | null | undefined): boolean {
  if (!payload) return false
  if (target.type === 'cell') return payload.kind !== 'item' && target.kinds.includes(payload.kind)
  const item = payload.kind === 'item' ? UNIQUE_BY_ID.get(payload.id) : undefined
  const slot = GEAR_SLOTS.find((s) => s.id === target.slot)
  return !!item && !!slot?.accepts(item)
}

/**
 * Only targets that accept the dragged thing take part, and the pointer position wins over
 * rectangle overlap — the hex cells' bounding boxes overlap their neighbours'.
 */
export const collision: CollisionDetection = (args) => {
  const payload = args.active.data.current as DragPayload | undefined
  const droppableContainers = args.droppableContainers.filter((c) => accepts(c.data.current as DropTarget, payload))
  const within = pointerWithin({ ...args, droppableContainers })
  return within.length ? within : rectIntersection({ ...args, droppableContainers })
}

export function payloadName(p: DragPayload): string {
  if (p.kind === 'item') return UNIQUE_BY_ID.get(p.id)?.name ?? p.id
  return (p.kind === 'skill' ? SKILL_RUNES : LINK_RUNES).find((r) => r.id === p.id)?.name ?? p.id
}
