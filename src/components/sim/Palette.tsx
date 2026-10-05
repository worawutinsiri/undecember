import { useDraggable } from '@dnd-kit/core'
import { useMemo, useState, type ReactNode } from 'react'
import { LINK_RUNES, SKILL_RUNES, UNIQUES } from '../../data'
import type { Rune, UniqueItem } from '../../data/types'
import { CATEGORY_ORDER, gearTypeTh } from '../../i18n/labels'
import { thDescription } from '../../i18n/translate'
import { checkLink } from '../../lib/damage'
import { RuneIcon } from '../RuneIcon'
import type { DragPayload } from './dnd'

type Tab = 'skill' | 'link' | 'item'

// Weapons first, then armor and accessories; highest tier first within a category.
const ITEMS_BY_SLOT = [...UNIQUES].sort(
  (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || (b.tier ?? 0) - (a.tier ?? 0) || a.name.localeCompare(b.name),
)

const TABS: { id: Tab; label: string }[] = [
  { id: 'skill', label: 'รูนสกิล' },
  { id: 'link', label: 'รูนลิงก์' },
  { id: 'item', label: 'ไอเทม' },
]

const runeMatches = (r: Rune, needle: string) =>
  !needle || r.name.toLowerCase().includes(needle) || r.tags.some((t) => t.toLowerCase().includes(needle))

function DraggableEntry({ payload, children, onAdd, dimmed }: { payload: DragPayload; children: ReactNode; onAdd: () => void; dimmed?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette:${payload.kind}:${payload.id}`, data: payload })
  return (
    <li className={`pal-entry ${isDragging ? 'dragging' : ''} ${dimmed ? 'dimmed' : ''}`}>
      <div ref={setNodeRef} className="pal-drag" {...listeners} {...attributes} aria-label={`ลาก ${payload.id}`}>
        {children}
      </div>
      <button className="pal-add" onClick={onAdd} title="ใส่ช่องว่างถัดไป" aria-label="ใส่ช่องว่างถัดไป">
        +
      </button>
    </li>
  )
}

export function Palette({ skillTags, onAdd }: { skillTags: string[] | null; onAdd: (p: DragPayload) => void }) {
  const [tab, setTab] = useState<Tab>('skill')
  const [q, setQ] = useState('')
  const [compatibleOnly, setCompatibleOnly] = useState(true)

  const needle = q.trim().toLowerCase()

  const skills = useMemo(() => SKILL_RUNES.filter((r) => runeMatches(r, needle)), [needle])
  const links = useMemo(
    () =>
      LINK_RUNES.filter((r) => runeMatches(r, needle)).map((r) => ({ rune: r, ok: skillTags ? checkLink(r.linkRules, skillTags).ok : true })),
    [needle, skillTags],
  )
  const items = useMemo(
    () => ITEMS_BY_SLOT.filter((u: UniqueItem) => !needle || u.name.toLowerCase().includes(needle) || u.gearType.toLowerCase().includes(needle) || gearTypeTh(u.gearType).includes(needle)),
    [needle],
  )

  return (
    <div className="palette card">
      <div className="pal-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <input type="search" placeholder="ค้นหา…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นหาในคลัง" />
      {tab === 'link' && skillTags && (
        <label className="check pal-compat">
          <input type="checkbox" checked={compatibleOnly} onChange={(e) => setCompatibleOnly(e.target.checked)} /> เฉพาะที่ลิงก์กับสกิลนี้ได้
        </label>
      )}
      <p className="faint pal-hint">ลากไปวางในช่อง (มือถือ: กดค้างแล้วลาก) หรือกด + เพื่อใส่ช่องว่างถัดไป</p>

      <ul className="pal-list">
        {tab === 'skill' &&
          skills.map((r) => (
            <DraggableEntry key={r.id} payload={{ kind: 'skill', id: r.id }} onAdd={() => onAdd({ kind: 'skill', id: r.id })}>
              <RuneIcon rune={r} size={28} />
              <span className="pal-text">
                <span className="pal-name">{r.name}</span>
                <span className="pal-sub faint">{r.tags.slice(0, 4).join(' · ')}</span>
              </span>
            </DraggableEntry>
          ))}
        {tab === 'link' &&
          links
            .filter((l) => !compatibleOnly || !skillTags || l.ok)
            .map(({ rune: r, ok }) => (
              <DraggableEntry key={r.id} payload={{ kind: 'link', id: r.id }} onAdd={() => onAdd({ kind: 'link', id: r.id })} dimmed={!ok}>
                <RuneIcon rune={r} size={28} />
                <span className="pal-text">
                  <span className="pal-name">{r.name}</span>
                  <span className="pal-sub faint">{thDescription(r.description).split('\n')[0]}</span>
                </span>
              </DraggableEntry>
            ))}
        {tab === 'item' &&
          items.map((u) => (
            <DraggableEntry key={u.id} payload={{ kind: 'item', id: u.id }} onAdd={() => onAdd({ kind: 'item', id: u.id })}>
              <span className={`pal-item-badge ${u.transcendent ? 'tr' : ''}`}>T{u.tier}</span>
              <span className="pal-text">
                <span className="pal-name">{u.name}</span>
                <span className="pal-sub faint">
                  {gearTypeTh(u.gearType)} · Lv.{u.reqLevel}
                </span>
              </span>
            </DraggableEntry>
          ))}
      </ul>
    </div>
  )
}
