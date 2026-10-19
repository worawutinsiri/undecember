// Parser for the cooked AssetRegistry.bin shipped in the game's paks (UE 4.26,
// FAssetRegistryVersion 7 "AddedDependencyFlags").
//
//   FGuid (version guid) · int32 version · int64 name-table offset
//   int32 asset count, then per asset (FAssetData::SerializeForCache):
//     ObjectPath · PackagePath · AssetClass · PackageName · AssetName   FName = int32 index, int32 number
//     int32 tag count · {FName key, FString value} × n · int32 chunk count · int32 × n · uint32 flags
//   … dependency/package data (not read) …
//   name table: int32 count · {FString, uint16 hash, uint16 hash} × n
export const REGISTRY_GUID = 'e79e7f713a49b0e93291b3880781381b'
const SUPPORTED_VERSION = 7

export const isAssetRegistry = (head) => head.length >= 16 && head.subarray(0, 16).toString('hex') === REGISTRY_GUID

export function parseAssetRegistry(buf) {
  if (!isAssetRegistry(buf)) throw new Error('not an AssetRegistry.bin')
  let p = 16
  const i32 = () => {
    const v = buf.readInt32LE(p)
    p += 4
    return v
  }
  const fstring = () => {
    const n = i32()
    if (n === 0) return ''
    if (n < 0) {
      const s = buf.toString('utf16le', p, p - n * 2 - 2)
      p -= n * 2
      return s
    }
    const s = buf.toString('latin1', p, p + n - 1)
    p += n
    return s
  }

  const version = i32()
  if (version !== SUPPORTED_VERSION)
    throw new Error(`AssetRegistry version ${version} is not supported (expected ${SUPPORTED_VERSION}) — the game's engine changed`)
  const nameOffset = Number(buf.readBigInt64LE(p))
  p += 8

  const assetsStart = p
  p = nameOffset
  const names = new Array(i32())
  for (let i = 0; i < names.length; i++) {
    names[i] = fstring()
    p += 4
  }
  p = assetsStart

  const fname = () => {
    const index = i32()
    const number = i32()
    return number ? `${names[index]}_${number - 1}` : names[index]
  }

  const assets = new Array(i32())
  for (let a = 0; a < assets.length; a++) {
    fname() // ObjectPath = PackageName.AssetName
    const dir = fname()
    const cls = fname()
    const path = fname()
    const name = fname()
    const tags = {}
    for (let n = i32(); n > 0; n--) {
      const key = fname()
      tags[key] = fstring()
    }
    const chunkCount = i32()
    p += chunkCount * 4 + 4 // chunk ids + package flags
    assets[a] = { path, dir, name, cls, tags }
  }
  return assets
}
