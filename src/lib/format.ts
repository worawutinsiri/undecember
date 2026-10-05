const nf = (digits: number) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
const NF0 = nf(0)
const NF1 = nf(1)
const NF2 = nf(2)

export const fmt = (n: number) => (Math.abs(n) >= 100 ? NF0 : Math.abs(n) >= 10 ? NF1 : NF2).format(n)
export const fmtInt = (n: number) => NF0.format(n)
export const fmtPct = (n: number) => `${NF1.format(n)}%`
export const fmtMult = (n: number) => `×${NF2.format(n)}`

/** 12,345,678 → "12.35 ล้าน" for headline numbers. */
export function fmtBig(n: number) {
  if (Math.abs(n) >= 1e9) return `${NF2.format(n / 1e9)} พันล้าน`
  if (Math.abs(n) >= 1e6) return `${NF2.format(n / 1e6)} ล้าน`
  return fmtInt(n)
}
