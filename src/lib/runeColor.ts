import type { RuneColor } from '../data/types'

/** Colour filter test: an empty filter matches every rune. */
export const matchesColor = (color: RuneColor | null, filter: RuneColor | '') => !filter || color === filter
