import { describe, expect, it } from 'vitest'
import type { Rune, UniqueItem } from '../data/types'
import { checkLink, lineKey, simulate, type SimInput } from './damage'
import { runeLinesAt, resolveRolls } from './runeLevel'

const rune = (over: Partial<Rune>): Rune => ({
  id: 'x',
  name: 'X',
  kind: 'skill',
  status: 'changed',
  color: null,
  minRarity: null,
  howToGet: [],
  description: '',
  tags: [],
  restrictions: [],
  lv1: [],
  lv45: [],
  grades: {},
  awakening: { source: [], origin: [], verity: [] },
  ...over,
})

const fireBolt = rune({
  name: 'Test Bolt',
  tags: ['Spell', 'Fire', 'Projectile', 'Strike'],
  lv1: ['Mana Cost 10', 'Fire Element', 'Fire DMG 200%', 'Fire DMG +100', '+150% DMG against Burning enemies'],
  lv45: ['Mana Cost 10', 'Fire Element', 'Fire DMG 200%', 'Fire DMG +100', '+150% DMG against Burning enemies'],
})

const spellAmp = rune({
  name: 'Spell Amp',
  kind: 'link',
  lv45: ['Resource Cost Increase 20%', '20% DMG Amplification', '+50% Fire DMG'],
  linkRules: { groups: [{ mode: 'any', tags: ['Spell'] }], exclude: [], minions: false },
})

const attackOnly = rune({
  name: 'Attack Only',
  kind: 'link',
  lv45: ['50% DMG Amplification'],
  linkRules: { groups: [{ mode: 'any', tags: ['Attack'] }], exclude: [], minions: false },
})

const wand: UniqueItem = {
  id: 'w',
  name: 'Test Wand',
  transcendent: false,
  tier: 1,
  gearType: 'Wand',
  category: 'weapon1h',
  reqLevel: 1,
  requirement: null,
  implicit: ['+100-300 Spell DMG', '+1.0 Speed', '+10 Gear Critical Rate'],
  innate: [],
  options: ['+50% DMG', '+20% Speed'],
  season: 'S12',
  status: 'new',
}

const base = (over: Partial<SimInput> = {}): SimInput => ({
  skill: { rune: fireBolt, level: 45, grade: 'normal', awakening: {} },
  links: [{ rune: spellAmp, level: 45, grade: 'normal', awakening: {} }],
  gear: { weapon: wand },
  rollQuality: 1,
  enabledConditions: new Set(),
  componentIndex: 0,
  allProjectilesHit: false,
  custom: { flatMin: 0, flatMax: 0, incDmg: 0, ampDmg: 0, critRating: 0, critDmg: 0, baseSpeed: 1, incSpeed: 0 },
  target: { level: 100, elementResist: 55, chaosResist: 0, armorReduction: 0 },
  ...over,
})

describe('simulate', () => {
  it('follows the official stacking order step by step', () => {
    const r = simulate(base())
    expect(r.ready).toBe(true)
    expect(r.element).toBe('Fire')
    // base flat 100–300 from the wand, skill flat +100, skill multiplier 200%
    expect(r.base).toMatchObject({ min: 100, max: 300 })
    expect(r.components[0]).toMatchObject({ pct: 200, flat: 100 })
    // inc: +50% Fire (link) + 50% (wand) = 100% → ×2; amp 20% → ×1.2
    expect(r.inc.total).toBe(100)
    expect(r.multiplier).toBeCloseTo(2.4)
    expect(r.hit.min).toBeCloseTo(960)
    expect(r.hit.max).toBeCloseTo(1920)
    expect(r.hit.avg).toBeCloseTo(1440)
    // 55 resist at Lv100 → 27.5% reduction
    expect(r.enemy.reduction).toBeCloseTo(27.5)
    expect(r.hit.afterEnemy).toBeCloseTo(1044)
    // 10 crit rating at Lv100 → 2% chance, ×1.5 crit
    expect(r.crit.chance).toBeCloseTo(2)
    expect(r.hit.expected).toBeCloseTo(1054.44)
    // weapon speed 1.0 × 1.2 local
    expect(r.speed.perSecond).toBeCloseTo(1.2)
    expect(r.dps).toBeCloseTo(1265.328)
    expect(r.manaCost).toBeCloseTo(12)
  })

  it('skips link runes that cannot link to the skill', () => {
    const r = simulate(base({ links: [{ rune: attackOnly, level: 45, grade: 'normal', awakening: {} }] }))
    expect(r.amps).toHaveLength(0)
    expect(r.warnings.some((w) => w.startsWith('Attack Only'))).toBe(true)
    expect(r.lines.find((l) => l.source === 'รูนลิงก์ Attack Only')?.status).toBe('inactive')
  })

  it('only counts a conditional line once the user enables it', () => {
    const off = simulate(base())
    const key = lineKey('รูนสกิล Test Bolt', '+150% DMG against Burning enemies')
    expect(off.lines.find((l) => l.key === key)?.status).toBe('conditional-off')
    const on = simulate(base({ enabledConditions: new Set([key]) }))
    expect(on.inc.total).toBe(250)
  })

  it('caps speed at 5 per second', () => {
    const r = simulate(base({ custom: { ...base().custom, incSpeed: 1000 } }))
    expect(r.speed.perSecond).toBe(5)
    expect(r.speed.capped).toBe(true)
  })

  it('reports a problem when there is no skill rune', () => {
    const r = simulate(base({ skill: null }))
    expect(r.ready).toBe(false)
  })
})

describe('checkLink', () => {
  const rules = { groups: [{ mode: 'all' as const, tags: ['Strike', 'Attack'] }], exclude: ['Minion'], minions: false }
  it('requires every tag in an "all" group and none of the excluded', () => {
    expect(checkLink(rules, ['Attack', 'Strike']).ok).toBe(true)
    expect(checkLink(rules, ['Attack']).ok).toBe(false)
    expect(checkLink(rules, ['Attack', 'Strike', 'Minion']).ok).toBe(false)
  })
})

describe('rune levels and rolls', () => {
  const r = rune({ lv1: ['Fire DMG 258%', 'Mana Cost 5'], lv45: ['Fire DMG 645%', 'Mana Cost 15.2'] })
  it('returns published values at Lv1 and Lv45', () => {
    expect(runeLinesAt(r, 1)).toEqual({ lines: ['Fire DMG 258%', 'Mana Cost 5'], estimated: false })
    expect(runeLinesAt(r, 45).estimated).toBe(false)
  })
  it('interpolates linearly in between', () => {
    // 258 + (645 − 258) × 22/44 = 451.5
    expect(runeLinesAt(r, 23).lines[0]).toBe('Fire DMG 451.5%')
    expect(runeLinesAt(r, 23).estimated).toBe(true)
  })
  it('resolves roll ranges by quality', () => {
    expect(resolveRolls('+[40-60]% DMG', 0)).toBe('+40% DMG')
    expect(resolveRolls('+[40-60]% DMG', 0.5)).toBe('+50% DMG')
    expect(resolveRolls('+[279-349]-[418-524] Spell DMG', 1)).toBe('+349-524 Spell DMG')
  })
})
