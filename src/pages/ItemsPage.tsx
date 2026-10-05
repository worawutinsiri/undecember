import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UNIQUES } from '../data'
import type { ItemCategory, UniqueItem } from '../data/types'
import { ItemCard } from '../components/ItemCard'
import { CATEGORY_ORDER, CATEGORY_TH, gearTypeTh } from '../i18n/labels'
import { thLine } from '../i18n/translate'
import './ItemsPage.css'

type Sort = 'tier-desc' | 'tier-asc' | 'level-asc' | 'name'

const SORTS: Record<Sort, { label: string; fn: (a: UniqueItem, b: UniqueItem) => number }> = {
  'tier-desc': { label: 'เทียร์สูง → ต่ำ', fn: (a, b) => (b.tier ?? 0) - (a.tier ?? 0) || a.name.localeCompare(b.name) },
  'tier-asc': { label: 'เทียร์ต่ำ → สูง', fn: (a, b) => (a.tier ?? 0) - (b.tier ?? 0) || a.name.localeCompare(b.name) },
  'level-asc': { label: 'เลเวลที่ต้องการ', fn: (a, b) => (a.reqLevel ?? 0) - (b.reqLevel ?? 0) || a.name.localeCompare(b.name) },
  name: { label: 'ชื่อ A → Z', fn: (a, b) => a.name.localeCompare(b.name) },
}

// Search text per item: name, gear type (EN/TH) and every option line in both languages.
const SEARCH_INDEX = new Map(
  UNIQUES.map((u) => {
    const lines = [...u.implicit, ...u.innate, ...u.options]
    return [u.id, [u.name, u.gearType, gearTypeTh(u.gearType), ...lines, ...lines.map(thLine)].join('\n').toLowerCase()]
  }),
)

export function ItemsPage() {
  const [params, setParams] = useSearchParams()
  const cat = (params.get('cat') ?? 'all') as ItemCategory | 'all'
  const type = params.get('type') ?? ''
  const q = params.get('q') ?? ''
  const sort = (params.get('sort') ?? 'tier-desc') as Sort
  const transcendent = params.get('tr') ?? 'all'
  const showEn = params.get('en') === '1'

  const set = (key: string, value: string, reset: string[] = []) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    reset.forEach((k) => next.delete(k))
    setParams(next, { replace: true })
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: UNIQUES.length }
    for (const u of UNIQUES) c[u.category] = (c[u.category] ?? 0) + 1
    return c
  }, [])

  const typesInCat = useMemo(() => {
    const m = new Map<string, number>()
    for (const u of UNIQUES) if (cat === 'all' || u.category === cat) m.set(u.gearType, (m.get(u.gearType) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [cat])

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return UNIQUES.filter(
      (u) =>
        (cat === 'all' || u.category === cat) &&
        (!type || u.gearType === type) &&
        (transcendent === 'all' || (transcendent === 'only') === u.transcendent) &&
        (!needle || SEARCH_INDEX.get(u.id)!.includes(needle)),
    ).sort(SORTS[sort]?.fn ?? SORTS['tier-desc'].fn)
  }, [cat, type, q, sort, transcendent])

  return (
    <div>
      <h1>ไอเทม Unique</h1>
      <p className="dim page-lead">ไอเทม Unique ที่เพิ่มหรือปรับสมดุลใน Season 11–12 จากชีททางการ · ชี้ที่บรรทัดเพื่อดูข้อความภาษาอังกฤษ</p>

      <div className="cat-tabs" role="tablist">
        {(['all', ...CATEGORY_ORDER] as const)
          .filter((c) => c === 'all' || counts[c])
          .map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={`btn ${cat === c ? 'active' : ''}`} onClick={() => set('cat', c === 'all' ? '' : c, ['type'])}>
              {c === 'all' ? 'ทั้งหมด' : CATEGORY_TH[c]} <span className="count">{counts[c]}</span>
            </button>
          ))}
      </div>

      <div className="type-chips">
        <button className={`chip-btn ${!type ? 'active' : ''}`} onClick={() => set('type', '')}>
          ทุกชนิด
        </button>
        {typesInCat.map(([t, n]) => (
          <button key={t} className={`chip-btn ${type === t ? 'active' : ''}`} onClick={() => set('type', type === t ? '' : t)}>
            {gearTypeTh(t)} <span className="faint">{t}</span> <span className="count">{n}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input type="search" placeholder="ค้นหาชื่อหรือออปชัน เช่น Fire Ball, ความเร็วโจมตี" value={q} onChange={(e) => set('q', e.target.value)} className="grow" aria-label="ค้นหาไอเทม" />
        <select value={transcendent} onChange={(e) => set('tr', e.target.value === 'all' ? '' : e.target.value)} aria-label="Transcendent">
          <option value="all">ทั้งปกติและ Transcendent</option>
          <option value="normal">ไม่รวม Transcendent</option>
          <option value="only">เฉพาะ Transcendent</option>
        </select>
        <select value={sort} onChange={(e) => set('sort', e.target.value === 'tier-desc' ? '' : e.target.value)} aria-label="เรียงลำดับ">
          {Object.entries(SORTS).map(([k, s]) => (
            <option key={k} value={k}>
              {s.label}
            </option>
          ))}
        </select>
        <label className="check">
          <input type="checkbox" checked={showEn} onChange={(e) => set('en', e.target.checked ? '1' : '')} /> แสดงภาษาอังกฤษ
        </label>
      </div>

      <p className="faint result-count">พบ {items.length} ชิ้น</p>
      {items.length === 0 ? (
        <div className="empty">ไม่พบไอเทมที่ตรงกับเงื่อนไข</div>
      ) : (
        <div className="grid-cards items-grid">
          {items.map((u) => (
            <ItemCard key={u.id} item={u} showEnglish={showEn} />
          ))}
        </div>
      )}
    </div>
  )
}
