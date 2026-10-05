import skillRunesJson from './generated/skill-runes.json'
import linkRunesJson from './generated/link-runes.json'
import uniquesJson from './generated/uniques.json'
import type { Rune, UniqueItem } from './types'

export const SKILL_RUNES = skillRunesJson as Rune[]
export const LINK_RUNES = linkRunesJson as Rune[]
export const UNIQUES = uniquesJson as UniqueItem[]

export const RUNE_BY_ID = new Map<string, Rune>([...SKILL_RUNES, ...LINK_RUNES].map((r) => [`${r.kind}:${r.id}`, r]))
export const UNIQUE_BY_ID = new Map<string, UniqueItem>(UNIQUES.map((u) => [u.id, u]))

export const DATA_META = {
  season: 'Season 12: The Farside',
  updated: '5 ต.ค. 2026',
  sources: [
    { label: 'LINE Games — Season Mode Changes (ชีททางการ)', url: 'https://ud.floor.line.games/us/bbs/guide/stat' },
    { label: 'nestula/BuildDecember (MIT) — สีรูน / วิธีได้รับ', url: 'https://github.com/nestula/BuildDecember' },
  ],
}

export const MAX_RUNE_LEVEL = 50
