import { describe, expect, it } from 'vitest'
import { parseLine } from './statParser'

const mod = (line: string, ctx: Parameters<typeof parseLine>[1] = 'link') => parseLine(line, ctx).mod

describe('parseLine — damage stacking', () => {
  it('reads "+X% DMG" as additive', () => {
    expect(mod('+50% Melee DMG')).toEqual({ type: 'dmg', stack: 'inc', scope: 'Melee', value: 50 })
    expect(mod('+15% DMG')).toEqual({ type: 'dmg', stack: 'inc', scope: '', value: 15 })
  })

  it('reads Amplification and Dampening as multiplicative', () => {
    expect(mod('24% Melee DMG Amplification')).toEqual({ type: 'dmg', stack: 'amp', scope: 'Melee', value: 24 })
    expect(mod('15% Projectile DMG Dampening')).toEqual({ type: 'dmg', stack: 'damp', scope: 'Projectile', value: 15 })
  })

  it('does not treat crit, DoT or defensive lines as hit damage', () => {
    expect(mod('+50% Burn DMG')).toBeNull()
    expect(mod('30% DMG Taken Dampening')).toBeNull()
    expect(mod('+20% Critical DMG')).toEqual({ type: 'critDmg', scope: '', value: 20 })
  })

  it('reads flat added damage ranges', () => {
    expect(mod('+37-43 Attack DMG')).toEqual({ type: 'flat', source: 'Attack', min: 37, max: 43 })
    expect(mod('+63-90 Attack and Spell DMG', 'gear')).toEqual({ type: 'flat', source: 'Attack and Spell', min: 63, max: 90 })
  })
})

describe('parseLine — skill rune components', () => {
  it('reads base multiplier and flat damage', () => {
    expect(mod('Fire DMG 645%', 'skill')).toEqual({ type: 'skillPct', key: '', label: 'Fire', pct: 645 })
    expect(mod('Fire DMG +1115', 'skill')).toEqual({ type: 'skillFlat', key: '', value: 1115 })
  })

  it('keeps separate components apart', () => {
    expect(mod('Icy Arrow Cold DMG 422%', 'skill')).toMatchObject({ type: 'skillPct', key: 'icy arrow', pct: 422 })
    expect(mod('Fire Blow DMG 933%', 'skill')).toMatchObject({ key: 'fire blow', pct: 933 })
    expect(mod('584% Physical DMG upon throwing', 'skill')).toMatchObject({ key: 'upon throwing', pct: 584 })
    expect(mod('+317 Physical DMG upon throwing', 'skill')).toEqual({ type: 'skillFlat', key: 'upon throwing', value: 317 })
  })

  it('still reads "+X% Element DMG" in a skill as additive', () => {
    expect(mod('+50% Poison DMG', 'skill')).toEqual({ type: 'dmg', stack: 'inc', scope: 'Poison', value: 50 })
  })

  it('reads cost, cooldown and element', () => {
    expect(mod('Mana Cost 15.2', 'skill')).toEqual({ type: 'manaCost', value: 15.2 })
    expect(mod('Cooldown 20 s', 'skill')).toEqual({ type: 'cooldown', value: 20 })
    expect(mod('Fire Element', 'skill')).toEqual({ type: 'element', element: 'Fire' })
  })
})

describe('parseLine — weapon context', () => {
  it('treats speed and gear crit as weapon base stats', () => {
    expect(mod('+1.1 Speed', 'weapon')).toEqual({ type: 'weaponSpeed', value: 1.1 })
    expect(mod('+20% Speed', 'weapon')).toEqual({ type: 'weaponSpeedInc', value: 20 })
    expect(mod('+11 Gear Critical Rate', 'weapon')).toEqual({ type: 'gearCrit', value: 11 })
    expect(mod('+115% Gear Critical Rate', 'weapon')).toEqual({ type: 'gearCritInc', value: 115 })
  })
})

describe('parseLine — conditions', () => {
  it('splits a trailing condition off so the user can opt in', () => {
    const p = parseLine('+150% DMG against Burning enemies', 'skill')
    expect(p.mod).toEqual({ type: 'dmg', stack: 'inc', scope: '', value: 150 })
    expect(p.condition).toBe('against Burning enemies')
  })

  it('reads "upon <Tag>" as a tag scope rather than a condition', () => {
    const p = parseLine('+249% DMG upon Spell', 'link')
    expect(p.mod).toEqual({ type: 'dmg', stack: 'inc', scope: 'Spell', value: 249 })
    expect(p.condition).toBeUndefined()
  })

  it('marks per-X scaling lines as not countable', () => {
    const p = parseLine('1% Melee DMG Amplification per 50 Strength', 'gear')
    expect(p.mod).toBeNull()
    expect(p.note).toBe('scaling')
  })

  it('parses "additional damage on every hit" without treating it as a condition', () => {
    expect(mod('Additional Fire DMG equal to 10% of DMG on every hit')).toEqual({ type: 'additional', element: 'Fire', pct: 10 })
  })
})

describe('parseLine — speed, crit, cost', () => {
  it('reads speed lines', () => {
    expect(mod('+44.5% Attack Speed')).toEqual({ type: 'speed', kind: 'attack', stack: 'inc', scope: '', value: 44.5 })
    expect(mod('7% Attack Speed Amplification')).toEqual({ type: 'speed', kind: 'attack', stack: 'amp', scope: '', value: 7 })
    expect(mod('20% Base Speed Amplification')).toEqual({ type: 'speed', kind: 'both', stack: 'amp', scope: '', value: 20 })
  })

  it('reads crit lines', () => {
    expect(mod('+30% Critical Rate')).toEqual({ type: 'critRatingInc', scope: '', value: 30 })
    expect(mod('+15% Critical Chance')).toEqual({ type: 'critChance', value: 15 })
    expect(mod('+10 Sentry Critical Rate')).toEqual({ type: 'critRating', scope: 'Sentry', value: 10 })
  })

  it('reads resource cost lines', () => {
    expect(mod('Resource Cost Increase 20%')).toEqual({ type: 'cost', stack: 'inc', value: 20 })
    expect(mod('-10% Resource Cost')).toEqual({ type: 'cost', stack: 'inc', value: -10 })
  })
})
