import { describe, expect, it } from 'vitest'
import { REGISTRY_GUID, isAssetRegistry, parseAssetRegistry } from './asset-registry.mjs'
import { categorize, iconName, snapshotBody } from './asset-catalog.mjs'

const i32 = (n) => {
  const b = Buffer.alloc(4)
  b.writeInt32LE(n)
  return b
}
const fstring = (s) => Buffer.concat([i32(s.length + 1), Buffer.from(s + '\0', 'latin1')])
const fname = (index, number = 0) => Buffer.concat([i32(index), i32(number)])

// One asset (a skill rune icon sprite) plus one tag, in the version 7 cache layout.
function buildRegistry(version = 7) {
  const names = ['/Game/UI/Texture/Icon/Skill/Icon_Skill_FrostStrom_01_png.Icon_Skill_FrostStrom_01_png', '/Game/UI/Texture/Icon/Skill', 'MaterialInstanceConstant', '/Game/UI/Texture/Icon/Skill/Icon_Skill_FrostStrom_01_png', 'Icon_Skill_FrostStrom_01_png', 'Parent']
  const asset = Buffer.concat([fname(0), fname(1), fname(2), fname(3), fname(4), i32(1), fname(5), fstring('M_UI_Atlas'), i32(1), i32(0), i32(0)])
  const second = Buffer.concat([fname(0), fname(1), fname(2), fname(3), fname(4, 2), i32(0), i32(0), i32(0)])
  const body = Buffer.concat([i32(2), asset, second, Buffer.alloc(16)]) // + dependency data we skip
  const head = Buffer.concat([Buffer.from(REGISTRY_GUID, 'hex'), i32(version)])
  const nameOffset = head.length + 8 + body.length
  const offset = Buffer.alloc(8)
  offset.writeBigInt64LE(BigInt(nameOffset))
  const table = Buffer.concat([i32(names.length), ...names.map((n) => Buffer.concat([fstring(n), Buffer.alloc(4)]))])
  return Buffer.concat([head, offset, body, table])
}

describe('parseAssetRegistry', () => {
  it('reads assets, tags and numbered FNames', () => {
    const buf = buildRegistry()
    expect(isAssetRegistry(buf)).toBe(true)
    const [a, b] = parseAssetRegistry(buf)
    expect(a).toEqual({
      path: '/Game/UI/Texture/Icon/Skill/Icon_Skill_FrostStrom_01_png',
      dir: '/Game/UI/Texture/Icon/Skill',
      name: 'Icon_Skill_FrostStrom_01_png',
      cls: 'MaterialInstanceConstant',
      tags: { Parent: 'M_UI_Atlas' },
    })
    expect(b.name).toBe('Icon_Skill_FrostStrom_01_png_1')
  })

  it('refuses other registry versions', () => {
    expect(() => parseAssetRegistry(buildRegistry(8))).toThrow(/version 8/)
    expect(() => parseAssetRegistry(Buffer.alloc(64))).toThrow(/not an AssetRegistry/)
  })
})

describe('asset catalog', () => {
  const icon = (dir, file, cls = 'MaterialInstanceConstant') => ({ cls, dir, path: `${dir}/${file}` })

  it('sorts assets into report categories', () => {
    expect(categorize(icon('/Game/UI/Texture/Icon/Skill', 'Icon_Skill_FrostStrom_01_png'))).toBe('skill')
    expect(categorize(icon('/Game/UI/Texture/Icon/LinkSkill', 'Icon_LinkSkill_Anger_01_png'))).toBe('link')
    expect(categorize(icon('/Game/UI/Texture/Icon/Item/ExtraEssence', 'Icon_Item_Amplifier_png'))).toBe('essence')
    expect(categorize(icon('/Game/UI/Texture/Icon/Item/Source', 'Icon_Item_Potion_png'))).toBe('item')
    expect(categorize({ cls: 'World', dir: '/Game/Level/Act13', path: '/Game/Level/Act13/Act13_1' })).toBe('map')
    expect(categorize(icon('/Game/UI/Texture/Icon/Skill', 'Icon_Skill_X', 'Material'))).toBeNull()
    expect(categorize({ cls: 'SoundWave', dir: '/Game/Sound', path: '/Game/Sound/A' })).toBeNull()
  })

  it('names icons and writes sorted, de-duplicated snapshot lines', () => {
    expect(iconName('/Game/UI/Texture/Icon/Skill/Icon_Skill_FrostStrom_01_png')).toBe('Icon_Skill_FrostStrom_01')
    const b = { cls: 'World', path: '/Game/Level/B' }
    const a = { cls: 'Blueprint', path: '/Game/Blueprints/A' }
    expect(snapshotBody([b, a, b])).toEqual({ body: 'Blueprint\t/Game/Blueprints/A\nWorld\t/Game/Level/B\n', count: 2 })
  })
})
