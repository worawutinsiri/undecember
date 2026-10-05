import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RUNE_BY_ID, UNIQUE_BY_ID } from '../data'
import { Editor } from '../components/sim/Editor'
import { GearSlots } from '../components/sim/GearSlots'
import { Palette } from '../components/sim/Palette'
import { ResultPanel } from '../components/sim/ResultPanel'
import { RuneBoard, type Selection } from '../components/sim/RuneBoard'
import { SettingsPanel } from '../components/sim/SettingsPanel'
import { accepts, collision, payloadName, type DragPayload, type DropTarget } from '../components/sim/dnd'
import { EMPTY_BUILD, GEAR_SLOTS, loadBuild, newPlaced, saveBuild, toSimInput, type BuildState } from '../lib/buildState'
import { simulate } from '../lib/damage'
import './SimulatorPage.css'

/** Puts a palette entry into a drop target. Returns the new build and what to select. */
function place(build: BuildState, payload: DragPayload, target: DropTarget): [BuildState, Selection] {
  if (target.type === 'skill') return [{ ...build, skill: newPlaced(payload.id), componentIndex: 0 }, target]
  if (target.type === 'link') return [{ ...build, links: build.links.map((l, i) => (i === target.index ? newPlaced(payload.id) : l)) }, target]
  return [{ ...build, gear: { ...build.gear, [target.slot]: payload.id } }, target]
}

/** The first sensible target for the "+" button: an empty socket/slot, else the first that accepts it. */
function autoTarget(build: BuildState, payload: DragPayload): DropTarget | null {
  if (payload.kind === 'skill') return { type: 'skill' }
  if (payload.kind === 'link') {
    const i = build.links.findIndex((l) => !l)
    return i >= 0 ? { type: 'link', index: i } : null
  }
  const item = UNIQUE_BY_ID.get(payload.id)
  if (!item) return null
  const slots = GEAR_SLOTS.filter((s) => s.accepts(item))
  const free = slots.find((s) => !build.gear[s.id]) ?? slots[0]
  return free ? { type: 'gear', slot: free.id } : null
}

/** Saved build, plus the rune passed as "?add=skill:fire-ball" from the runes page. */
function initialState(add: string | null): { build: BuildState; selection: Selection } {
  const build = loadBuild()
  const [kind, id] = add?.split(':') ?? []
  if ((kind !== 'skill' && kind !== 'link') || !RUNE_BY_ID.has(`${kind}:${id}`)) return { build, selection: null }
  const target = autoTarget(build, { kind, id })
  if (!target) return { build, selection: null }
  const [next, selection] = place(build, { kind, id }, target)
  return { build: next, selection }
}

export function SimulatorPage() {
  const [params, setParams] = useSearchParams()
  const [initial] = useState(() => initialState(params.get('add')))
  const [build, setBuild] = useState<BuildState>(initial.build)
  const [selection, setSelection] = useState<Selection>(initial.selection)
  const [dragging, setDragging] = useState<DragPayload | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => saveBuild(build), [build])

  // The "?add=" param has been applied by initialState; drop it so a reload doesn't add it again.
  useEffect(() => {
    if (!params.has('add')) return
    const next = new URLSearchParams(params)
    next.delete('add')
    setParams(next, { replace: true })
  }, [params, setParams])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // long-press to drag on touch screens, so a quick swipe still scrolls the palette
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const input = useMemo(() => toSimInput(build), [build])
  const result = useMemo(() => simulate(input), [input])
  const skillTags = useMemo(() => (build.skill ? (RUNE_BY_ID.get(`skill:${build.skill.id}`)?.tags ?? null) : null), [build.skill])

  const flash = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice((n) => (n === msg ? null : n)), 2500)
  }

  const onDragStart = (e: DragStartEvent) => setDragging((e.active.data.current as DragPayload) ?? null)
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null)
    const payload = e.active.data.current as DragPayload | undefined
    const target = e.over?.data.current as DropTarget | undefined
    if (!payload || !target) return
    if (!accepts(target, payload)) {
      flash('วางช่องนี้ไม่ได้')
      return
    }
    const [next, sel] = place(build, payload, target)
    setBuild(next)
    setSelection(sel)
  }

  const onAdd = (payload: DragPayload) => {
    const target = autoTarget(build, payload)
    if (!target) {
      flash(payload.kind === 'link' ? 'ช่องรูนลิงก์เต็มแล้ว — ถอดออกก่อน' : 'ไม่มีช่องที่ใส่ได้')
      return
    }
    const [next, sel] = place(build, payload, target)
    setBuild(next)
    setSelection(sel)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="sim-head">
        <div>
          <h1>จำลองดาเมจ</h1>
          <p className="dim">ลากรูนสกิลไปไว้ตรงกลาง วางรูนลิงก์รอบ ๆ แล้วใส่ไอเทมในช่องอุปกรณ์ บิลด์จะถูกบันทึกในเบราว์เซอร์นี้อัตโนมัติ</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            setBuild({ ...EMPTY_BUILD, custom: build.custom, target: build.target })
            setSelection(null)
          }}
        >
          ล้างบิลด์
        </button>
      </div>

      <div className="sim-layout">
        <Palette skillTags={skillTags} onAdd={onAdd} />

        <div className="sim-center">
          <section className="card board-card">
            <h2>Rune Cast</h2>
            <RuneBoard skill={build.skill} links={build.links} selection={selection} onSelect={setSelection} />
          </section>
          <section className="card gear-card">
            <h2>อุปกรณ์</h2>
            <GearSlots gear={build.gear} selection={selection} onSelect={setSelection} />
          </section>
          <section className="card editor-card">
            <Editor build={build} selection={selection} skillTags={skillTags} onBuild={setBuild} onClear={() => setSelection(null)} />
          </section>
        </div>

        <div className="sim-right">
          <ResultPanel result={result} build={build} onBuild={setBuild} />
          <SettingsPanel build={build} onBuild={setBuild} />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>{dragging ? <div className="drag-ghost">{payloadName(dragging)}</div> : null}</DragOverlay>
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </DndContext>
  )
}
