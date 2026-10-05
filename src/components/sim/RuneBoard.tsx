import { useDndContext, useDroppable } from '@dnd-kit/core'
import type { CSSProperties } from 'react'
import { RUNE_BY_ID } from '../../data'
import { GRADE_TH } from '../../i18n/labels'
import type { PlacedRune } from '../../lib/buildState'
import { checkLink, type SlotId } from '../../lib/damage'
import { accepts, dropId, type DragPayload, type DropTarget } from './dnd'

export type Selection = { type: 'skill' } | { type: 'link'; index: number } | { type: 'gear'; slot: SlotId } | null

// Pointy-top hex neighbours, clockwise from the right.
const NEIGHBOUR_ANGLES = [0, 60, 120, 180, 240, 300]

function Socket({
  target,
  placed,
  invalid,
  selected,
  onSelect,
  style,
  emptyLabel,
}: {
  target: DropTarget
  placed: PlacedRune | null
  invalid?: string
  selected: boolean
  onSelect: () => void
  style?: CSSProperties
  emptyLabel: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dropId(target), data: target })
  const { active } = useDndContext()
  const can = accepts(target, active?.data.current as DragPayload | undefined)
  const kind = target.type === 'skill' ? 'skill' : 'link'
  const rune = placed ? RUNE_BY_ID.get(`${kind}:${placed.id}`) : undefined

  const cls = [
    'hex',
    kind,
    rune ? `filled c-${rune.color ?? 'none'}` : 'empty',
    active && can ? 'can-drop' : '',
    isOver && can ? 'over' : '',
    invalid ? 'invalid' : '',
    selected ? 'selected' : '',
    placed && placed.grade !== 'normal' ? `g-${placed.grade}` : '',
  ].join(' ')

  return (
    <button ref={setNodeRef} className={cls} style={style} onClick={onSelect} title={invalid ?? rune?.name ?? emptyLabel}>
      <span className="hex-inner">
        {rune ? (
          <>
            <span className="hex-name">{rune.name}</span>
            <span className="hex-level mono">
              Lv.{placed!.level}
              {placed!.grade !== 'normal' && ` · ${GRADE_TH[placed!.grade]}`}
            </span>
            {invalid && <span className="hex-warn">ลิงก์ไม่ได้</span>}
          </>
        ) : (
          <span className="hex-empty">{emptyLabel}</span>
        )}
      </span>
    </button>
  )
}

export function RuneBoard({
  skill,
  links,
  selection,
  onSelect,
}: {
  skill: PlacedRune | null
  links: (PlacedRune | null)[]
  selection: Selection
  onSelect: (s: Selection) => void
}) {
  const skillRune = skill ? RUNE_BY_ID.get(`skill:${skill.id}`) : undefined
  return (
    <div className="rune-board" aria-label="กระดานรูน">
      <Socket
        target={{ type: 'skill' }}
        placed={skill}
        selected={selection?.type === 'skill'}
        onSelect={() => onSelect({ type: 'skill' })}
        emptyLabel="วางรูนสกิล"
        style={{ left: '50%', top: '50%' }}
      />
      {NEIGHBOUR_ANGLES.map((deg, i) => {
        const placed = links[i]
        const linkRune = placed ? RUNE_BY_ID.get(`link:${placed.id}`) : undefined
        const check = skillRune && linkRune ? checkLink(linkRune.linkRules, skillRune.tags) : { ok: true }
        const rad = (deg * Math.PI) / 180
        return (
          <Socket
            key={i}
            target={{ type: 'link', index: i }}
            placed={placed}
            invalid={check.ok ? undefined : check.reason}
            selected={selection?.type === 'link' && selection.index === i}
            onSelect={() => onSelect({ type: 'link', index: i })}
            emptyLabel="รูนลิงก์"
            style={{
              left: `calc(50% + ${Math.cos(rad)} * var(--hex-step))`,
              top: `calc(50% + ${Math.sin(rad)} * var(--hex-step))`,
            }}
          />
        )
      })}
    </div>
  )
}
