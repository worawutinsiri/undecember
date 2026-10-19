// Writes a snapshot of the game's asset list to data-raw/game-assets/<pak>.tsv, read from the
// AssetRegistry.bin inside the installed client's pak files. No pak AES key needed (see
// scripts/lib/pak.mjs). Snapshots hold asset names only — icons, maps, blueprints — not stats or
// text; those are encrypted by the game itself. Compare snapshots with `npm run assets:diff`.
//
// Usage: node scripts/assets-extract.mjs [--game <dir>] [--pak <name>] [--all] [--full]
//   --game  install dir (default: $UNDECEMBER_DIR or D:\SteamLibrary\steamapps\common\Undecember)
//   --pak   read this pak, e.g. DXT_00000950 (default: the newest pak that has a registry)
//   --all   write a snapshot for every pak that has a registry (backfills older patches)
//   --full  also write every asset to data-raw/game-assets/full/<pak>.tsv (git-ignored)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { openPak } from './lib/pak.mjs'
import { isAssetRegistry, parseAssetRegistry } from './lib/asset-registry.mjs'
import { categorize, readSnapshotBody, snapshotBody, writeSnapshot } from './lib/asset-catalog.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'data-raw', 'game-assets')

const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const gameDir = opt('--game') ?? process.env.UNDECEMBER_DIR ?? 'D:\\SteamLibrary\\steamapps\\common\\Undecember'
const paksDir = path.join(gameDir, 'RzGame', 'Content', 'Paks')
if (!fs.existsSync(paksDir)) {
  console.error(`pak folder not found: ${paksDir}\npass --game <install dir> or set UNDECEMBER_DIR`)
  process.exit(1)
}

// Patch paks are numbered (DXT_00000950.pak); a higher number is a newer patch.
const pakNumber = (f) => Number(f.match(/(\d+)\.\w+$/)?.[1] ?? -1)
const paks = fs
  .readdirSync(paksDir)
  .filter((f) => f.endsWith('.pak'))
  .map((f) => ({ name: f.replace(/\.pak$/, ''), file: path.join(paksDir, f), num: pakNumber(f) }))
  .sort((a, b) => b.num - a.num)

const wanted = opt('--pak')
const everyPak = args.includes('--all')
const targets = wanted ? paks.filter((p) => p.name === wanted) : paks
if (!targets.length) {
  console.error(`no pak named ${wanted} in ${paksDir}`)
  process.exit(1)
}

// A pak can carry more than one registry (the larger is a superset with redirectors); merge them.
function readRegistries(pakFile) {
  const pak = openPak(pakFile)
  try {
    const found = []
    for (const e of pak.entries()) {
      if (e.encrypted || e.size < 1 << 20) continue
      if (isAssetRegistry(pak.peekEntry(e))) found.push(parseAssetRegistry(pak.readEntry(e)))
    }
    return found
  } finally {
    pak.close()
  }
}

// Newest snapshot on disk from a pak older than `num`, to skip patches that changed no assets.
function previousSnapshot(num) {
  return fs
    .readdirSync(OUT)
    .filter((f) => f.endsWith('.tsv') && pakNumber(f) < num)
    .sort((a, b) => pakNumber(b) - pakNumber(a))[0]
}

fs.mkdirSync(OUT, { recursive: true })
let found = 0
let newer = null // last snapshot written by this run; --all walks newest → oldest
for (const pak of targets) {
  const started = Date.now()
  const registries = readRegistries(pak.file)
  if (!registries.length) {
    if (wanted || everyPak) console.log(`${pak.name}: no asset registry`)
    continue
  }
  found++
  const byKey = new Map()
  for (const a of registries.flat()) {
    if (a.cls === 'ObjectRedirector' || !a.path.startsWith('/Game/')) continue
    const base = a.path.slice(a.path.lastIndexOf('/') + 1)
    const full = a.name === base ? a.path : `${a.path}.${a.name}`
    byKey.set(`${a.cls}\t${full}`, { cls: a.cls, path: full, dir: a.dir })
  }
  const all = [...byKey.values()]
  const date = fs.statSync(pak.file).mtime.toISOString().slice(0, 10)
  const meta = { pak: pak.name, date }
  const snap = snapshotBody(all.filter((a) => !a.path.startsWith('/Game/L10N/') && categorize(a)))
  const file = path.join(OUT, `${pak.name}.tsv`)
  let line = `${pak.name} (${date}): ${all.length} assets, ${snap.count} in snapshot`

  const prev = !everyPak && previousSnapshot(pak.num)
  if (prev && readSnapshotBody(path.join(OUT, prev)) === snap.body) line += `, unchanged since ${prev} — not written`
  else {
    // Identical patches in a row: keep only the oldest, the one where these assets first appeared.
    if (newer?.body === snap.body) {
      fs.unlinkSync(newer.file)
      line += `, same as ${newer.name} (dropped that copy)`
    }
    writeSnapshot(file, meta, snap)
    newer = { name: pak.name, file, body: snap.body }
  }
  if (args.includes('--full')) {
    fs.mkdirSync(path.join(OUT, 'full'), { recursive: true })
    writeSnapshot(path.join(OUT, 'full', `${pak.name}.tsv`), meta, snapshotBody(all))
    line += ', full list written'
  }
  console.log(`${line} — ${((Date.now() - started) / 1000).toFixed(0)} s`)
  if (!wanted && !everyPak) break
}
if (!found) {
  console.error('no asset registry found in any pak')
  process.exit(1)
}
