// Lists every stat-line template and rune description that has no Thai translation yet.
// A template replaces each number or [min-max] range with an indexed placeholder {0}, {1}, …
// so one translation covers every rune level and every roll range.
//
// Usage: node scripts/i18n-extract.mjs <outDir> [chunkSize]
//   writes <outDir>/lines-N.json (string[]) and <outDir>/descriptions.json ({ text: "" })
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GEN = path.join(ROOT, 'src', 'data', 'generated')
const TH = path.join(ROOT, 'src', 'data', 'th')

// Keep in sync with toTemplate() in src/i18n/translate.ts
const TOKEN = /\[[\d.]+-[\d.]+\]|\d+(?:\.\d+)?/g
export function toTemplate(line) {
  let i = 0
  return line.replace(TOKEN, () => `{${i++}}`)
}

const read = (f) => JSON.parse(fs.readFileSync(path.join(GEN, f), 'utf8'))
const readTh = (f) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(TH, f), 'utf8'))
  } catch {
    return {}
  }
}

const runes = [...read('skill-runes.json'), ...read('link-runes.json')]
const uniques = read('uniques.json')
const haveLines = readTh('lines.json')
const haveDesc = readTh('descriptions.json')

const templates = new Set()
const add = (l) => templates.add(toTemplate(l))
for (const r of runes) {
  ;[...r.lv1, ...r.lv45, ...r.restrictions, ...(r.prevLv45 ?? [])].forEach(add)
  Object.values(r.grades).flat().forEach(add)
  Object.values(r.awakening).flat().forEach(add)
}
for (const u of uniques) {
  ;[...u.implicit, ...u.innate, ...u.options].forEach(add)
  if (u.requirement) add(u.requirement)
}

const missing = [...templates].filter((t) => !(t in haveLines)).sort()
const descs = [...new Set(runes.map((r) => r.description))].filter((d) => !(d in haveDesc))

const outDir = process.argv[2]
const chunk = Number(process.argv[3] ?? 650)
if (!outDir) {
  console.log(`missing line templates: ${missing.length}, missing descriptions: ${descs.length}`)
  process.exit(0)
}
fs.mkdirSync(outDir, { recursive: true })
for (let i = 0; i * chunk < missing.length; i++) {
  fs.writeFileSync(path.join(outDir, `lines-${i + 1}.json`), JSON.stringify(missing.slice(i * chunk, (i + 1) * chunk), null, 1))
}
fs.writeFileSync(path.join(outDir, 'descriptions.json'), JSON.stringify(Object.fromEntries(descs.map((d) => [d, ''])), null, 1))
console.log(`wrote ${Math.ceil(missing.length / chunk)} line chunks (${missing.length} templates) and ${descs.length} descriptions to ${outDir}`)
