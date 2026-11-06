import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LINK_RUNES, SKILL_RUNES } from '../data'
import { DAMAGE_TYPES, GUIDE_NUMBERS_NOTE, GUIDE_SOURCES, SKILL_GUIDES, type GuideSet } from '../data/runeGuide'
import type { Rune } from '../data/types'
import { AWAKENING_TH, TAG_TH } from '../i18n/labels'
import { runeNameTh } from '../i18n/translate'
import { LINK_GROUPS, analyseLinks, awakeningLinks, damageKind, effectLines, groupsOf, resourceCost, type DamageKind, type LinkGroupId } from '../lib/runeGuide'
import { RuneIcon } from './RuneIcon'
import { RuneName } from './RuneName'
import { useRuneTips } from './runeTips'
import { StatLines } from './StatLines'
import './RuneGuide.css'

const LINK_BY_NAME = new Map(LINK_RUNES.map((r) => [r.name, r]))
const QUICK_PICKS = Object.keys(SKILL_GUIDES).flatMap((name) => SKILL_RUNES.filter((r) => r.name === name))

const KIND_LABEL: Record<DamageKind, string> = {
  hit: 'ตีโดน: ใช้คริหรือ Maximized ได้',
  dot: 'DoT ล้วน: คริและ Maximized ไม่มีผล',
  mixed: 'มีทั้งตีโดนและ DoT',
  other: 'ไม่มีแท็ก Strike หรือ DoT',
}

const nameMatches = (r: Rune, needle: string) => r.name.toLowerCase().includes(needle) || !!runeNameTh(r.name)?.includes(needle)
const tagMatches = (r: Rune, needle: string) => r.tags.some((t) => t.toLowerCase().includes(needle))

function RuneChip({ name }: { name: string }) {
  const tip = useRuneTips()
  const rune = LINK_BY_NAME.get(name)
  if (!rune) return <span className="chip">{name}</span>
  return (
    <Link className="rg-chip" to={`/runes?kind=link&id=${rune.id}`} {...tip({ rune, level: 45, grade: 'legendary' })}>
      <RuneIcon rune={rune} size={20} />
      {name}
    </Link>
  )
}

function DamageTypes() {
  return (
    <details className="rg-types-wrap" open>
      <summary>ดาเมจ 3 แบบ ใช้รูนต่างกัน</summary>
      <div className="rg-types">
        {DAMAGE_TYPES.map((t) => (
          <article key={t.title} className="rg-type">
            <h4>{t.title}</h4>
            <p className="faint small">{t.examples}</p>
            <dl>
              <dt>คริ</dt>
              <dd>{t.crit}</dd>
              <dt>Maximized</dt>
              <dd>{t.maximized}</dd>
            </dl>
            <div className="rg-chips">
              {t.runes.map((name) => (
                <RuneChip key={name} name={name} />
              ))}
            </div>
            <p className="dim small">{t.note}</p>
          </article>
        ))}
      </div>
      <p className="faint small rg-sources">
        กติกาเรื่องคริและ Maximized มาจากโพสต์ผู้เล่น ไม่ใช่ข้อมูลทางการ:{' '}
        {GUIDE_SOURCES.map((s, i) => (
          <span key={s.url}>
            {i > 0 && ' · '}
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </span>
        ))}
      </p>
    </details>
  )
}

function SetCard({ set }: { set: GuideSet }) {
  return (
    <article className="rg-set">
      <h4>{set.label}</h4>
      <div className="rg-chips">
        {set.links.map((name) => (
          <RuneChip key={name} name={name} />
        ))}
      </div>
      <p className="faint small">{set.awakening.length ? `ปลุกพลัง: ${set.awakening.map((t) => AWAKENING_TH[t].replace('ปลุกพลัง ', '')).join(' + ')}` : 'ชุดนี้ยังไม่นับการปลุกพลัง'}</p>
      {set.note && <p className="dim small">{set.note}</p>}
    </article>
  )
}

function LinkRow({ rune, badge, warning }: { rune: Rune; badge?: string; warning?: string }) {
  const tip = useRuneTips()
  const cost = resourceCost(rune)
  return (
    <li className="rg-link" {...tip({ rune, level: 45, grade: 'legendary' })}>
      <RuneIcon rune={rune} size={30} />
      <div className="rg-link-body">
        <div className="rg-link-head">
          <Link to={`/runes?kind=link&id=${rune.id}`}>
            <RuneName name={rune.name} />
          </Link>
          {badge && <span className="mini new">{badge}</span>}
          {rune.status === 'legacy' && (
            <span className="mini legacy" title="ไม่อยู่ในชีท S12 ค่ามาจาก BuildDecember จึงอาจเก่าหรือขาดไลน์">
              ข้อมูลเก่า
            </span>
          )}
        </div>
        <StatLines lines={effectLines(rune)} className="rg-lines" />
        {warning && <p className="warn-text small">{warning}</p>}
        {cost && <p className="faint small">ทรัพยากร +{cost}</p>}
      </div>
    </li>
  )
}

// A skill can take over 100 link runes, so the full list waits behind a button until a filter narrows it.
const INITIAL_ROWS = 12

function SkillPanel({ skill }: { skill: Rune }) {
  const [group, setGroup] = useState<LinkGroupId | ''>('')
  const [q, setQ] = useState('')
  const [showAll, setShowAll] = useState(false)
  const guide = SKILL_GUIDES[skill.name]
  const analysis = useMemo(() => analyseLinks(skill), [skill])
  const awakening = useMemo(() => awakeningLinks(skill), [skill])
  const kind = damageKind(skill)

  const recommended = useMemo(() => new Set(guide?.sets.flatMap((s) => s.links) ?? []), [guide])
  const counts = useMemo(() => {
    const m = new Map<LinkGroupId, number>()
    for (const r of analysis.usable) for (const g of groupsOf(r)) m.set(g, (m.get(g) ?? 0) + 1)
    return m
  }, [analysis])

  const needle = q.trim().toLowerCase()
  const rows = analysis.usable
    .filter((r) => (!group || groupsOf(r).includes(group)) && (!needle || nameMatches(r, needle)))
    .sort((a, b) => Number(recommended.has(b.name)) - Number(recommended.has(a.name)) || a.name.localeCompare(b.name))
  const visible = showAll || group || needle ? rows : rows.slice(0, Math.max(INITIAL_ROWS, recommended.size))

  const forbiddenBy = (name: string) =>
    awakening
      .filter((a) => a.forbids && a.rune === name)
      .map((a) => AWAKENING_TH[a.tier])
      .join(', ')

  return (
    <div className="rg-panel">
      <header className="rg-skill">
        <RuneIcon rune={skill} size={46} />
        <div className="rg-skill-text">
          <h3>
            <RuneName name={skill.name} />
          </h3>
          <p className={`rg-kind k-${kind}`}>{KIND_LABEL[kind]}</p>
          <div className="rg-tags">
            {skill.tags.map((t) => (
              <span key={t} className="chip" title={TAG_TH[t]}>
                {t}
              </span>
            ))}
            {skill.restrictions.map((t) => (
              <span key={t} className="chip rg-restriction">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="rg-actions">
          <Link className="btn" to={`/runes?id=${skill.id}`}>
            ดูรูนเต็ม
          </Link>
          <Link className="btn" to={`/simulator?add=skill:${skill.id}`}>
            ⬡ นำไปจำลอง
          </Link>
        </div>
      </header>

      <details className="rg-stats">
        <summary>ค่าสกิลที่ Lv45 เกรด Legendary และปลุกพลัง</summary>
        <div className="rg-stats-grid">
          <div>
            <h4>Lv45</h4>
            <StatLines lines={skill.lv45} />
          </div>
          {!!skill.grades.legendary?.length && (
            <div>
              <h4>เกรด Legendary</h4>
              <StatLines lines={skill.grades.legendary} />
            </div>
          )}
          {(['source', 'origin', 'verity'] as const).map(
            (t) =>
              skill.awakening[t].length > 0 && (
                <div key={t}>
                  <h4>{AWAKENING_TH[t]}</h4>
                  <StatLines lines={skill.awakening[t]} />
                </div>
              ),
          )}
        </div>
      </details>

      {(guide?.notes.length || awakening.length > 0 || /not affected by Projectile DMG/.test(skill.description) || kind === 'dot' || kind === 'mixed') && (
        <section>
          <h4>ควรรู้</h4>
          <ul className="rg-notes">
            {guide?.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
            {/not affected by Projectile DMG/.test(skill.description) && <li>ไม่ได้ผลจาก Projectile DMG รูนที่เพิ่มแต่ค่านี้จึงไม่ช่วย</li>}
            {awakening.map((a) => (
              <li key={`${a.tier}:${a.rune}`}>
                {AWAKENING_TH[a.tier]}: {a.grants ? `ได้ผล ${a.rune} ในตัว` : ''}
                {a.grants && a.forbids ? ' และ' : ''}
                {a.forbids ? `ลิงก์ ${a.rune} ไม่ได้` : ''}
              </li>
            ))}
            {(kind === 'dot' || kind === 'mixed') && <li>ตัวจำลองในเว็บยังคำนวณ DoT ไม่ได้ ตัวเลขในหน้าจำลองจึงไม่รวมส่วนนี้</li>}
          </ul>
        </section>
      )}

      {!!guide?.sets.length && (
        <section>
          <h4>ชุดที่คำนวณไว้แล้ว</h4>
          <div className="rg-sets">
            {guide.sets.map((s) => (
              <SetCard key={s.label} set={s} />
            ))}
          </div>
          {guide.sets.some((s) => s.note?.includes('ล้าน')) && <p className="faint small">{GUIDE_NUMBERS_NOTE}</p>}
        </section>
      )}

      {analysis.triggers.length > 0 && (
        <section>
          <h4>รูนร่ายสกิลและทริกเกอร์</h4>
          <ul className="rg-trigger-list">
            {analysis.triggers.map(({ rune, roles }) => (
              <li key={rune.id}>
                <RuneChip name={rune.name} />
                <span className="dim small">{[roles.activator && 'สกิลนี้เป็นตัวเปิดได้', roles.target && 'สกิลนี้ถูกร่ายได้'].filter(Boolean).join(' และ')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h4>รูนลิงก์ที่ใส่ได้ {analysis.usable.length} ตัว</h4>
        <p className="faint small">ค่าที่ Lv45 รวมไลน์เกรด Legendary · ชี้ที่รูนเพื่อดูคำอธิบาย</p>
        <div className="rg-filters">
          <input type="search" placeholder="ค้นชื่อรูนลิงก์" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นชื่อรูนลิงก์" />
          <button className={`chip-btn ${group === '' ? 'active' : ''}`} aria-pressed={group === ''} onClick={() => setGroup('')}>
            ทั้งหมด
          </button>
          {LINK_GROUPS.filter((g) => counts.get(g.id)).map((g) => (
            <button key={g.id} className={`chip-btn ${group === g.id ? 'active' : ''}`} aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
              {g.label} <span className="count">{counts.get(g.id)}</span>
            </button>
          ))}
        </div>
        {rows.length ? (
          <ul className="rg-links">
            {visible.map((r) => {
              const forbidden = forbiddenBy(r.name)
              return <LinkRow key={r.id} rune={r} badge={recommended.has(r.name) ? 'อยู่ในชุดด้านบน' : undefined} warning={forbidden ? `ลิงก์ไม่ได้ถ้า${forbidden}` : undefined} />
            })}
          </ul>
        ) : (
          <div className="empty">ไม่พบรูนที่ตรงกับเงื่อนไข</div>
        )}
        {visible.length < rows.length && (
          <button className="btn rg-more" onClick={() => setShowAll(true)}>
            แสดงอีก {rows.length - visible.length} ตัว
          </button>
        )}
      </section>

      {analysis.blocked.length > 0 && (
        <details className="rg-blocked">
          <summary>รูนที่ใส่ไม่ได้ {analysis.blocked.reduce((n, b) => n + b.runes.length, 0)} ตัว พร้อมเหตุผล</summary>
          <dl>
            {analysis.blocked.map((b) => (
              <div key={b.reason}>
                <dt>{b.reason}</dt>
                <dd className="dim small">{b.runes.map((r) => r.name).join(', ')}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  )
}

/** Pick a skill rune and see what fits it: rules, worked-out sets and every link rune it can take. */
export function RuneGuide() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const selected = SKILL_RUNES.find((r) => r.id === params.get('skill'))
  const needle = q.trim().toLowerCase()
  // Runes named after the search first, then runes that only carry it as a tag.
  const matches = needle ? [...SKILL_RUNES.filter((r) => nameMatches(r, needle)), ...SKILL_RUNES.filter((r) => !nameMatches(r, needle) && tagMatches(r, needle))] : []

  const pick = (id: string) => {
    setQ('')
    const next = new URLSearchParams(params)
    if (id) next.set('skill', id)
    else next.delete('skill')
    setParams(next, { replace: true })
  }

  return (
    <section className="card rune-guide">
      <h2>ตัวช่วยจัดรูน</h2>
      <p className="dim">เลือกรูนสกิล แล้วดูว่ารูนลิงก์ตัวไหนใส่ได้ ตัวไหนใส่ไม่ได้เพราะอะไร และมีชุดที่คำนวณไว้แล้วหรือไม่</p>

      <DamageTypes />

      <div className="rg-picker">
        <input type="search" placeholder="ค้นรูนสกิลจากชื่อหรือแท็ก เช่น Fire Ball, Poison" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ค้นรูนสกิล" />
        {needle && (
          <ul className="rg-results">
            {matches.map((r) => (
              <li key={r.id}>
                <button onClick={() => pick(r.id)}>
                  <RuneIcon rune={r} size={24} />
                  <RuneName name={r.name} />
                  <span className="faint small">{r.tags.slice(0, 4).join(' · ')}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="faint small">ไม่พบรูนสกิล</li>}
          </ul>
        )}
        <div className="rg-quick">
          <span className="faint small">มีชุดหรือคำแนะนำแล้ว:</span>
          {QUICK_PICKS.map((r) => (
            <button key={r.id} className={`chip-btn ${selected?.id === r.id ? 'active' : ''}`} aria-pressed={selected?.id === r.id} onClick={() => pick(r.id)}>
              {r.name}
            </button>
          ))}
          {selected && (
            <button className="chip-btn" onClick={() => pick('')}>
              ✕ ล้าง
            </button>
          )}
        </div>
      </div>

      {selected && <SkillPanel key={selected.id} skill={selected} />}
    </section>
  )
}
