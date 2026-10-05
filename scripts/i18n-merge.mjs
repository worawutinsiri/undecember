// Merges translated chunks into src/data/th/{lines,descriptions}.json after validating placeholders.
//
// Usage: node scripts/i18n-merge.mjs <file.json> [...more]
//   each file is either { "<template>": "<thai>" } for lines or { "<english description>": "<thai>" }
//   for descriptions; files named descriptions*.json go to descriptions.json, the rest to lines.json.
// Run with --check to validate without writing.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TH = path.join(ROOT, 'src', 'data', 'th')

const args = process.argv.slice(2)
const check = args.includes('--check')
const files = args.filter((a) => a !== '--check')

const placeholders = (s) => (s.match(/\{\d+\}/g) ?? []).sort().join(',')
const load = (f) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'))
  } catch {
    return {}
  }
}

let errors = 0
const targets = { lines: load(path.join(TH, 'lines.json')), descriptions: load(path.join(TH, 'descriptions.json')) }
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'))
  const target = path.basename(f).startsWith('descriptions') ? 'descriptions' : 'lines'
  let n = 0
  for (const [en, th] of Object.entries(data)) {
    if (typeof th !== 'string' || !th.trim()) {
      console.log(`EMPTY  ${f}: ${en}`)
      errors++
      continue
    }
    if (placeholders(en) !== placeholders(th)) {
      console.log(`PLACEHOLDER MISMATCH ${f}:\n  en: ${en}\n  th: ${th}`)
      errors++
      continue
    }
    targets[target][en] = th.trim()
    n++
  }
  console.log(`${f}: ${n} ok`)
}

if (check) process.exit(errors ? 1 : 0)
fs.mkdirSync(TH, { recursive: true })
for (const [name, data] of Object.entries(targets)) {
  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)))
  fs.writeFileSync(path.join(TH, `${name}.json`), JSON.stringify(sorted, null, 1) + '\n')
}
console.log(`merged; ${errors} entries skipped`)
