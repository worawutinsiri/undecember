import { createContext, useCallback, useContext, type FocusEvent, type MouseEvent } from 'react'
import type { Rune, RuneGrade } from '../data/types'

export interface TipSpec {
  rune: Rune
  level?: number
  grade?: RuneGrade
  /** Extra line under the header, e.g. where the rune sits on the board. */
  note?: string
}

export const TipContext = createContext<{ show: (spec: TipSpec, el: Element) => void; hide: () => void } | null>(null)

/**
 * Returns a function that gives the props to spread on an element so it shows a rune card on
 * hover/focus — usable inside lists: `const tip = useRuneTips()` then `{...tip({ rune })}`.
 */
export function useRuneTips() {
  const ctx = useContext(TipContext)
  return useCallback(
    (spec: TipSpec | null) =>
      ctx && spec
        ? {
            onMouseEnter: (e: MouseEvent) => ctx.show(spec, e.currentTarget),
            onMouseLeave: ctx.hide,
            onFocus: (e: FocusEvent) => ctx.show(spec, e.currentTarget),
            onBlur: ctx.hide,
          }
        : {},
    [ctx],
  )
}
