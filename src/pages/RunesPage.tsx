import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LINK_RUNES, SKILL_RUNES } from '../data'
import type { Rune, RuneColor, RuneKind } from '../data/types'
import { RuneDetail } from '../components/RuneDetail'
import { ColorFilter } from '../components/ColorFilter'
import { RuneIcon } from '../components/RuneIcon'
import { RuneName } from '../components/RuneName'
import { TAG_TH } from '../i18n/labels'
import { runeNameTh, thDescription, thLine } from '../i18n/translate'
import './RunesPage.css'

const SEARCH_INDEX = new Map(
  [...SKILL_RUNES, ...LINK_RUNES].map((r) => [
    `${r.kind}:${r.id}`,
    [r.name, runeNameTh(r.name) ?? '', r.description, thDescription(r.description), ...r.tags, ...r.lv45, ...r.lv45.map(thLine)].join('\n').toLowerCase(),
  ]),
)

const tagCounts = (runes: Rune[]) => {
  const m = new Map<string, number>()
  runes.forEach((r) => r.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)))
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}
const TAGS: Record<RuneKind, [string, number][]> = { skill: tagCounts(SKILL_RUNES), link: tagCounts(LINK_RUNES) }

export function RunesPage() {
  const [params, setParams] = useSearchParams()
  const kind = (params.get('kind') === 'link' ? 'link' : 'skill') as RuneKind
  const q = params.get('q') ?? ''
  const tagParam = params.get('tags') ?? ''
  const tags = useMemo(() => tagParam.split(',').filter(Boolean), [tagParam])
  const color = (params.get('color') ?? '') as RuneColor | ''
  const changedOnly = params.get('changed') === '1'
  const showEn = params.get('en') === '1'
  const selectedId = params.get('id')

  const set = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setParams(next, { replace: true })
  }

  const runes = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (kind === 'skill' ? SKILL_RUNES : LINK_RUNES).filter(
      (r) =>
        tags.every((t) => r.tags.includes(t)) &&
        (!color || r.color === color) &&
        (!changedOnly || r.status === 'new' || r.change === 'major') &&
        (!needle || SEARCH_INDEX.get(`${r.kind}:${r.id}`)!.includes(needle)),
    )
  }, [kind, q, tags, color, changedOnly])

  const selected = runes.find((r) => r.id === selectedId) ?? (selectedId ? [...SKILL_RUNES, ...LINK_RUNES].find((r) => r.id === selectedId && r.kind === kind) : undefined)

  const toggleTag = (t: string) => set({ tags: (tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]).join(',') })

  return (
    <div>
      <h1>รูน</h1>

      <details className="card glossary">
        <summary>วิธีอ่านค่าดาเมจ: “+%” กับ “ขยาย (Amplification)” ต่างกันยังไง</summary>
        <ul>
          <li>
            <b>ดาเมจ +X%</b> (<span className="mono">+X% DMG</span>) — <b>บวกรวมกัน</b> ก่อนแล้วค่อยคูณ เช่น +50% กับ +50% = ×2.0
          </li>
          <li>
            <b>ขยายดาเมจ X%</b> (<span className="mono">X% DMG Amplification</span>) — <b>คูณแยกทีละตัว</b> เช่น 20% กับ 20% = ×1.2 × 1.2 = ×1.44 จึงมีค่ามากกว่า
          </li>
          <li>
            <b>ลด/ลดทอน X%</b> (<span className="mono">Dampening</span>) — คูณด้วย (1 − X%)
          </li>
          <li>
            ค่าที่ <b>“ประมาณ”</b> คือเลเวลที่เกมไม่ได้เปิดเผย (เปิดเผยแค่ Lv.1 และ Lv.45) คำนวณแบบเส้นตรง
          </li>
        </ul>
      </details>

      <div className="cat-tabs" role="tablist">
        <button role="tab" aria-selected={kind === 'skill'} className={`btn ${kind === 'skill' ? 'active' : ''}`} onClick={() => set({ kind: '', tags: '', id: '' })}>
          รูนสกิล <span className="count">{SKILL_RUNES.length}</span>
        </button>
        <button role="tab" aria-selected={kind === 'link'} className={`btn ${kind === 'link' ? 'active' : ''}`} onClick={() => set({ kind: 'link', tags: '', id: '' })}>
          รูนลิงก์ <span className="count">{LINK_RUNES.length}</span>
        </button>
      </div>

      <div className="toolbar">
        <input type="search" className="grow" placeholder="ค้นหาชื่อ คำอธิบาย หรือค่าสถานะ" value={q} onChange={(e) => set({ q: e.target.value })} aria-label="ค้นหารูน" />
        <ColorFilter value={color} onChange={(c) => set({ color: c })} />
        <label className="check">
          <input type="checkbox" checked={changedOnly} onChange={(e) => set({ changed: e.target.checked ? '1' : '' })} /> เฉพาะที่ใหม่/เปลี่ยนสำคัญใน S12
        </label>
        <label className="check">
          <input type="checkbox" checked={showEn} onChange={(e) => set({ en: e.target.checked ? '1' : '' })} /> แสดงภาษาอังกฤษ
        </label>
      </div>

      <div className="type-chips">
        {TAGS[kind].map(([t, n]) => (
          <button key={t} className={`chip-btn ${tags.includes(t) ? 'active' : ''}`} onClick={() => toggleTag(t)} title={TAG_TH[t]}>
            {t} <span className="count">{n}</span>
          </button>
        ))}
        {tags.length > 0 && (
          <button className="chip-btn" onClick={() => set({ tags: '' })}>
            ✕ ล้างแท็ก
          </button>
        )}
      </div>

      <div className={`runes-layout ${selected ? 'has-detail' : ''}`}>
        <div>
          <p className="faint result-count">พบ {runes.length} รูน</p>
          {runes.length === 0 ? (
            <div className="empty">ไม่พบรูนที่ตรงกับเงื่อนไข</div>
          ) : (
            <ul className="rune-list">
              {runes.map((r) => (
                <li key={r.id}>
                  <button className={`rune-row ${selected?.id === r.id ? 'active' : ''}`} onClick={() => set({ id: r.id })}>
                    <RuneIcon rune={r} size={38} />
                    <span className="rune-row-text">
                      <span className="rune-row-name">
                        <RuneName name={r.name} />
                        {r.status === 'new' && <span className="mini new">ใหม่</span>}
                        {r.change === 'major' && <span className="mini changed">เปลี่ยน</span>}
                      </span>
                      <span className="rune-row-desc dim">{thDescription(r.description).split('\n')[0]}</span>
                      <span className="rune-row-tags faint">{r.tags.join(' · ')}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected && (
          <aside className="rune-detail-pane card">
            <button className="btn close-detail" onClick={() => set({ id: '' })} aria-label="ปิด">
              ✕
            </button>
            <RuneDetail key={`${selected.kind}:${selected.id}`} rune={selected} showEnglish={showEn} />
          </aside>
        )}
      </div>
    </div>
  )
}
