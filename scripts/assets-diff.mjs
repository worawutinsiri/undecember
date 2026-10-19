// Compares two asset snapshots from data-raw/game-assets/ (written by assets-extract.mjs) and lists
// what each patch added or removed per category: skill/link rune icons, equipment, essences,
// maps, blueprints, … Rune icons are named via buildDecember's RuneList.json (icon → rune name).
//
// Usage: node scripts/assets-diff.mjs [<old.tsv> <new.tsv>] [--out <report.md>] [--unnamed]
//   no files   compare the two newest snapshots
//   --out      also write the full report as Markdown (the console shows up to 40 per list)
//   --unnamed  list rune icons in the new snapshot that no known rune uses (new, unreleased or cut)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATEGORIES, categorize, iconName, readSnapshot } from './lib/asset-catalog.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'data-raw', 'game-assets')
const CONSOLE_LIMIT = 40

const args = process.argv.slice(2)
const outIdx = args.indexOf('--out')
const outFile = outIdx >= 0 ? args[outIdx + 1] : null
const files = args.filter((a, i) => a.endsWith('.tsv') && (outIdx < 0 || i !== outIdx + 1))

let [oldFile, newFile] = files
if (!newFile) {
  const snaps = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.tsv'))
    .sort((a, b) => Number(a.match(/(\d+)\.tsv$/)?.[1] ?? 0) - Number(b.match(/(\d+)\.tsv$/)?.[1] ?? 0))
  if (snaps.length < 2) {
    console.error(`need two snapshots in ${DIR} (run npm run assets:extract -- --all), or pass two .tsv files`)
    process.exit(1)
  }
  ;[oldFile, newFile] = snaps.slice(-2).map((f) => path.join(DIR, f))
}
const before = readSnapshot(oldFile)
const after = readSnapshot(newFile)

// Rune names: buildDecember's icon file → rune title, then our DB for runes buildDecember lacks,
// matched when the icon's internal name is the rune name without spaces/punctuation — allowing 2
// typos for long names, since the game has some (Icon_Skill_FrostStrom_01 is Frost Storm).
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// Edit distance counting a swap of two neighbouring letters as one edit.
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  return d[a.length][b.length]
}
const runeName = new Map()
for (const r of JSON.parse(fs.readFileSync(path.join(ROOT, 'data-raw', 'buildDecember', 'RuneList.json'), 'utf8')))
  if (r.icon) runeName.set(r.icon.replace(/\.png$/, ''), r.title)
const known = new Set(runeName.values())
const dbByNorm = new Map()
for (const f of ['skill-runes', 'link-runes'])
  for (const r of JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'generated', `${f}.json`), 'utf8')))
    if (!known.has(r.name)) dbByNorm.set(norm(r.name), r.name)

function nameOfRune(icon) {
  if (runeName.has(icon)) return runeName.get(icon)
  const core = norm(icon.replace(/^Icon_(Skill|LinkSkill)_/, '').replace(/_\d+$/, ''))
  let best = null
  for (const [key, name] of dbByNorm) {
    const dist = editDistance(core, key)
    if (dist <= (key.length >= 10 ? 2 : 0) && (!best || dist < best.dist)) best = { name, dist }
  }
  return best ? `${best.name} (guessed from name)` : null
}

function label(a, cat) {
  if (cat === 'skill' || cat === 'link') {
    const icon = iconName(a.path)
    const name = nameOfRune(icon)
    return name ? `${icon} — ${name}` : icon
  }
  if (a.path.startsWith('/Game/UI/Texture/Icon/')) return iconName(a.path)
  return a.path.replace(/^\/Game\//, '')
}

const keyOf = (a) => `${a.cls}\t${a.path}`
const beforeKeys = new Set(before.assets.map(keyOf))
const afterKeys = new Set(after.assets.map(keyOf))
const sections = CATEGORIES.map((c) => ({ ...c, added: [], removed: [] }))
const byKey = new Map(sections.map((s) => [s.key, s]))
for (const a of after.assets) if (!beforeKeys.has(keyOf(a))) byKey.get(categorize(a))?.added.push(label(a, categorize(a)))
for (const a of before.assets) if (!afterKeys.has(keyOf(a))) byKey.get(categorize(a))?.removed.push(label(a, categorize(a)))

function report(limit) {
  const out = []
  const title = (s) => `${s.meta.pak} (${s.meta.date})`
  out.push(`# Asset diff: ${title(before)} → ${title(after)}`, '')
  out.push('| Category | Added | Removed |', '| --- | ---: | ---: |')
  for (const s of sections) if (s.added.length || s.removed.length) out.push(`| ${s.label} | ${s.added.length} | ${s.removed.length} |`)
  if (sections.every((s) => !s.added.length && !s.removed.length)) out.push('| (no changes) | 0 | 0 |')
  const list = (heading, items) => {
    if (!items.length) return
    out.push('', `${heading} (${items.length}):`)
    for (const it of items.slice(0, limit)) out.push(`- ${it}`)
    if (items.length > limit) out.push(`- … ${items.length - limit} more (use --out for the full list)`)
  }
  for (const s of sections) {
    if (!s.added.length && !s.removed.length) continue
    out.push('', `## ${s.label}`)
    list('Added', s.added)
    list('Removed', s.removed)
  }
  if (args.includes('--unnamed')) {
    const unnamed = after.assets
      .filter((a) => ['skill', 'link'].includes(categorize(a)) && !nameOfRune(iconName(a.path)))
      .map((a) => iconName(a.path))
    out.push('', `## Rune icons with no known rune (${unnamed.length})`, '')
    out.push('Icons in the game that neither buildDecember nor our data names — new, unreleased or cut runes, plus UI placeholders.', '')
    for (const it of unnamed.slice(0, limit)) out.push(`- ${it}`)
    if (unnamed.length > limit) out.push(`- … ${unnamed.length - limit} more (use --out for the full list)`)
  }
  return out.join('\n') + '\n'
}

console.log(report(CONSOLE_LIMIT))
if (outFile) {
  fs.writeFileSync(outFile, report(Infinity))
  console.log(`full report written to ${outFile}`)
}
