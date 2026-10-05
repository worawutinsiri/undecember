import { pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core'
import { LINK_RUNES, SKILL_RUNES, UNIQUE_BY_ID } from '../../data'
import { GEAR_SLOTS } from '../../lib/buildState'
import type { SlotId } from '../../lib/damage'

/** What is being dragged out of the palette. */
export interface DragPayload {
  kind: 'skill' | 'link' | 'item'
  id: string
}

/** Where it can be dropped: the skill socket, a link socket, or a gear slot. */
export type DropTarget = { type: 'skill' } | { type: 'link'; index: number } | { type: 'gear'; slot: SlotId }

export const dropId = (t: DropTarget) => (t.type === 'skill' ? 'skill' : t.type === 'link' ? `link-${t.index}` : `gear-${t.slot}`)

export function accepts(target: DropTarget, payload: DragPayload | null | undefined): boolean {
  if (!payload) return false
  if (target.type === 'skill') return payload.kind === 'skill'
  if (target.type === 'link') return payload.kind === 'link'
  const item = payload.kind === 'item' ? UNIQUE_BY_ID.get(payload.id) : undefined
  const slot = GEAR_SLOTS.find((s) => s.id === target.slot)
  return !!item && !!slot?.accepts(item)
}

/**
 * Only targets that accept the dragged thing take part, and the pointer position wins over
 * rectangle overlap — the hex sockets' bounding boxes overlap each other around the centre.
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
