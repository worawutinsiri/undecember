import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { COLOR_TH, GRADE_TH, TAG_TH } from '../i18n/labels'
import { thDescription } from '../i18n/translate'
import { gradeLines, runeLinesAt } from '../lib/runeLevel'
import { RuneIcon } from './RuneIcon'
import { RuneName } from './RuneName'
import { TipContext, type TipSpec } from './runeTips'
import { StatLines } from './StatLines'
import './RuneTooltip.css'

/** The card shown on hover: name (EN + official TH), tags, description and stats at the given level. */
export function RuneCard({ rune, level = 45, grade = 'normal', note }: TipSpec) {
  const { lines, estimated } = runeLinesAt(rune, level)
  const extra = gradeLines(rune, grade)
  return (
    <div className="rune-card">
      <header className="rc-head">
        <RuneIcon rune={rune} size={36} />
        <div className="rc-title">
          <RuneName name={rune.name} />
          <span className="rc-kind">
            {rune.kind === 'skill' ? 'รูนสกิล' : 'รูนลิงก์'}
            {rune.color && ` · ${COLOR_TH[rune.color]}`}
          </span>
        </div>
      </header>
      {note && <p className="rc-note">{note}</p>}
      <div className="rc-tags">
        {rune.tags.map((t) => (
          <span key={t} className="chip" title={TAG_TH[t]}>
            {t}
          </span>
        ))}
      </div>
      <p className="rc-desc">{thDescription(rune.description)}</p>
      <div className="rc-section">
        <h4>
          ค่าที่ Lv.{level}
          {estimated && <span className="est">ประมาณ</span>}
        </h4>
        <StatLines lines={lines} />
      </div>
      {extra.length > 0 && (
        <div className="rc-section">
          <h4>เกรด {GRADE_TH[grade]}</h4>
          <StatLines lines={extra} className="grade-lines" />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- hover tooltip

interface TipState {
  spec: TipSpec
  rect: DOMRect
}

// Hover cards only make sense with a mouse; touch users get the same info in the editor and picker.
const canHover = () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

export function RuneTooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<TipState | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const hide = useCallback(() => {
    window.clearTimeout(timer.current)
    setTip(null)
  }, [])
  const show = useCallback((spec: TipSpec, el: Element) => {
    if (!canHover()) return
    window.clearTimeout(timer.current)
    const rect = el.getBoundingClientRect()
    timer.current = window.setTimeout(() => setTip({ spec, rect }), 180)
  }, [])

  // any press (start of a drag, a click) or scroll closes the card
  useEffect(() => {
    window.addEventListener('pointerdown', hide, true)
    window.addEventListener('scroll', hide, true)
    return () => {
      window.removeEventListener('pointerdown', hide, true)
      window.removeEventListener('scroll', hide, true)
    }
  }, [hide])

  const value = useMemo(() => ({ show, hide }), [show, hide])
  return (
    <TipContext.Provider value={value}>
      {children}
      {tip && createPortal(<FloatingCard tip={tip} />, document.body)}
    </TipContext.Provider>
  )
}

function FloatingCard({ tip }: { tip: TipState }) {
  const ref = useRef<HTMLDivElement>(null)

  // place to the right of the target, else to the left; keep inside the viewport
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const gap = 10
    const r = tip.rect
    let left = r.right + gap
    if (left + width > window.innerWidth - 8) left = r.left - gap - width
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
    const top = Math.max(8, Math.min(r.top, window.innerHeight - height - 8))
    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [tip])

  return (
    <div ref={ref} className="rune-tooltip" role="tooltip">
      <RuneCard {...tip.spec} />
    </div>
  )
}

