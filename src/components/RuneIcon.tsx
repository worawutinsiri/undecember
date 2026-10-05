import type { Rune } from '../data/types'
import './RuneIcon.css'

/** Hexagon for skill runes, rounded diamond for link runes — colored by the rune's main stat. */
export function RuneIcon({ rune, size = 36 }: { rune: Pick<Rune, 'kind' | 'color' | 'name'>; size?: number }) {
  const initials = rune.name
    .split(/[\s-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
  return (
    <span className={`rune-icon ${rune.kind} c-${rune.color ?? 'none'}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        {rune.kind === 'skill' ? (
          <path d="M20 2 36 11v18L20 38 4 29V11z" />
        ) : (
          <path d="M20 3 37 20 20 37 3 20z" strokeLinejoin="round" />
        )}
      </svg>
      <span className="rune-initials" style={{ fontSize: size * 0.32 }}>
        {initials}
      </span>
    </span>
  )
}
