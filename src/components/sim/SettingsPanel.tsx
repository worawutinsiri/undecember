import type { BuildState } from '../../lib/buildState'
import { EMPTY_BUILD } from '../../lib/buildState'

function Num({ label, value, onChange, step = 1, min, hint }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; hint?: string }) {
  return (
    <label className="num-field" title={hint}>
      <span>{label}</span>
      <input type="number" value={value} step={step} min={min} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
    </label>
  )
}

export function SettingsPanel({ build, onBuild }: { build: BuildState; onBuild: (b: BuildState) => void }) {
  const t = build.target
  const c = build.custom
  const setT = (k: keyof BuildState['target'], v: number) => onBuild({ ...build, target: { ...t, [k]: v } })
  const setC = (k: keyof BuildState['custom'], v: number) => onBuild({ ...build, custom: { ...c, [k]: v } })
  const q = build.rollQuality

  return (
    <div className="settings card">
      <details open>
        <summary>ค่าออปชันไอเทม</summary>
        <label className="roll">
          <span>
            ค่าที่สุ่มได้: <b>{q === 0 ? 'ต่ำสุด' : q === 1 ? 'สูงสุด' : `${Math.round(q * 100)}%`}</b>
          </span>
          <input type="range" min={0} max={1} step={0.05} value={q} onChange={(e) => onBuild({ ...build, rollQuality: Number(e.target.value) })} />
        </label>
        <label className="check">
          <input type="checkbox" checked={build.allProjectilesHit} onChange={(e) => onBuild({ ...build, allProjectilesHit: e.target.checked })} />
          นับว่าโพรเจกไทล์ทุกลูกโดนเป้าหมายเดียวกัน
        </label>
      </details>

      <details open>
        <summary>เป้าหมาย</summary>
        <div className="num-grid">
          <Num label="เลเวลศัตรู" value={t.level} min={1} onChange={(v) => setT('level', v)} />
          <Num label="ต้านทานธาตุ" value={t.elementResist} onChange={(v) => setT('elementResist', v)} hint="ค่าต้านทานแบบตัวเลข (ไม่ใช่ %) ศัตรู Lv.100 ประมาณ 55" />
          <Num label="ต้านทานเคออส" value={t.chaosResist} onChange={(v) => setT('chaosResist', v)} />
          <Num label="เกราะลดดาเมจกายภาพ %" value={t.armorReduction} onChange={(v) => setT('armorReduction', v)} hint="เกมไม่เปิดเผยสูตรเกราะ จึงให้กรอก % ที่เกราะลดเอง" />
        </div>
      </details>

      <details>
        <summary>ค่าตัวละครเพิ่มเติม</summary>
        <p className="faint small">ใช้แทนค่าจากต้นไม้ Zodiac, อุปกรณ์ที่ไม่ใช่ Unique หรือบัฟอื่น ๆ ที่ตัวจำลองยังไม่มีข้อมูล</p>
        <div className="num-grid">
          <Num label="ดาเมจอาวุธ ต่ำสุด" value={c.flatMin} onChange={(v) => setC('flatMin', v)} />
          <Num label="ดาเมจอาวุธ สูงสุด" value={c.flatMax} onChange={(v) => setC('flatMax', v)} />
          <Num label="ดาเมจ +%" value={c.incDmg} onChange={(v) => setC('incDmg', v)} />
          <Num label="ขยายดาเมจ %" value={c.ampDmg} onChange={(v) => setC('ampDmg', v)} />
          <Num label="ค่าคริติคอล" value={c.critRating} onChange={(v) => setC('critRating', v)} />
          <Num label="ดาเมจคริติคอล +%" value={c.critDmg} onChange={(v) => setC('critDmg', v)} />
          <Num label="ความเร็วพื้นฐาน (ไม่มีอาวุธ)" value={c.baseSpeed} step={0.05} onChange={(v) => setC('baseSpeed', v)} />
          <Num label="ความเร็ว +%" value={c.incSpeed} onChange={(v) => setC('incSpeed', v)} />
        </div>
        <button className="btn small-btn" onClick={() => onBuild({ ...build, custom: EMPTY_BUILD.custom, target: EMPTY_BUILD.target })}>
          คืนค่าเริ่มต้น
        </button>
      </details>
    </div>
  )
}
