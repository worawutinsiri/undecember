import { useDndContext, useDroppable } from '@dnd-kit/core'
import { UNIQUE_BY_ID } from '../../data'
import { GEAR_SLOTS, type GearSlotDef } from '../../lib/buildState'
import type { SlotId } from '../../lib/damage'
import { accepts, dropId, type DragPayload, type DropTarget } from './dnd'
import type { Selection } from './RuneBoard'

function Slot({ def, itemId, selected, onSelect }: { def: GearSlotDef; itemId?: string; selected: boolean; onSelect: () => void }) {
  const target: DropTarget = { type: 'gear', slot: def.id }
  const { setNodeRef, isOver } = useDroppable({ id: dropId(target), data: target })
  const { active } = useDndContext()
  const can = accepts(target, active?.data.current as DragPayload | undefined)
  const item = itemId ? UNIQUE_BY_ID.get(itemId) : undefined
  return (
    <button
      ref={setNodeRef}
      className={`gear-slot ${item ? 'filled' : 'empty'} ${item?.transcendent ? 'tr' : ''} ${active && can ? 'can-drop' : ''} ${isOver && can ? 'over' : ''} ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <span className="gs-label faint">{def.label}</span>
      {item ? (
        <>
          <span className="gs-name">{item.name}</span>
          <span className="gs-sub faint mono">
            T{item.tier} · Lv.{item.reqLevel}
          </span>
        </>
      ) : (
        <span className="gs-empty faint">ว่าง</span>
      )}
    </button>
  )
}

export function GearSlots({ gear, selection, onSelect }: { gear: Partial<Record<SlotId, string>>; selection: Selection; onSelect: (s: Selection) => void }) {
  return (
    <div className="gear-slots" aria-label="อุปกรณ์">
      {GEAR_SLOTS.map((def) => (
        <Slot
          key={def.id}
          def={def}
          itemId={gear[def.id]}
          selected={selection?.type === 'gear' && selection.slot === def.id}
          onSelect={() => onSelect({ type: 'gear', slot: def.id })}
        />
      ))}
    </div>
  )
}
