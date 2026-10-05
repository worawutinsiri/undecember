import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RUNE_BY_ID, UNIQUE_BY_ID } from '../data'
import { CellPicker } from '../components/sim/CellPicker'
import { Editor } from '../components/sim/Editor'
import { GearSlots } from '../components/sim/GearSlots'
import { Palette } from '../components/sim/Palette'
import { ResultPanel } from '../components/sim/ResultPanel'
import { RuneBoard, type Preview } from '../components/sim/RuneBoard'
import { SettingsPanel } from '../components/sim/SettingsPanel'
import { applyDrop, autoCell, canHold, cellsOf, placeRune, withFocus, type Selection } from '../components/sim/boardOps'
import { collision, payloadName, type DragPayload, type DropTarget } from '../components/sim/dnd'
import { EMPTY_BUILD, GEAR_SLOTS, duplicateSkill, focusKey, loadBuild, runeOf, saveBuild, skillKeys, toSimInput, type BuildState } from '../lib/buildState'
import { simulate } from '../lib/damage'
import { LAYOUTS, type BoardMode } from '../lib/hexBoard'
import './SimulatorPage.css'

/** Saved build, plus the rune passed as "?add=skill:fire-ball" from the runes page. */
function initialState(add: string | null): { build: BuildState; selection: Selection } {
  const build = loadBuild()
  const [kind, id] = add?.split(':') ?? []
  if ((kind !== 'skill' && kind !== 'link') || !RUNE_BY_ID.has(`${kind}:${id}`)) return { build, selection: null }
  const key = autoCell(build, kind)
  if (!key) return { build, selection: null }
  return { build: placeRune(build, kind, id, key), selection: { type: 'cell', key } }
}

const MODES: { id: BoardMode; label: string }[] = [
  { id: 'single', label: '1 สกิล' },
  { id: 'full', label: `กระดานเต็ม (${LAYOUTS.full.cells.length} ช่อง)` },
]

export function SimulatorPage() {
  const [params, setParams] = useSearchParams()
  const [initial] = useState(() => initialState(params.get('add')))
  const [build, setBuild] = useState<BuildState>(initial.build)
  const [selection, setSelection] = useState<Selection>(initial.selection)
  const [pickFor, setPickFor] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [dragging, setDragging] = useState<DragPayload | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const boardRef = useRef<HTMLElement>(null)

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
    // long-press to drag on touch screens, so a quick swipe still scrolls
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const cells = cellsOf(build)
  const focus = focusKey(build)
  const result = useMemo(() => simulate(toSimInput(build)), [build])
  const skillTags = useMemo(() => runeOf(focus ? cells[focus] : undefined)?.tags ?? null, [cells, focus])
  // every skill on the full board, for the summary list
  const boardSkills = useMemo(
    () => (build.mode === 'full' ? skillKeys(cells).map((k) => ({ key: k, name: runeOf(cells[k])?.name ?? k, dps: simulate(toSimInput(build, k)).dps })) : []),
    [build, cells],
  )

  const flash = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice((n) => (n === msg ? null : n)), 2500)
  }

  const select = (s: Selection) => {
    setSelection(s)
    setPreview(null)
    if (s?.type === 'cell' && cells[s.key]?.kind === 'skill') setBuild((b) => withFocus(b, s.key))
  }

  const onCellClick = (key: string) => {
    select({ type: 'cell', key })
    // link cells (filled or empty) and empty cells open the picker with only the runes that fit
    const cell = cells[key]
    const opens = !cell || cell.kind === 'link'
    setPickFor(opens ? key : null)
    // on phones the picker is a bottom sheet: lift the board above it so the link lines stay visible
    if (opens && window.matchMedia('(max-width: 760px)').matches) {
      requestAnimationFrame(() => boardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
    }
  }

  // the game won't equip the same skill rune twice
  const refuseDuplicate = (kind: DragPayload['kind'], id: string, key: string) => {
    if (kind !== 'skill' || !duplicateSkill(cells, id, key)) return false
    flash('รูนสกิลนี้อยู่บนกระดานแล้ว — ในเกมใส่รูนสกิลเดียวกันซ้ำไม่ได้')
    return true
  }

  const onDragStart = (e: DragStartEvent) => {
    setPreview(null)
    setDragging((e.active.data.current as DragPayload) ?? null)
  }
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null)
    const payload = e.active.data.current as DragPayload | undefined
    const target = e.over?.data.current as DropTarget | undefined
    if (!payload || !target) return
    if (!payload.from && target.type === 'cell' && refuseDuplicate(payload.kind, payload.id, target.key)) return
    const done = applyDrop(build, payload, target)
    if (!done) {
      flash('วางช่องนี้ไม่ได้')
      return
    }
    setBuild(done[0])
    setSelection(done[1])
    setPickFor(null)
  }

  const onAdd = (payload: DragPayload) => {
    if (payload.kind === 'item') {
      const item = UNIQUE_BY_ID.get(payload.id)
      const slots = item ? GEAR_SLOTS.filter((s) => s.accepts(item)) : []
      const slot = slots.find((s) => !build.gear[s.id]) ?? slots[0]
      if (!slot) return flash('ไม่มีช่องที่ใส่ได้')
      setBuild({ ...build, gear: { ...build.gear, [slot.id]: payload.id } })
      setSelection({ type: 'gear', slot: slot.id })
      return
    }
    const key = autoCell(build, payload.kind)
    if (!key) return flash(payload.kind === 'link' ? 'ช่องรอบรูนสกิลเต็มแล้ว — ถอดออกก่อน' : 'กระดานเต็มแล้ว')
    if (refuseDuplicate(payload.kind, payload.id, key)) return
    setBuild(placeRune(build, payload.kind, payload.id, key))
    setSelection({ type: 'cell', key })
  }

  const onPick = (kind: 'skill' | 'link', id: string) => {
    if (!pickFor || refuseDuplicate(kind, id, pickFor)) return
    setBuild(placeRune(build, kind, id, pickFor))
    setSelection({ type: 'cell', key: pickFor })
    setPickFor(null)
    setPreview(null)
  }

  const closePicker = () => {
    setPickFor(null)
    setPreview(null)
  }

  const setMode = (mode: BoardMode) => {
    setBuild({ ...build, mode })
    setSelection(null)
    closePicker()
  }

  const pickKinds = pickFor ? (['skill', 'link'] as const).filter((k) => canHold(build, pickFor, k)) : []

  return (
    <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="sim-head">
        <div>
          <h1>จำลองดาเมจ</h1>
          <p className="dim">
            คลิกช่องบนกระดานเพื่อเลือกรูนที่ใส่ได้ หรือลากจากคลังมาวาง · เส้นทอง = รูนลิงก์เชื่อมกับรูนสกิลได้ · เส้นแดงประ = เชื่อมไม่ได้ · บิลด์บันทึกในเบราว์เซอร์นี้อัตโนมัติ
          </p>
        </div>
        <button
          className="btn"
          onClick={() => {
            setBuild({ ...build, boards: { ...build.boards, [build.mode]: {} }, focus: EMPTY_BUILD.focus })
            setSelection(null)
            closePicker()
          }}
        >
          ล้างกระดาน
        </button>
      </div>

      <div className={`sim-layout mode-${build.mode}`}>
        {pickFor ? (
          <CellPicker key={pickFor} cellKey={pickFor} cells={cells} kinds={[...pickKinds]} onPick={onPick} onPreview={setPreview} onClose={closePicker} />
        ) : (
          <Palette skillTags={skillTags} onAdd={onAdd} />
        )}

        <div className="sim-center">
          <section ref={boardRef} className="card board-card">
            <div className="board-head">
              <h2>Rune Cast</h2>
              <div className="mode-toggle" role="radiogroup" aria-label="ขนาดกระดาน">
                {MODES.map((m) => (
                  <button key={m.id} role="radio" aria-checked={build.mode === m.id} className={`btn ${build.mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <RuneBoard build={build} selection={selection} preview={preview} onCellClick={onCellClick} />
            {build.mode === 'full' && (
              <p className="faint small board-hint">
                กระดาน Rune Cast {LAYOUTS.full.cells.length} ช่องแบบในเกม (ช่องขอบลายทอง {LAYOUTS.full.expansion.size} ช่อง = ช่องขยายที่ต้องปลดล็อกด้วย Traum's Crystal) · รูนลิงก์เชื่อมกับรูนสกิลทุกตัวที่อยู่ติดกัน · ลากรูนเพื่อย้ายหรือสลับช่อง · คลิกรูนสกิลเพื่อดูดาเมจของสกิลนั้น
              </p>
            )}
          </section>
          <section className="card editor-card">
            <Editor
              build={build}
              selection={selection}
              onBuild={setBuild}
              onClear={() => {
                setSelection(null)
                closePicker()
              }}
              onOpenPicker={(key) => setPickFor(key)}
            />
          </section>
          <section className="card gear-card">
            <h2>อุปกรณ์</h2>
            <GearSlots gear={build.gear} selection={selection} onSelect={select} />
          </section>
        </div>

        <div className="sim-right">
          {boardSkills.length > 1 && (
            <div className="card skill-summary">
              <h2>สกิลบนกระดาน</h2>
              <ul>
                {boardSkills.map((s) => (
                  <li key={s.key}>
                    <button className={`btn ${s.key === focus ? 'active' : ''}`} onClick={() => select({ type: 'cell', key: s.key })}>
                      <span>{s.name}</span>
                      <span className="mono">{Math.round(s.dps).toLocaleString('th-TH')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
