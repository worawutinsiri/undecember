import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { afterAll, describe, expect, it } from 'vitest'
import { openPak } from './pak.mjs'

const u64 = (n) => {
  const b = Buffer.alloc(8)
  b.writeBigUInt64LE(BigInt(n))
  return b
}
const u32 = (n) => {
  const b = Buffer.alloc(4)
  b.writeUInt32LE(n)
  return b
}
const sha1 = (data) => crypto.createHash('sha1').update(data).digest()

// Inline FPakEntry header + data, the way UnrealPak lays an entry out.
function entry(data, { compressed = false, encrypted = false } = {}) {
  if (!compressed) {
    const body = encrypted ? Buffer.concat([data, Buffer.alloc((16 - (data.length % 16)) % 16)]) : data
    const head = Buffer.concat([u64(0), u64(data.length), u64(data.length), u32(0), sha1(data), Buffer.from([encrypted ? 1 : 0]), u32(0)])
    return Buffer.concat([head, body])
  }
  const parts = [data.subarray(0, 4), data.subarray(4)].map((p) => zlib.deflateSync(p))
  const headLen = 48 + 4 + parts.length * 16 + 5
  let at = headLen
  const blocks = parts.map((p) => {
    const b = Buffer.concat([u64(at), u64(at + p.length)])
    at += p.length
    return b
  })
  const size = parts.reduce((n, p) => n + p.length, 0)
  const head = Buffer.concat([u64(0), u64(size), u64(data.length), u32(1), sha1(data), u32(parts.length), ...blocks, Buffer.from([0]), u32(4)])
  return Buffer.concat([head, ...parts])
}

function footer(indexOffset) {
  const names = Buffer.alloc(160)
  names.write('Zlib')
  return Buffer.concat([Buffer.alloc(16), Buffer.from([1]), u32(0x5a6f12e1), u32(11), u64(indexOffset), u64(4), Buffer.alloc(20), names])
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pak-test-'))
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }))

function buildPak() {
  const a = entry(Buffer.from('plain text entry'))
  const pad = Buffer.alloc(2048 - a.length) // next entry starts on a 2048-byte boundary
  const b = entry(Buffer.from('compressed in two blocks'), { compressed: true })
  const c = entry(Buffer.from('secret uasset header'), { encrypted: true })
  const d = entry(Buffer.alloc(0))
  const body = Buffer.concat([a, pad, b, c, d])
  const file = path.join(dir, 'test.pak')
  fs.writeFileSync(file, Buffer.concat([body, Buffer.from('IDX!'), footer(body.length)]))
  return { file, offsets: [0, 2048, 2048 + b.length, 2048 + b.length + c.length] }
}

describe('openPak', () => {
  it('walks entries without the index, across zero padding', () => {
    const { file, offsets } = buildPak()
    const pak = openPak(file)
    const list = [...pak.entries()]
    expect(pak.version).toBe(11)
    expect(list.map((e) => e.pos)).toEqual(offsets)
    expect(list.map((e) => e.encrypted)).toEqual([false, false, true, false])
    expect(pak.readEntry(list[0]).toString()).toBe('plain text entry')
    expect(pak.readEntry(list[1]).toString()).toBe('compressed in two blocks')
    expect(pak.peekEntry(list[1], 4).toString()).toBe('comp')
    expect(() => pak.readEntry(list[2])).toThrow(/encrypted/)
    expect(pak.readEntry(list[3]).length).toBe(0)
    pak.close()
  })

  it('rejects files without a pak footer', () => {
    const file = path.join(dir, 'not.pak')
    fs.writeFileSync(file, Buffer.alloc(300))
    expect(() => openPak(file)).toThrow(/no pak footer/)
  })
})
