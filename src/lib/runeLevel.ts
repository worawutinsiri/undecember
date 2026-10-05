import type { Rune, RuneGrade } from '../data/types'

const NUM = /\d+(?:\.\d+)?/g
const shape = (line: string) => line.replace(NUM, '#')

function decimals(min: number, ...xs: string[]) {
  return Math.max(min, ...xs.map((x) => (x.split('.')[1] ?? '').length))
}

/**
 * Stat lines of a rune at `level`. Only Lv1 and Lv45 are published, so in-between levels are
 * interpolated linearly per number (and extrapolated past 45, up to the Lv50 cap).
 * Returns `estimated: true` for any level other than 1 or 45.
 */
export function runeLinesAt(rune: Rune, level: number): { lines: string[]; estimated: boolean } {
  if (level === 1) return { lines: rune.lv1, estimated: false }
  if (level === 45) return { lines: rune.lv45, estimated: false }

  const t = (level - 1) / 44
  const pool = rune.lv1.map((l) => ({ line: l, shape: shape(l), used: false }))
  const lines = rune.lv45.map((hi) => {
    const s = shape(hi)
    const lo = pool.find((p) => !p.used && p.shape === s)
    if (!lo) return hi
    lo.used = true
    const loNums = lo.line.match(NUM) ?? []
    let i = 0
    return hi.replace(NUM, (h) => {
      const l = loNums[i++] ?? h
      const a = Number(l)
      const b = Number(h)
      if (a === b) return h
      const v = a + (b - a) * t
      return String(Number(v.toFixed(decimals(1, l, h))))
    })
  })
  return { lines, estimated: true }
}

export function gradeLines(rune: Rune, grade: RuneGrade): string[] {
  return grade === 'normal' ? [] : (rune.grades[grade] ?? [])
}

const RANGE = /\[(-?[\d.]+)-(-?[\d.]+)\]/g

/** Resolves "[min-max]" roll ranges to a value at `quality` (0 = min roll, 1 = max roll). */
export function resolveRolls(line: string, quality: number): string {
  return line.replace(RANGE, (_, a: string, b: string) => {
    const v = Number(a) + (Number(b) - Number(a)) * quality
    return String(Number(v.toFixed(decimals(0, a, b))))
  })
}
