import lines from '../data/th/lines.json'
import descriptions from '../data/th/descriptions.json'

const LINES = lines as Record<string, string>
const DESCRIPTIONS = descriptions as Record<string, string>

// Keep in sync with toTemplate() in scripts/i18n-extract.mjs
const TOKEN = /\[[\d.]+-[\d.]+\]|\d+(?:\.\d+)?/g

export function toTemplate(line: string): { template: string; values: string[] } {
  const values: string[] = []
  const template = line.replace(TOKEN, (m) => `{${values.push(m) - 1}}`)
  return { template, values }
}

/** Thai version of a stat line; falls back to the English line when there is no translation. */
export function thLine(line: string): string {
  const { template, values } = toTemplate(line)
  const th = LINES[template]
  if (!th) return line
  return th.replace(/\{(\d+)\}/g, (_, i: string) => values[Number(i)] ?? '')
}

export function hasThLine(line: string): boolean {
  return toTemplate(line).template in LINES
}

export function thDescription(text: string): string {
  return DESCRIPTIONS[text] ?? text
}
