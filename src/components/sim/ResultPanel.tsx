import { useState } from 'react'
import { ELEMENT_TH } from '../../i18n/labels'
import { thLine } from '../../i18n/translate'
import type { BuildState } from '../../lib/buildState'
import type { Contribution, LineReport, SimResult } from '../../lib/damage'
import { fmt, fmtBig, fmtInt, fmtMult, fmtPct } from '../../lib/format'

function Sources({ items, unit = '%' }: { items: Contribution[]; unit?: string }) {
  if (items.length === 0) return <span className="faint">—</span>
  return (
    <ul className="src-list">
      {items.map((s, i) => (
        <li key={i}>
          <span className="faint">{s.source}</span>
          <span className="mono">
            {s.value > 0 && unit === '%' ? '+' : ''}
            {fmt(s.value)}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  )
}

const STATUS: Record<LineReport['status'], { icon: string; label: string }> = {
  used: { icon: '✓', label: 'นับแล้ว' },
  'conditional-on': { icon: '☑', label: 'มีเงื่อนไข (เปิด)' },
  'conditional-off': { icon: '☐', label: 'มีเงื่อนไข (ปิด)' },
  inactive: { icon: '⊘', label: 'รูนลิงก์ไม่ได้' },
  'not-counted': { icon: '·', label: 'ไม่ได้ใช้คำนวณ' },
}

function LineList({ lines, enabled, onToggle }: { lines: LineReport[]; enabled: Set<string>; onToggle: (key: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'cond' | 'used'>('cond')
  const shown = lines.filter((l) => filter === 'all' || (filter === 'cond' ? l.status.startsWith('conditional') : l.status === 'used'))
  const groups = new Map<string, LineReport[]>()
  shown.forEach((l) => groups.set(l.source, [...(groups.get(l.source) ?? []), l]))
  const condCount = lines.filter((l) => l.status.startsWith('conditional')).length

  return (
    <div className="line-list">
      <div className="pal-tabs">
        <button className={`btn ${filter === 'cond' ? 'active' : ''}`} onClick={() => setFilter('cond')}>
          มีเงื่อนไข ({condCount})
        </button>
        <button className={`btn ${filter === 'used' ? 'active' : ''}`} onClick={() => setFilter('used')}>
          ที่นับแล้ว
        </button>
        <button className={`btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          ทั้งหมด
        </button>
      </div>
      {filter === 'cond' && condCount > 0 && <p className="faint small">ติ๊กบรรทัดที่เงื่อนไขเป็นจริงในสถานการณ์ที่ต้องการ เช่น ศัตรูติดไหม้</p>}
      {shown.length === 0 && <p className="faint small">ไม่มีบรรทัด</p>}
      {[...groups.entries()].map(([source, ls]) => (
        <div key={source} className="line-group">
          <h4>{source}</h4>
          <ul>
            {ls.map((l) => {
              const isCond = l.status.startsWith('conditional')
              return (
                <li key={l.key} className={`ls-${l.status}`} title={`${STATUS[l.status].label}${l.line !== thLine(l.line) ? ` · ${l.line}` : ''}`}>
                  {isCond ? (
                    <label className="check">
                      <input type="checkbox" checked={enabled.has(l.key)} onChange={() => onToggle(l.key)} />
                      {thLine(l.line)}
                    </label>
                  ) : (
                    <>
                      <span className="ls-icon">{STATUS[l.status].icon}</span> {thLine(l.line)}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function ResultPanel({ result: r, build, onBuild }: { result: SimResult; build: BuildState; onBuild: (b: BuildState) => void }) {
  const [linesOpen, setLinesOpen] = useState(false)
  const enabled = new Set(build.enabledConditions)
  const toggle = (key: string) =>
    onBuild({ ...build, enabledConditions: enabled.has(key) ? build.enabledConditions.filter((k) => k !== key) : [...build.enabledConditions, key] })

  if (!r.ready) {
    return (
      <div className="results card">
        <h2>ผลลัพธ์</h2>
        {r.problems.map((p) => (
          <p key={p} className="dim">
            {p}
          </p>
        ))}
      </div>
    )
  }

  const comp = r.components[Math.min(build.componentIndex, r.components.length - 1)]
  const critFactor = 1 + (r.crit.chance / 100) * (r.crit.multiplier - 1)
  const hitsPerUse = build.allProjectilesHit && r.projectiles > 1 ? r.projectiles : 1
  const condOff = r.lines.filter((l) => l.status === 'conditional-off').length

  return (
    <div className="results card">
      <div className="res-headline">
        <span className="res-label">ดาเมจต่อวินาที (DPS)</span>
        <span className="res-dps mono">{fmtBig(r.dps)}</span>
        <span className="faint small">
          ธาตุ{r.element ? ELEMENT_TH[r.element] : '-'} · ค่าประมาณ{r.estimatedLevel ? ' · มีเลเวลรูนที่เป็นค่าประมาณ' : ''}
        </span>
      </div>

      {r.components.length > 1 && (
        <label className="res-comp">
          <span className="faint small">ส่วนของสกิลที่ใช้คำนวณ</span>
          <select value={Math.min(build.componentIndex, r.components.length - 1)} onChange={(e) => onBuild({ ...build, componentIndex: Number(e.target.value) })}>
            {r.components.map((c, i) => (
              <option key={i} value={i}>
                {c.label} ({fmtInt(c.pct)}%)
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="res-stats">
        <div>
          <span className="faint small">ดาเมจต่อครั้ง (ก่อนศัตรู)</span>
          <b className="mono">
            {fmtInt(r.hit.min)} – {fmtInt(r.hit.max)}
          </b>
        </div>
        <div>
          <span className="faint small">เฉลี่ยต่อครั้ง (รวมคริ/ศัตรู)</span>
          <b className="mono">{fmtInt(r.hit.expected)}</b>
        </div>
        <div>
          <span className="faint small">โอกาสคริติคอล</span>
          <b className="mono">
            {r.crit.disabled ? 'ปิด' : fmtPct(r.crit.chance)} <span className="faint">{fmtMult(r.crit.multiplier)}</span>
          </b>
        </div>
        <div>
          <span className="faint small">{r.speed.kind === 'attack' ? 'ความเร็วโจมตี' : 'ความเร็วร่าย'}</span>
          <b className="mono">
            {fmt(r.speed.perSecond)}/วิ{r.speed.capped && <span className="warn-text"> (เต็มเพดาน)</span>}
          </b>
        </div>
        {r.cooldown && (
          <div>
            <span className="faint small">คูลดาวน์</span>
            <b className="mono">{fmt(r.cooldown.effective)} วิ</b>
          </div>
        )}
        {r.manaCost !== null && (
          <div>
            <span className="faint small">มานาที่ใช้</span>
            <b className="mono">{fmt(r.manaCost)}</b>
          </div>
        )}
        {r.projectiles > 0 && (
          <div>
            <span className="faint small">จำนวนโพรเจกไทล์</span>
            <b className="mono">{fmtInt(r.projectiles)}</b>
          </div>
        )}
      </div>

      {r.warnings.length > 0 && (
        <ul className="res-warnings">
          {r.warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      )}

      {condOff > 0 && !linesOpen && (
        <button className="res-cond-hint" onClick={() => setLinesOpen(true)}>
          มี {condOff} บรรทัดที่มีเงื่อนไข (เช่น ต่อศัตรูที่ไหม้) ยังไม่ได้นับ — กดเพื่อเลือก
        </button>
      )}

      <details className="res-breakdown" open>
        <summary>วิธีคำนวณทีละขั้น</summary>
        <ol className="steps">
          <li>
            <div className="step-head">
              <span>ดาเมจพื้นฐาน (อาวุธ + ค่าคงที่)</span>
              <b className="mono">
                {fmtInt(r.base.min)}–{fmtInt(r.base.max)}
              </b>
            </div>
            <ul className="src-list">
              {r.base.sources.map((s, i) => (
                <li key={i}>
                  <span className="faint">{s.source}</span>
                  <span className="mono">
                    {fmtInt(s.min)}–{fmtInt(s.max)}
                  </span>
                </li>
              ))}
            </ul>
          </li>
          {comp && (
            <>
              <li>
                <div className="step-head">
                  <span>+ ค่าคงที่ของรูนสกิล</span>
                  <b className="mono">+{fmtInt(comp.flat)}</b>
                </div>
              </li>
              <li>
                <div className="step-head">
                  <span>× ตัวคูณของรูนสกิล</span>
                  <b className="mono">
                    {fmtInt(comp.pct)}%{r.strikeMultBonus ? ` +${fmt(r.strikeMultBonus)}%` : ''}
                  </b>
                </div>
              </li>
            </>
          )}
          <li>
            <div className="step-head">
              <span>× (1 + ดาเมจ +% รวม)</span>
              <b className="mono">{fmtMult(1 + r.inc.total / 100)}</b>
            </div>
            <Sources items={r.inc.sources} />
          </li>
          <li>
            <div className="step-head">
              <span>× ขยายดาเมจ (คูณแยก)</span>
              <b className="mono">{fmtMult(r.amps.reduce((a, s) => a * (1 + s.value / 100), 1))}</b>
            </div>
            <Sources items={r.amps} />
          </li>
          {r.damps.length > 0 && (
            <li>
              <div className="step-head">
                <span>× ลดทอนดาเมจ</span>
                <b className="mono">{fmtMult(r.damps.reduce((a, s) => a * (1 - s.value / 100), 1))}</b>
              </div>
              <Sources items={r.damps} />
            </li>
          )}
          <li>
            <div className="step-head">
              <span>× ศัตรู ({r.element === 'Physical' ? 'เกราะ' : 'ค่าต้านทาน'} ลด {fmtPct(r.enemy.reduction)})</span>
              <b className="mono">{fmtMult(1 - r.enemy.reduction / 100)}</b>
            </div>
            {r.enemy.penetration > 0 && <p className="faint small">เจาะ {fmtPct(r.enemy.penetration * 100)}</p>}
          </li>
          {r.additional.length > 0 && (
            <li>
              <div className="step-head">
                <span>+ ดาเมจธาตุเพิ่มเติมต่อครั้ง</span>
                <b className="mono">+{fmtInt(r.additional.reduce((a, s) => a + s.value, 0))}</b>
              </div>
              <Sources items={r.additional} unit="" />
            </li>
          )}
          <li>
            <div className="step-head">
              <span>× คริติคอล (ค่าคาดหวัง)</span>
              <b className="mono">{fmtMult(critFactor)}</b>
            </div>
            <p className="faint small">
              ค่าคริ {fmt(r.crit.rating)} → โอกาส {fmtPct(r.crit.chance)} · ดาเมจคริ {fmtMult(r.crit.multiplier)}
            </p>
          </li>
          <li>
            <div className="step-head">
              <span>× ครั้งต่อวินาที{hitsPerUse > 1 ? ` × ${hitsPerUse} โพรเจกไทล์` : ''}</span>
              <b className="mono">{fmt(r.usesPerSecond * hitsPerUse)}</b>
            </div>
            {r.cooldown && <p className="faint small">ติดคูลดาวน์ {fmt(r.cooldown.effective)} วิ (ฐาน {fmt(r.cooldown.base)} วิ)</p>}
          </li>
          <li className="step-total">
            <div className="step-head">
              <span>= DPS</span>
              <b className="mono">{fmtInt(r.dps)}</b>
            </div>
          </li>
        </ol>
      </details>

      <details className="res-lines" open={linesOpen} onToggle={(e) => setLinesOpen(e.currentTarget.open)}>
        <summary>บรรทัดค่าสถานะทั้งหมด</summary>
        <LineList lines={r.lines} enabled={enabled} onToggle={toggle} />
      </details>
    </div>
  )
}
