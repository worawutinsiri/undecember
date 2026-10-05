import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MAX_RUNE_LEVEL } from '../data'
import type { Rune, RuneGrade } from '../data/types'
import { AWAKENING_TH, COLOR_TH, GRADE_TH, HOW_TO_GET_TH, TAG_TH } from '../i18n/labels'
import { thDescription } from '../i18n/translate'
import { gradeLines, runeLinesAt } from '../lib/runeLevel'
import { RuneIcon } from './RuneIcon'
import { RuneName } from './RuneName'
import { StatLines } from './StatLines'
import './RuneDetail.css'

const GRADES: RuneGrade[] = ['normal', 'magic', 'rare', 'legendary']

export function RuneDetail({ rune, showEnglish = false }: { rune: Rune; showEnglish?: boolean }) {
  const [level, setLevel] = useState(45)
  const [grade, setGrade] = useState<RuneGrade>('normal')
  const { lines, estimated } = runeLinesAt(rune, level)
  const extra = gradeLines(rune, grade)
  const prev = rune.prevLv45
  const removed = prev?.filter((l) => !rune.lv45.includes(l)) ?? []
  const added = prev ? rune.lv45.filter((l) => !prev.includes(l)) : []

  return (
    <article className="rune-detail">
      <header className="rd-head">
        <RuneIcon rune={rune} size={52} />
        <div>
          <h2>
            <RuneName name={rune.name} />
          </h2>
          <div className="rd-meta">
            <span className="chip">{rune.kind === 'skill' ? 'รูนสกิล' : 'รูนลิงก์'}</span>
            {rune.color && <span className={`chip color-${rune.color}`}>{COLOR_TH[rune.color]}</span>}
            {rune.minRarity && <span className="chip">เกรดต่ำสุด {GRADE_TH[rune.minRarity as RuneGrade] ?? rune.minRarity}</span>}
            {rune.status === 'new' && <span className="chip badge-new">ใหม่ S12</span>}
            {rune.change === 'major' && <span className="chip badge-changed">เปลี่ยนสำคัญใน S12</span>}
            {rune.change === 'minor' && <span className="chip">S12 ปรับตัวเลขเล็กน้อย</span>}
          </div>
        </div>
      </header>

      <p className="rd-desc">
        {thDescription(rune.description)
          .split('\n')
          .map((l, i) => (
            <span key={i}>{l}</span>
          ))}
      </p>
      {showEnglish && <p className="rd-desc-en faint">{rune.description}</p>}

      <div className="rd-tags">
        {rune.tags.map((t) => (
          <span key={t} className="chip" title={TAG_TH[t]}>
            {t}
            {TAG_TH[t] && <span className="faint"> · {TAG_TH[t]}</span>}
          </span>
        ))}
      </div>
      {rune.restrictions.length > 0 && <StatLines lines={rune.restrictions} className="rd-restrict" showEnglish={showEnglish} />}

      {rune.howToGet.length > 0 && (
        <p className="faint rd-get">วิธีได้รับ: {rune.howToGet.map((h) => HOW_TO_GET_TH[h] ?? h).join(', ')}</p>
      )}

      <section className="rd-controls">
        <label>
          <span>
            เลเวล <b className="mono">{level}</b>
            {estimated && <span className="est">ประมาณ</span>}
          </span>
          <input type="range" min={1} max={MAX_RUNE_LEVEL} value={level} onChange={(e) => setLevel(Number(e.target.value))} />
        </label>
        <div className="grade-pick" role="radiogroup" aria-label="เกรด">
          {GRADES.map((g) => (
            <button key={g} role="radio" aria-checked={grade === g} className={`btn g-${g} ${grade === g ? 'active' : ''}`} onClick={() => setGrade(g)}>
              {GRADE_TH[g]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>ค่าที่เลเวล {level}</h3>
        <StatLines lines={lines} showEnglish={showEnglish} />
      </section>

      {extra.length > 0 && (
        <section>
          <h3>เอฟเฟกต์เกรด {GRADE_TH[grade]}</h3>
          <StatLines lines={extra} showEnglish={showEnglish} className="grade-lines" />
        </section>
      )}

      <section>
        <h3>ปลุกพลัง</h3>
        <div className="rd-awaken">
          {(['source', 'origin', 'verity'] as const).map((t) =>
            rune.awakening[t].length ? (
              <div key={t}>
                <h4>{AWAKENING_TH[t]}</h4>
                <StatLines lines={rune.awakening[t]} showEnglish={showEnglish} />
              </div>
            ) : null,
          )}
          {!rune.awakening.source.length && !rune.awakening.origin.length && !rune.awakening.verity.length && <p className="faint">ไม่มีข้อมูลปลุกพลัง</p>}
        </div>
      </section>

      {prev && (
        <section className="rd-changes">
          <h3>เปลี่ยนแปลงใน Season 12 (ค่าที่ Lv.45)</h3>
          <div className="rd-diff">
            <div>
              <h4>ก่อน</h4>
              <StatLines lines={removed} showEnglish={showEnglish} className="diff-old" />
            </div>
            <div>
              <h4>หลัง</h4>
              <StatLines lines={added} showEnglish={showEnglish} className="diff-new" />
            </div>
          </div>
        </section>
      )}

      <Link className="btn rd-sim" to={`/simulator?add=${rune.kind}:${rune.id}`}>
        ⬡ นำไปจำลองดาเมจ
      </Link>
    </article>
  )
}
