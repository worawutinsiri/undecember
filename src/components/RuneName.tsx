import { runeNameTh } from '../i18n/translate'

/** English rune name with the official Thai name underneath (smaller, muted) when we have one. */
export function RuneName({ name, className = '' }: { name: string; className?: string }) {
  const th = runeNameTh(name)
  return (
    <span className={`rune-name ${className}`}>
      <span className="rn-en">{name}</span>
      {th && <span className="rn-th">{th}</span>}
    </span>
  )
}
