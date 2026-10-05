import { useMemo, useState } from 'react'
import { LINK_RUNES, SKILL_RUNES } from '../../data'
import type { Rune, RuneColor } from '../../data/types'
import { runeNameTh, thDescription } from '../../i18n/translate'
import { adjacentSkills, duplicateSkill, runeOf, type Cells } from '../../lib/buildState'
import { ALL_WHITE, DIR_TH, DIRS, SLOT_TH, connect, hexKey, neighbour, parseKey } from '../../lib/hexBoard'
import { ColorFilter } from '../ColorFilter'
import { matchesColor } from '../../lib/runeColor'
import { RuneIcon } from '../RuneIcon'
import { RuneName } from '../RuneName'
import { useRuneTips } from '../runeTips'
import type { Preview } from './RuneBoard'

// Focus the search box with a mouse, but don't pop up the on-screen keyboard on touch devices.
const FINE_POINTER = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: fine)').matches

const nameMatches = (r: Rune, needle: string) => !needle || r.name.toLowerCase().includes(needle) || !!runeNameTh(r.name)?.includes(needle)

interface Verdict {
  name: string
  ok: boolean
  reason?: string
}

/**
 * Picker for one board cell: lists the runes that fit there, and for link runes shows
 * which neighbouring skill runes each one would actually link to.
 */
export function CellPicker({
  cellKey,
  cells,
  kinds,
  onPick,
  onPreview,
  onClose,
}: {
  cellKey: string
  cells: Cells
  kinds: ('skill' | 'link')[]
  onPick: (kind: 'skill' | 'link', id: string) => void
  onPreview: (p: Preview | null) => void
  onClose: () => void
}) {
  const current = cells[cellKey]
  const skills = useMemo(() => adjacentSkills(cells, cellKey), [cells, cellKey])
  const initialTab = kinds.length === 1 ? kinds[0] : current?.kind ?? (skills.length ? 'link' : 'skill')
  const [tab, setTab] = useState<'skill' | 'link'>(initialTab)
  const [q, setQ] = useState('')
  const [fitsOnly, setFitsOnly] = useState(true)
  const [color, setColor] = useState<RuneColor | ''>('')
  const needle = q.trim().toLowerCase()
  const tip = useRuneTips()

  // links: judged against every neighbouring skill
  const linkRows = useMemo(() => {
    return LINK_RUNES.filter((r) => nameMatches(r, needle) || thDescription(r.description).includes(needle))
      .map((r) => {
        const verdicts: Verdict[] = skills.map((s) => ({ name: s.rune.name, ...connect(r, s.rune, s.cell.slots ?? ALL_WHITE, s.dirFromSkill) }))
        return { rune: r, verdicts, fits: verdicts.filter((v) => v.ok).length, onBoard: false }
      })
      .filter((row) => !fitsOnly || skills.length === 0 || row.fits > 0)
      .sort((a, b) => b.fits - a.fits || a.rune.name.localeCompare(b.rune.name))
  }, [needle, fitsOnly, skills])

  // skills: judged by how many neighbouring link runes would link to them
  const neighbourLinks = useMemo(
    () =>
      DIRS.flatMap((_, dir) => {
        const k = hexKey(neighbour(parseKey(cellKey), dir))
        const rune = runeOf(cells[k])
        return cells[k]?.kind === 'link' && rune ? [{ dir, rune }] : []
      }),
    [cells, cellKey],
  )
  const skillRows = useMemo(() => {
    const slots = current?.kind === 'skill' ? (current.slots ?? ALL_WHITE) : ALL_WHITE
    return SKILL_RUNES.filter((r) => nameMatches(r, needle) || r.tags.some((t) => t.toLowerCase().includes(needle)))
      .map((r) => {
        const verdicts: Verdict[] = neighbourLinks.map((l) => ({ name: l.rune.name, ...connect(l.rune, r, slots, l.dir) }))
        return { rune: r, verdicts, fits: verdicts.filter((v) => v.ok).length, onBoard: !!duplicateSkill(cells, r.id, cellKey) }
      })
      .sort((a, b) => Number(a.onBoard) - Number(b.onBoard) || b.fits - a.fits || a.rune.name.localeCompare(b.rune.name))
  }, [needle, neighbourLinks, current, cells, cellKey])

  const rows = (tab === 'link' ? linkRows : skillRows).filter((row) => matchesColor(row.rune.color, color))
  const tipFor = (r: Rune) => tip({ rune: r })
  const pick = (r: Rune) => {
    onPreview(null)
    onPick(r.kind, r.id)
  }

  return (
    <div className="palette card cell-picker" onMouseLeave={() => onPreview(null)}>
      <div className="cp-head">
        <button className="btn cp-back" onClick={onClose}>
          ← คลังทั้งหมด
        </button>
        <span className="faint small">{current ? `เปลี่ยน ${runeOf(current)?.name}` : 'เลือกรูนใส่ช่องนี้'}</span>
      </div>

      {kinds.length > 1 && (
        <div className="pal-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'link'} className={`btn ${tab === 'link' ? 'active' : ''}`} onClick={() => setTab('link')}>
            รูนลิงก์
          </button>
          <button role="tab" aria-selected={tab === 'skill'} className={`btn ${tab === 'skill' ? 'active' : ''}`} onClick={() => setTab('skill')}>
            รูนสกิล
          </button>
        </div>
      )}

      {tab === 'link' && (
        <div className="cp-context small">
          {skills.length ? (
            <>
              ช่องนี้ติดกับ:{' '}
              {skills.map((s) => (
                <span key={s.key} className="chip">
                  {s.rune.name} · ช่อง{DIR_TH[s.dirFromSkill]} {SLOT_TH[s.cell.slots?.[s.dirFromSkill] ?? 'white']}
                </span>
              ))}
            </>
          ) : (
            <span className="warn-text">ช่องนี้ยังไม่ติดกับรูนสกิล — รูนลิงก์จะยังไม่มีผลจนกว่าจะวางรูนสกิลข้าง ๆ</span>
          )}
        </div>
      )}

      <input type="search" placeholder="ค้นหา…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นหารูน" autoFocus={FINE_POINTER} />
      <ColorFilter value={color} onChange={setColor} compact />
      {tab === 'link' && skills.length > 0 && (
        <label className="check pal-compat">
          <input type="checkbox" checked={fitsOnly} onChange={(e) => setFitsOnly(e.target.checked)} /> เฉพาะที่ลิงก์กับสกิลข้างเคียงได้
        </label>
      )}
      <p className="faint pal-hint">ชี้เพื่อดูเส้นเชื่อมบนกระดาน · คลิกเพื่อใส่</p>

      <ul className="pal-list">
        {rows.map(({ rune: r, verdicts, fits, onBoard }) => (
          <li key={r.id}>
            <button
              className={`cp-entry ${current?.id === r.id && current.kind === r.kind ? 'current' : ''} ${(verdicts.length && !fits) || onBoard ? 'dimmed' : ''}`}
              onMouseEnter={(e) => {
                onPreview({ key: cellKey, kind: r.kind, id: r.id })
                tipFor(r).onMouseEnter?.(e)
              }}
              onMouseLeave={() => tipFor(r).onMouseLeave?.()}
              onFocus={(e) => {
                onPreview({ key: cellKey, kind: r.kind, id: r.id })
                tipFor(r).onFocus?.(e)
              }}
              onBlur={() => tipFor(r).onBlur?.()}
              onClick={() => pick(r)}
            >
              <RuneIcon rune={r} size={28} />
              <span className="pal-text">
                <RuneName name={r.name} className="pal-name" />
                {onBoard && <span className="pal-sub warn-text">อยู่บนกระดานแล้ว</span>}
                <span className="pal-sub faint">{thDescription(r.description).split('\n')[0]}</span>
                {verdicts.length > 0 && (
                  <span className="cp-verdicts">
                    {verdicts.map((v, i) => (
                      <span key={i} className={v.ok ? 'v-ok' : 'v-bad'} title={v.reason}>
                        {v.ok ? '✓' : '✕'} {v.name}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
        {rows.length === 0 && <li className="faint small">ไม่มีรูนที่ใส่ได้</li>}
      </ul>
    </div>
  )
}
