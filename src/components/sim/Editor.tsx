import { MAX_RUNE_LEVEL, UNIQUE_BY_ID } from '../../data'
import type { RuneGrade } from '../../data/types'
import { AWAKENING_TH, GRADE_TH } from '../../i18n/labels'
import { thDescription } from '../../i18n/translate'
import { adjacentSkills, GEAR_SLOTS, linksOf, runeOf, type BuildState, type CellRune } from '../../lib/buildState'
import { ALL_WHITE, DIR_TH, SLOT_CYCLE, SLOT_TH, connect, type SlotColor } from '../../lib/hexBoard'
import { gradeLines, runeLinesAt } from '../../lib/runeLevel'
import { ItemCard } from '../ItemCard'
import { RuneIcon } from '../RuneIcon'
import { RuneName } from '../RuneName'
import { StatLines } from '../StatLines'
import { cellsOf, removeRune, withCells, type Selection } from './boardOps'

const GRADES: RuneGrade[] = ['normal', 'magic', 'rare', 'legendary']
// Slot buttons around the mini hex, in DIRS order (E, SE, SW, W, NW, NE).
const SLOT_ANGLES = [0, 60, 120, 180, 240, 300]

function SlotEditor({ slots, onChange }: { slots: SlotColor[]; onChange: (s: SlotColor[]) => void }) {
  const cycle = (i: number) => {
    const next = [...slots]
    next[i] = SLOT_CYCLE[(SLOT_CYCLE.indexOf(slots[i]) + 1) % SLOT_CYCLE.length]
    onChange(next)
  }
  return (
    <div className="slot-editor">
      <div className="slot-hex" aria-label="สีช่องลิงก์ 6 ทิศ">
        <span className="slot-core">สกิล</span>
        {SLOT_ANGLES.map((deg, i) => (
          <button
            key={i}
            className={`slot-btn slot-${slots[i]}`}
            style={{ transform: `rotate(${deg}deg) translate(46px) rotate(${-deg}deg)` }}
            onClick={() => cycle(i)}
            title={`ทิศ${DIR_TH[i]}: ${SLOT_TH[slots[i]]} (คลิกเพื่อเปลี่ยน)`}
            aria-label={`ช่องทิศ${DIR_TH[i]} ${SLOT_TH[slots[i]]}`}
          >
            {slots[i] === 'closed' ? '×' : ''}
          </button>
        ))}
      </div>
      <div className="slot-help small">
        <p className="faint">
          ช่องลิงก์ของรูนสกิล: รูนลิงก์ต้องสีตรงกับช่อง (ขาว = ใส่ได้ทุกสีและรูนลิงก์ +1 เลเวล) คลิกจุดเพื่อเปลี่ยนสี · ในเกมเปิดช่องด้วย Essence of Birth และเปลี่ยนสีด้วย Essence of Color
        </p>
        <button className="btn small-btn" onClick={() => onChange([...ALL_WHITE])}>
          ตั้งเป็นขาวทั้งหมด
        </button>
      </div>
    </div>
  )
}

function RuneSettings({ cell, onChange }: { cell: CellRune; onChange: (c: CellRune) => void }) {
  const rune = runeOf(cell)
  if (!rune) return null
  const { lines, estimated } = runeLinesAt(rune, cell.level)
  return (
    <>
      <label className="ed-level">
        <span>
          เลเวล <b className="mono">{cell.level}</b> {estimated && <span className="est">ประมาณ</span>}
        </span>
        <input type="range" min={1} max={MAX_RUNE_LEVEL} value={cell.level} onChange={(e) => onChange({ ...cell, level: Number(e.target.value) })} />
      </label>
      <div className="grade-pick" role="radiogroup" aria-label="เกรด">
        {GRADES.map((g) => (
          <button key={g} role="radio" aria-checked={cell.grade === g} className={`btn g-${g} ${cell.grade === g ? 'active' : ''}`} onClick={() => onChange({ ...cell, grade: g })}>
            {GRADE_TH[g]}
          </button>
        ))}
      </div>
      <div className="ed-awaken">
        {(['source', 'origin', 'verity'] as const).map((t) =>
          rune.awakening[t].length ? (
            <label key={t} className="check">
              <input type="checkbox" checked={!!cell.awakening[t]} onChange={(e) => onChange({ ...cell, awakening: { ...cell.awakening, [t]: e.target.checked } })} />
              {AWAKENING_TH[t]}
            </label>
          ) : null,
        )}
      </div>
      <details className="ed-lines">
        <summary>ค่าของรูนที่เลเวลนี้</summary>
        <StatLines lines={[...lines, ...gradeLines(rune, cell.grade)]} />
      </details>
    </>
  )
}

export function Editor({
  build,
  selection,
  onBuild,
  onClear,
  onOpenPicker,
}: {
  build: BuildState
  selection: Selection
  onBuild: (b: BuildState) => void
  onClear: () => void
  onOpenPicker: (key: string) => void
}) {
  if (!selection) {
    return <div className="editor empty-editor faint">คลิกช่องบนกระดานเพื่อเลือกรูน หรือคลิกรูนที่วางแล้วเพื่อตั้งค่าเลเวล เกรด และการปลุกพลัง</div>
  }

  if (selection.type === 'gear') {
    const id = build.gear[selection.slot]
    const item = id ? UNIQUE_BY_ID.get(id) : undefined
    const label = GEAR_SLOTS.find((s) => s.id === selection.slot)?.label
    if (!item) return <div className="editor empty-editor faint">ช่อง{label}ยังว่าง — ลากไอเทมจากแท็บ “ไอเทม” มาวาง หรือกด +</div>
    return (
      <div className="editor">
        <header className="ed-head">
          <div className="ed-title">
            <span className="faint">{label}</span>
          </div>
          <button
            className="btn danger"
            onClick={() => {
              const gear = { ...build.gear }
              delete gear[selection.slot]
              onBuild({ ...build, gear })
              onClear()
            }}
          >
            ถอดออก
          </button>
        </header>
        <ItemCard item={item} />
      </div>
    )
  }

  const cells = cellsOf(build)
  const key = selection.key
  const cell = cells[key]
  const rune = runeOf(cell)
  if (!cell || !rune) {
    return <div className="editor empty-editor faint">ช่องนี้ยังว่าง — เลือกรูนจากรายการทางซ้าย (เลือกเฉพาะที่ใส่ได้ให้แล้ว) หรือลากมาวาง</div>
  }
  const setCell = (c: CellRune) => onBuild(withCells(build, { ...cells, [key]: c }))

  const links = cell.kind === 'skill' ? linksOf(cells, key) : []
  const skills = cell.kind === 'link' ? adjacentSkills(cells, key) : []

  return (
    <div className="editor">
      <header className="ed-head">
        <RuneIcon rune={rune} size={40} />
        <div className="ed-title">
          <h3>
            <RuneName name={rune.name} />
          </h3>
          <span className="faint">{cell.kind === 'skill' ? 'รูนสกิล' : 'รูนลิงก์'}</span>
        </div>
        <button className="btn" onClick={() => onOpenPicker(key)}>
          เปลี่ยนรูน
        </button>
        <button
          className="btn danger"
          onClick={() => {
            onBuild(removeRune(build, key))
            onClear()
          }}
        >
          ถอดออก
        </button>
      </header>
      <p className="ed-desc dim">{thDescription(rune.description)}</p>

      {cell.kind === 'link' && (
        <ul className="ed-conn">
          {skills.length === 0 && <li className="warn-text">ไม่ได้อยู่ติดกับรูนสกิล — ยังไม่มีผล</li>}
          {skills.map((s) => {
            const c = connect(rune, s.rune, s.cell.slots ?? ALL_WHITE, s.dirFromSkill)
            return (
              <li key={s.key} className={c.ok ? 'v-ok' : 'v-bad'}>
                {c.ok ? '✓ เชื่อมกับ' : '✕ เชื่อมไม่ได้กับ'} {s.rune.name}
                {c.ok && (s.cell.slots?.[s.dirFromSkill] ?? 'white') === 'white' && <span className="faint"> · ช่องขาว +1 เลเวล</span>}
                {c.reason && <span className="faint"> — {c.reason}</span>}
              </li>
            )
          })}
        </ul>
      )}

      <RuneSettings cell={cell} onChange={setCell} />

      {cell.kind === 'skill' && (
        <>
          <SlotEditor slots={cell.slots ?? [...ALL_WHITE]} onChange={(slots) => setCell({ ...cell, slots })} />
          {links.length > 0 && (
            <ul className="ed-conn">
              {links.map((l) => (
                <li key={l.key} className={l.connection.ok ? 'v-ok' : 'v-bad'}>
                  {l.connection.ok ? '✓' : '✕'} {l.rune.name} <span className="faint">(ทิศ{DIR_TH[l.dir]})</span>
                  {l.connection.reason && <span className="faint"> — {l.connection.reason}</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
