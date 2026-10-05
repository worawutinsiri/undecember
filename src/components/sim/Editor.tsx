import { MAX_RUNE_LEVEL, RUNE_BY_ID, UNIQUE_BY_ID } from '../../data'
import type { RuneGrade } from '../../data/types'
import { AWAKENING_TH, GRADE_TH } from '../../i18n/labels'
import { thDescription } from '../../i18n/translate'
import type { BuildState, PlacedRune } from '../../lib/buildState'
import { GEAR_SLOTS } from '../../lib/buildState'
import { checkLink } from '../../lib/damage'
import { gradeLines, runeLinesAt } from '../../lib/runeLevel'
import { ItemCard } from '../ItemCard'
import { RuneIcon } from '../RuneIcon'
import { StatLines } from '../StatLines'
import type { Selection } from './RuneBoard'

const GRADES: RuneGrade[] = ['normal', 'magic', 'rare', 'legendary']

function RuneEditor({
  kind,
  placed,
  skillTags,
  onChange,
  onRemove,
}: {
  kind: 'skill' | 'link'
  placed: PlacedRune
  skillTags: string[] | null
  onChange: (p: PlacedRune) => void
  onRemove: () => void
}) {
  const rune = RUNE_BY_ID.get(`${kind}:${placed.id}`)
  if (!rune) return null
  const { lines, estimated } = runeLinesAt(rune, placed.level)
  const check = kind === 'link' && skillTags ? checkLink(rune.linkRules, skillTags) : null

  return (
    <div className="editor">
      <header className="ed-head">
        <RuneIcon rune={rune} size={40} />
        <div className="ed-title">
          <h3>{rune.name}</h3>
          <span className="faint">{kind === 'skill' ? 'รูนสกิล' : 'รูนลิงก์'}</span>
        </div>
        <button className="btn danger" onClick={onRemove}>
          ถอดออก
        </button>
      </header>
      {check && !check.ok && <p className="ed-warn">⚠ {check.reason} — รูนนี้จะไม่ถูกนับ</p>}
      <p className="ed-desc dim">{thDescription(rune.description)}</p>

      <label className="ed-level">
        <span>
          เลเวล <b className="mono">{placed.level}</b> {estimated && <span className="est">ประมาณ</span>}
        </span>
        <input type="range" min={1} max={MAX_RUNE_LEVEL} value={placed.level} onChange={(e) => onChange({ ...placed, level: Number(e.target.value) })} />
      </label>

      <div className="grade-pick" role="radiogroup" aria-label="เกรด">
        {GRADES.map((g) => (
          <button key={g} role="radio" aria-checked={placed.grade === g} className={`btn g-${g} ${placed.grade === g ? 'active' : ''}`} onClick={() => onChange({ ...placed, grade: g })}>
            {GRADE_TH[g]}
          </button>
        ))}
      </div>

      <div className="ed-awaken">
        {(['source', 'origin', 'verity'] as const).map((t) =>
          rune.awakening[t].length ? (
            <label key={t} className="check">
              <input
                type="checkbox"
                checked={!!placed.awakening[t]}
                onChange={(e) => onChange({ ...placed, awakening: { ...placed.awakening, [t]: e.target.checked } })}
              />
              {AWAKENING_TH[t]}
            </label>
          ) : null,
        )}
      </div>

      <details className="ed-lines">
        <summary>ค่าของรูนที่เลเวลนี้</summary>
        <StatLines lines={[...lines, ...gradeLines(rune, placed.grade)]} />
      </details>
    </div>
  )
}

export function Editor({
  build,
  selection,
  skillTags,
  onBuild,
  onClear,
}: {
  build: BuildState
  selection: Selection
  skillTags: string[] | null
  onBuild: (b: BuildState) => void
  onClear: () => void
}) {
  if (!selection) {
    return <div className="editor empty-editor faint">คลิกช่องรูนหรือช่องอุปกรณ์เพื่อตั้งค่าเลเวล เกรด และการปลุกพลัง</div>
  }

  if (selection.type === 'skill') {
    if (!build.skill) return <div className="editor empty-editor faint">ช่องรูนสกิลยังว่าง — ลากรูนสกิลจากคลังมาวาง</div>
    return (
      <RuneEditor
        kind="skill"
        placed={build.skill}
        skillTags={null}
        onChange={(p) => onBuild({ ...build, skill: p, componentIndex: 0 })}
        onRemove={() => {
          onBuild({ ...build, skill: null, componentIndex: 0 })
          onClear()
        }}
      />
    )
  }

  if (selection.type === 'link') {
    const placed = build.links[selection.index]
    if (!placed) return <div className="editor empty-editor faint">ช่องรูนลิงก์ยังว่าง — ลากรูนลิงก์จากคลังมาวาง</div>
    const setLink = (p: PlacedRune | null) => onBuild({ ...build, links: build.links.map((l, i) => (i === selection.index ? p : l)) })
    return (
      <RuneEditor
        kind="link"
        placed={placed}
        skillTags={skillTags}
        onChange={setLink}
        onRemove={() => {
          setLink(null)
          onClear()
        }}
      />
    )
  }

  const id = build.gear[selection.slot]
  const item = id ? UNIQUE_BY_ID.get(id) : undefined
  const label = GEAR_SLOTS.find((s) => s.id === selection.slot)?.label
  if (!item) return <div className="editor empty-editor faint">ช่อง{label}ยังว่าง — ลากไอเทมจากแท็บ “ไอเทม” มาวาง</div>
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
