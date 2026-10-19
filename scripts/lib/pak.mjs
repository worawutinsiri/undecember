// Keyless reader for the game's UE4 .pak files (pak v11 with an AES-encrypted index).
//
// The index can't be read without the AES key, but every entry's data is preceded by an inline
// copy of its FPakEntry header, so entries can be found by walking the file from offset 0.
// File names live only in the index, so entries come back unnamed. Entries flagged as encrypted
// (the .uasset headers) can't be read; the rest (.uexp, .ubulk, AssetRegistry.bin, …) is plain or
// zlib-compressed.
//
//   FPakEntry  Offset u64 (0 inline) · Size u64 · UncompressedSize u64 · CompressionMethod u32 ·
//              Hash[20] · [BlockCount u32 · {Start u64, End u64} × n — compressed only, relative
//              to the entry start] · Flags u8 (1 = encrypted) · CompressionBlockSize u32
//
// Encrypted data is padded to 16 bytes per block, and entries may be zero-padded to start on a
// 2048-byte boundary.
import fs from 'node:fs'
import zlib from 'node:zlib'

const PAK_MAGIC = 0x5a6f12e1
const EMPTY_SHA1 = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
const ALIGN = 2048

const align16 = (n) => Math.ceil(n / 16) * 16

export function openPak(file) {
  const fd = fs.openSync(file, 'r')
  const size = fs.fstatSync(fd).size
  const read = (pos, len) => {
    const b = Buffer.alloc(len)
    fs.readSync(fd, b, 0, len, pos)
    return b
  }

  // Footer: … Magic u32 · Version u32 · IndexOffset u64 · IndexSize u64 · IndexHash[20] · names
  const tailLen = Math.min(size, 512)
  const tail = read(size - tailLen, tailLen)
  let m = -1
  for (let i = tailLen - 4; i >= 0 && m < 0; i--) if (tail.readUInt32LE(i) === PAK_MAGIC) m = i
  if (m < 0) {
    fs.closeSync(fd)
    throw new Error(`${file}: no pak footer`)
  }
  const version = tail.readUInt32LE(m + 4)
  const indexOffset = Number(tail.readBigUInt64LE(m + 8))

  function parseHeader(pos) {
    const h = read(pos, 52)
    const offset = Number(h.readBigUInt64LE(0))
    const sizeOnDisk = Number(h.readBigUInt64LE(8))
    const usize = Number(h.readBigUInt64LE(16))
    const method = h.readUInt32LE(24)
    if ((offset !== 0 && offset !== pos) || method > 4 || sizeOnDisk > 4e9 || usize > 4e9) return null
    const hash = h.subarray(28, 48).toString('hex')
    if (/^0+$/.test(hash)) return null // zero padding
    if (usize === 0 && hash !== EMPTY_SHA1) return null
    let p = 48
    const blocks = []
    if (method !== 0) {
      const count = h.readUInt32LE(48)
      if (count === 0 || count > 200000) return null
      p += 4
      const b = read(pos + p, count * 16)
      for (let k = 0; k < count; k++) blocks.push([Number(b.readBigUInt64LE(k * 16)), Number(b.readBigUInt64LE(k * 16 + 8))])
      p += count * 16
    }
    const t = read(pos + p, 5)
    const flags = t[0]
    p += 5
    if (flags > 3) return null
    if (method !== 0 && blocks[0][0] !== p) return null
    const encrypted = (flags & 1) === 1
    let end
    if (method !== 0) {
      const [s, e] = blocks[blocks.length - 1]
      end = s + (encrypted ? align16(e - s) : e - s)
    } else end = p + (encrypted ? align16(sizeOnDisk) : sizeOnDisk)
    return { pos, size: usize, method, blocks, encrypted, dataStart: pos + p, end: pos + end }
  }

  // After zero padding, the next header starts on a 2048-byte boundary (checked first) or, failing
  // that, 8–15 bytes before the first non-zero byte (the Size field follows the 8-byte Offset).
  function resync(pos) {
    const win = read(pos, 1 << 20)
    let nz = 0
    while (nz < win.length && win[nz] === 0) nz++
    if (pos + nz >= indexOffset) return null
    const aligned = Math.floor((pos + nz - 8) / ALIGN) * ALIGN
    if (aligned >= pos) {
      const e = parseHeader(aligned)
      if (e) return e
    }
    for (let q = pos + nz - 8; q >= Math.max(pos, pos + nz - 15); q--) {
      const e = parseHeader(q)
      if (e) return e
    }
    throw new Error(`${file}: lost entry sync at ${pos}`)
  }

  function* entries() {
    let pos = 0
    while (pos < indexOffset) {
      const e = parseHeader(pos) ?? resync(pos)
      if (!e) return
      yield e
      pos = e.end
    }
  }

  function readEntry(e) {
    if (e.encrypted) throw new Error(`entry at ${e.pos} is encrypted`)
    if (e.method === 0) return read(e.dataStart, e.size)
    return Buffer.concat(e.blocks.map(([s, en]) => zlib.inflateSync(read(e.pos + s, en - s))))
  }

  // First bytes of an entry without inflating all of it.
  function peekEntry(e, n = 16) {
    if (e.encrypted) throw new Error(`entry at ${e.pos} is encrypted`)
    if (e.method === 0) return read(e.dataStart, Math.min(n, e.size))
    const [s, en] = e.blocks[0]
    return zlib.inflateSync(read(e.pos + s, en - s)).subarray(0, n)
  }

  return { file, version, indexOffset, entries, readEntry, peekEntry, close: () => fs.closeSync(fd) }
}
