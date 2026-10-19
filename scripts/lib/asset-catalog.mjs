// Asset snapshot format and the categories assets:diff reports on.
//
// A snapshot is a sorted TSV ("<class>\t<package path>", one asset per line) with a "#" header
// line, so a plain `git diff` between two snapshots is readable too.
import fs from 'node:fs'

const ICON = '/Game/UI/Texture/Icon/'

// First matching category wins. Only these assets go into the committed snapshots; --full keeps
// everything (sounds, meshes, materials, …).
export const CATEGORIES = [
  { key: 'skill', label: 'Skill rune icons', test: (a) => a.dir === `${ICON}Skill` },
  { key: 'link', label: 'Link rune icons', test: (a) => a.dir === `${ICON}LinkSkill` },
  { key: 'equipment', label: 'Equipment icons', test: (a) => a.dir.startsWith(`${ICON}Item/Equipment`) },
  { key: 'essence', label: 'Essence icons', test: (a) => /^\/Game\/UI\/Texture\/Icon\/Item\/(Extra)?Essence/.test(a.dir) },
  { key: 'charm', label: 'Charm icons', test: (a) => a.dir.startsWith(`${ICON}Item/Charm`) },
  { key: 'zodiac', label: 'Zodiac icons', test: (a) => /^\/Game\/UI\/Texture\/Icon\/(Zodiac|ZodiacJewel|Item\/ZodiacJewel)(\/|$)/.test(a.dir) },
  { key: 'item', label: 'Other item icons', test: (a) => a.dir.startsWith(`${ICON}Item/`) },
  { key: 'buff', label: 'Buff icons', test: (a) => a.dir.startsWith(`${ICON}Buff`) },
  { key: 'monster', label: 'Monster icons', test: (a) => a.dir.startsWith(`${ICON}Monster`) },
  { key: 'icon', label: 'Other icons', test: (a) => a.dir.startsWith(ICON) },
  { key: 'map', label: 'Maps', test: (a) => a.cls === 'World' && a.path.startsWith('/Game/Level/') },
  { key: 'blueprint', label: 'Blueprints', test: (a) => a.cls === 'Blueprint' && a.path.startsWith('/Game/Blueprints/') },
]

const ICON_CLASSES = new Set(['MaterialInstanceConstant', 'Texture2D'])

export function categorize(a) {
  if (a.path.startsWith(ICON) && !ICON_CLASSES.has(a.cls)) return null
  return CATEGORIES.find((c) => c.test(a))?.key ?? null
}

// "/Game/UI/Texture/Icon/Skill/Icon_Skill_FrostStrom_01_png" → "Icon_Skill_FrostStrom_01"
export const iconName = (path) => path.slice(path.lastIndexOf('/') + 1).replace(/_png$/, '')

// Body = the asset lines without the header, so two snapshots can be compared as strings.
export function snapshotBody(assets) {
  const lines = [...new Set(assets.map((a) => `${a.cls}\t${a.path}`))].sort((x, y) => {
    const [, px] = x.split('\t')
    const [, py] = y.split('\t')
    return px < py ? -1 : px > py ? 1 : x < y ? -1 : 1
  })
  return { body: lines.join('\n') + '\n', count: lines.length }
}

export function writeSnapshot(file, meta, { body, count }) {
  const header = '# ' + Object.entries({ ...meta, assets: count }).map(([k, v]) => `${k}=${v}`).join(' ')
  fs.writeFileSync(file, `${header}\n${body}`)
}

export const readSnapshotBody = (file) => fs.readFileSync(file, 'utf8').replace(/^#[^\n]*\n/, '')

export function readSnapshot(file) {
  const [header, ...lines] = fs.readFileSync(file, 'utf8').split('\n')
  const meta = Object.fromEntries(header.replace(/^#\s*/, '').split(' ').map((kv) => kv.split('=')))
  const assets = lines.filter(Boolean).map((l) => {
    const [cls, path] = l.split('\t')
    return { cls, path, dir: path.slice(0, path.lastIndexOf('/')) }
  })
  return { meta, assets }
}
