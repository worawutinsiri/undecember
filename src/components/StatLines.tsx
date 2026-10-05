import { thLine } from '../i18n/translate'
import './StatLines.css'

/** Stat lines in Thai, with the English original on hover (or always, with showEnglish). */
export function StatLines({
  lines,
  showEnglish = false,
  className = '',
  marker,
}: {
  lines: string[]
  showEnglish?: boolean
  className?: string
  marker?: (line: string, i: number) => string | undefined
}) {
  if (lines.length === 0) return null
  return (
    <ul className={`stat-lines ${className}`}>
      {lines.map((l, i) => {
        const th = thLine(l)
        return (
          <li key={i} title={th !== l ? l : undefined} className={marker?.(l, i)}>
            <span>{th}</span>
            {showEnglish && th !== l && <span className="stat-en">{l}</span>}
          </li>
        )
      })}
    </ul>
  )
}
