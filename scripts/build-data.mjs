// Builds src/data/generated/*.json from the raw sources in data-raw/.
//
// Primary source: LINE Games' official "Season Mode Changes" sheet (Season 12 The Farside),
//   https://ud.floor.line.games/us/bbs/guide/stat — exported tab by tab as CSV.
// Supplementary: nestula/BuildDecember RuneList.json (MIT) for rune color (main stat),
//   minimum rarity and how-to-get, joined by rune name.
//
// Usage: node scripts/build-data.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RAW = path.join(ROOT, 'data-raw')
const OUT = path.join(ROOT, 'src', 'data', 'generated')

// Minimal RFC 4180 parser — the sheet cells contain quoted multi-line text.
function parseCsv(s) {
  const rows = []
  let row = []
  let f = ''
  let q = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          f += '"'
          i++
        } else q = false
      } else f += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(f)
      f = ''
    } else if (c === '\n') {
      row.push(f)
      rows.push(row)
      row = []
      f = ''
    } else if (c !== '\r') f += c
  }
  if (f.length || row.length) {
    row.push(f)
    rows.push(row)
  }
  return rows
}

const readCsv = (file) => parseCsv(fs.readFileSync(path.join(RAW, 'official-s12', file), 'utf8'))

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const lines = (cell) =>
  (cell || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

// ---------------------------------------------------------------- runes

const GRADE = { 마법: 'magic', 희귀: 'rare', 전설: 'legendary', 유물: 'relic' }

function splitGrades(cell) {
  const base = []
  const grades = {}
  for (const l of lines(cell)) {
    const m = l.match(/^\((마법|희귀|전설|유물) 등급 효과\)\s*(.*)$/)
    if (m) (grades[GRADE[m[1]]] ??= []).push(m[2])
    else base.push(l)
  }
  return { base, grades }
}

function splitTags(cell) {
  const parts = (cell || '').split(/(?=Cannot )/)
  return {
    tags: parts[0]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    restrictions: parts
      .slice(1)
      .map((s) => s.replace(/,\s*$/, '').trim())
      .filter(Boolean),
  }
}

const tagList = (s) =>
  s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

/** Link rules from the description text. Every `groups` entry must pass; `exclude` must not match. */
function parseLinkRules(description, warn) {
  const groups = []
  const exclude = []
  let minions = false
  for (const l of lines(description)) {
    let m
    if ((m = l.match(/^Can be linked with Skills that (?:are|satisfy) any one of (.+)$/))) {
      groups.push({ mode: 'any', tags: tagList(m[1]) })
    } else if ((m = l.match(/^Can be linked with Skills that (?:are|satisfy) (.+?) \(must include all\)$/))) {
      groups.push({ mode: 'all', tags: tagList(m[1]) })
    } else if ((m = l.match(/^Can be linked with Skills that (?:are|satisfy) (.+)$/))) {
      const tags = tagList(m[1])
      if (tags.length > 1) warn(`ambiguous link rule treated as "any": ${l}`)
      groups.push({ mode: 'any', tags })
    } else if ((m = l.match(/^Cannot be linked with Skills that (?:are|satisfy) (?:any one of )?(.+)$/))) {
      exclude.push(...tagList(m[1]))
    } else if (/Applies to Minions/.test(l)) {
      minions = true
    }
  }
  return { groups, exclude, minions }
}

/**
 * "minor" when only numbers moved by ≤10% (S12 nudged almost every rune by ~4%),
 * "major" when lines were added/removed or a number moved more than that.
 */
function changeSize(before, after) {
  const NUM = /\d+(?:\.\d+)?/g
  const shape = (l) => l.replace(NUM, '#')
  if (before.map(shape).sort().join('\n') !== after.map(shape).sort().join('\n')) return 'major'
  const pool = [...before]
  for (const line of after) {
    const prev = pool.splice(
      pool.findIndex((p) => shape(p) === shape(line)),
      1,
    )[0]
    const a = (prev.match(NUM) ?? []).map(Number)
    const b = (line.match(NUM) ?? []).map(Number)
    if (a.some((v, i) => v !== b[i] && Math.abs(b[i] - v) / Math.max(Math.abs(v), 1e-9) > 0.1)) return 'major'
  }
  return 'minor'
}

const MAIN_STAT_COLOR ={ Strength: 'red', Agility: 'green', Intellect: 'blue' }

// BuildDecember's name → the sheet's name, for runes renamed since (the awakening lines match exactly).
const BUILD_DECEMBER_RENAMES = { 'Increased Trap Install Distance': 'Increase Trap Install Distance' }

function loadBuildDecember() {
  const list = JSON.parse(fs.readFileSync(path.join(RAW, 'buildDecember', 'RuneList.json'), 'utf8'))
  return new Map(list.map((r) => [(BUILD_DECEMBER_RENAMES[r.title.trim()] ?? r.title).trim().toLowerCase(), r]))
}

function buildRunes(file, kind, extra, warnings) {
  const rows = readCsv(file)
  const byName = new Map()
  let name = null
  for (const r of rows.slice(1)) {
    if (r[1]) name = r[1].trim()
    if (!name) continue
    const status = (r[2] || '').trim()
    const entry = byName.get(name) ?? { name }
    const { tags, restrictions } = splitTags(r[4])
    const lv1 = splitGrades(r[5])
    const lv45 = splitGrades(r[6])
    const block = {
      description: (r[3] || '').trim(),
      tags,
      restrictions,
      lv1: lv1.base,
      lv45: lv45.base,
      grades: lv45.grades,
      awakening: { source: lines(r[7]), origin: lines(r[8]), verity: lines(r[9]) },
    }
    if (status === '기존' || status === 'Before') entry.before = block
    else if (status === '변경' || status === 'After') Object.assign(entry, block, { status: 'changed' })
    else if (status === '신규' || status === 'New') Object.assign(entry, block, { status: 'new' })
    else continue
    byName.set(name, entry)
  }

  return [...byName.values()]
    .filter((e) => e.status)
    .map((e) => {
      const bd = extra.get(e.name.toLowerCase())
      if (!bd) warnings.push(`${kind} rune not in BuildDecember (no color/how-to-get): ${e.name}`)
      const out = {
        id: slug(e.name),
        name: e.name,
        kind,
        status: e.status,
        color: bd ? (MAIN_STAT_COLOR[bd.mainStat] ?? null) : null,
        minRarity: bd?.minRarity?.toLowerCase() ?? null,
        howToGet: bd?.howToGet ?? [],
        description: e.description,
        tags: e.tags,
        restrictions: e.restrictions,
        lv1: e.lv1,
        lv45: e.lv45,
        grades: e.grades,
        awakening: e.awakening,
      }
      if (kind === 'link') out.linkRules = parseLinkRules(e.description, (w) => warnings.push(`${e.name}: ${w}`))
      // Keep the pre-season Lv45 lines only when they differ, to show what this season changed.
      if (e.before && e.before.lv45.join('\n') !== e.lv45.join('\n')) {
        out.prevLv45 = e.before.lv45
        out.change = changeSize(e.before.lv45, e.lv45)
      }
      return out
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------- link runes the season sheet leaves out

// The sheet lists only the runes a season touched, so unchanged ones exist only in BuildDecember.
// That file keeps one value per line name, omits Resource Cost Increase and grade lines, and has
// some garbled text and stripped units. These are marked status "legacy" so the site can say so.
const LEGACY_TEXT_FIXES = [
  [/At stack/g, 'Attack'],
  [/Manapent/g, 'Mana spent'],
  [/Max S stacks/g, 'Max Stacks'],
  [/^Duration (\S+)$/, 'Duration $1 s'],
  [/^Trigger Cooldown (\S+)$/, 'Trigger Cooldown $1 s'],
  [/ for ([\d.]+) (on|upon) /, ' for $1 s $2 '],
  [/Cooldown: ([\d.]+)\)/, 'Cooldown: $1 s)'],
]

const SPELL_ACTIVATION_ON_ATTACK_HIT_COMMON = [
  '48% Resource Cost Dampening for Activated Skill',
  'Adds 100% of Attack DMG increase to Spell DMG',
  'Add 100% of Attack Critical Rate Increase/Critical DMG to Spell Critical Rate Increase/Critical DMG',
  'Trigger Chance 100%',
  'Activates max 1 time on hit whenever Activation Skill is used',
]

// Read from the in-game rune page on 2 Nov 2026 (see notes/2026-11-02-ogre-vs-cla-crit.md).
const LEGACY_OVERRIDES = {
  'Spell Activation on Attack Hit': {
    lv1: ['Resource Cost Increase 15%', '55% DMG Dampening for Activated Skill', ...SPELL_ACTIVATION_ON_ATTACK_HIT_COMMON, '10% DMG Dampening for Activated Skill'],
    lv45: ['Resource Cost Increase 15%', '26.9% DMG Dampening for Activated Skill', ...SPELL_ACTIVATION_ON_ATTACK_HIT_COMMON, '10% DMG Dampening for Activated Skill'],
    grades: {
      magic: ['8% DMG Dampening for Activated Skill'],
      rare: ['10% Resource Cost Dampening', '8% DMG Dampening for Activated Skill'],
      legendary: ['20% Resource Cost Dampening', '+20% Skill Rune Cooldown Recovery Speed', '5% DMG Dampening for Activated Skill'],
    },
  },
}

/** "#% DMG": [10] → "10% DMG"; "[#-#]": [1, 4] → "[1-4]"; a non-array value is a heading with no numbers. */
function legacyLines(stats) {
  return Object.entries(stats ?? {}).map(([key, values]) => {
    let i = 0
    const line = Array.isArray(values) ? key.replace(/\[#-#\]|#/g, (m) => (m === '#' ? values[i++] : `[${values[i++]}-${values[i++]}]`)) : key
    return LEGACY_TEXT_FIXES.reduce((text, [pattern, to]) => text.replace(pattern, to), line)
  })
}

/** Puts the description in the sheet's format: one rule per line, same wording. */
function legacyDescription(text) {
  return text
    .trim()
    .replace(/Rune cannot be awakening/g, 'Rune cannot be awakened.')
    .replace(/Rune cannot be enhanced/g, 'Rune cannot be enhanced.')
    .replace(/(Activation|Target) \(/g, '$1(')
    .replace(/a Target ([A-Z][^(.]*?) Skill in/, 'a Target($1) Skill in')
    .replace(/that satisfy (?!any one)/g, 'that are ')
    .replace(/\s+(?=(?:Can be linked|Cannot be linked|Must link|Target Skill|Rune cannot|Applies to) )/g, '\n')
}

function buildLegacyLinkRunes(extra, known) {
  return [...extra.entries()]
    .filter(([key, r]) => r.type === 'link' && !known.has(key))
    .map(([, r]) => {
      const name = r.title.trim()
      const conditions = r.conditions ?? {}
      return {
        id: slug(name),
        name,
        kind: 'link',
        status: 'legacy',
        color: MAIN_STAT_COLOR[r.mainStat] ?? null,
        minRarity: r.minRarity?.toLowerCase() ?? null,
        howToGet: r.howToGet ?? [],
        description: legacyDescription(r.description),
        tags: r.tags ?? [],
        restrictions: [],
        lv1: legacyLines(r.stats?.level1),
        lv45: legacyLines(r.stats?.level45),
        grades: {},
        awakening: { source: legacyLines(r.awakenings?.source), origin: legacyLines(r.awakenings?.origin), verity: legacyLines(r.awakenings?.verity) },
        linkRules: { groups: conditions.any ? [{ mode: 'any', tags: conditions.any }] : [], exclude: conditions.cannot ?? [], minions: !!conditions.minions },
        ...LEGACY_OVERRIDES[name],
      }
    })
}

// ---------------------------------------------------------------- uniques

const GEAR_CATEGORY = {
  Sword: 'weapon1h',
  Axe: 'weapon1h',
  Dagger: 'weapon1h',
  Wand: 'weapon1h',
  Scepter: 'weapon1h',
  '2-handed Sword': 'weapon2h',
  '2-handed Axe': 'weapon2h',
  Staff: 'weapon2h',
  Bow: 'weapon2h',
  'Steel Bow': 'weapon2h',
  Bowgun: 'weapon2h',
  Shield: 'offhand',
  Quiver: 'offhand',
  Magazine: 'offhand',
  Helmet: 'armor',
  Armor: 'armor',
  Gloves: 'armor',
  Shoes: 'armor',
  Spaulders: 'armor',
  Belt: 'accessory',
  Necklace: 'accessory',
  Ring: 'accessory',
}

/** Option cells are "implicit ---- innate ---- options"; fewer separators mean fewer sections. */
function splitOptions(cell) {
  const sections = [[]]
  for (const l of lines(cell)) {
    if (/^-{5,}$/.test(l)) sections.push([])
    else sections.at(-1).push(l)
  }
  if (sections.length === 1) return { implicit: [], innate: [], options: sections[0] }
  if (sections.length === 2) return { implicit: sections[0], innate: [], options: sections[1] }
  return { implicit: sections[0], innate: sections[1], options: sections.slice(2).flat() }
}

function buildUniques(warnings) {
  // Later tabs win: S11 new → S11 balance changes (after) → S12 new.
  const tabs = [
    { file: 'new-uniquethe-forge.csv', season: 'S11', optionCol: 6, status: 'new' },
    { file: 'the-forge-uniquebalance-changes.csv', season: 'S11', optionCol: 7, status: 'changed' },
    { file: 'new-unique-the-farside.csv', season: 'S12', optionCol: 6, status: 'new' },
  ]
  const byName = new Map()
  for (const tab of tabs) {
    for (const r of readCsv(tab.file)) {
      const name = (r[1] || '').trim()
      if (!name || name === 'Name' || !r[3]) continue
      const gearType = r[3].trim()
      const category = GEAR_CATEGORY[gearType]
      if (!category) warnings.push(`unknown gear type "${gearType}" for ${name}`)
      const req = (r[5] || '').trim()
      byName.set(name, {
        id: slug(name),
        name,
        transcendent: name.startsWith('Transcendent '),
        tier: Number(r[2]) || null,
        gearType,
        category: category ?? 'other',
        reqLevel: Number((r[4] || '').replace(/\D/g, '')) || null,
        requirement: req && req !== '-' ? req : null,
        ...splitOptions(r[tab.optionCol]),
        season: tab.season,
        status: tab.status,
      })
    }
  }
  return [...byName.values()].sort((a, b) => a.category.localeCompare(b.category) || b.tier - a.tier || a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------- main

const warnings = []
const extra = loadBuildDecember()
const skill = buildRunes('season-skill-rune-list-the-farside.csv', 'skill', extra, warnings)
const link = buildRunes('season-link-rune-list-the-farside.csv', 'link', extra, warnings)
const known = new Set([...skill, ...link].map((r) => r.name.toLowerCase()))
const legacy = buildLegacyLinkRunes(extra, known)
link.push(...legacy)
link.sort((a, b) => a.name.localeCompare(b.name))
const uniques = buildUniques(warnings)

fs.mkdirSync(OUT, { recursive: true })
const write = (file, data) => fs.writeFileSync(path.join(OUT, file), JSON.stringify(data, null, 1) + '\n')
write('skill-runes.json', skill)
write('link-runes.json', link)
write('uniques.json', uniques)

console.log(`skill runes: ${skill.length}, link runes: ${link.length} (${legacy.length} legacy), uniques: ${uniques.length}`)
if (warnings.length) console.log(`\n${warnings.length} warnings:\n  ` + warnings.join('\n  '))
