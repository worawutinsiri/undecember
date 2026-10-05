import type { RuneColor } from '../data/types'
import './ColorFilter.css'

const OPTIONS: { value: RuneColor | ''; label: string; title: string }[] = [
  { value: '', label: 'ทุกสี', title: 'แสดงทุกสี' },
  { value: 'red', label: 'แดง', title: 'รูนสีแดง (Strength)' },
  { value: 'green', label: 'เขียว', title: 'รูนสีเขียว (Dexterity)' },
  { value: 'blue', label: 'น้ำเงิน', title: 'รูนสีน้ำเงิน (Intelligence)' },
]

/** Rune colour filter: all / red / green / blue. */
export function ColorFilter({ value, onChange, compact = false }: { value: RuneColor | ''; onChange: (c: RuneColor | '') => void; compact?: boolean }) {
  return (
    <div className={`color-filter ${compact ? 'compact' : ''}`} role="radiogroup" aria-label="กรองตามสีรูน">
      {OPTIONS.map((o) => (
        <button
          key={o.value || 'all'}
          role="radio"
          aria-checked={value === o.value}
          className={`cf-btn ${o.value ? `cf-${o.value}` : 'cf-all'} ${value === o.value ? 'active' : ''}`}
          title={o.title}
          onClick={() => onChange(o.value)}
        >
          {o.value && <span className="cf-dot" aria-hidden />}
          {o.label}
        </button>
      ))}
    </div>
  )
}
