import { describe, expect, it } from 'vitest'
import { LINK_RUNES, SKILL_RUNES } from '../data'
import { DAMAGE_TYPES, SKILL_GUIDES } from '../data/runeGuide'
import { analyseLinks, awakeningLinks, damageKind, effectLines, groupsOf, linkFit, resourceCost, triggerRoles } from './runeGuide'

const skill = (name: string) => {
  const r = SKILL_RUNES.find((x) => x.name === name)
  if (!r) throw new Error(`no skill rune ${name}`)
  return r
}
const link = (name: string) => {
  const r = LINK_RUNES.find((x) => x.name === name)
  if (!r) throw new Error(`no link rune ${name}`)
  return r
}

describe('damageKind', () => {
  it('sorts skills by their damage tags', () => {
    expect(damageKind(skill('Fire Ball'))).toBe('hit')
    expect(damageKind(skill('Toxic Flame'))).toBe('dot')
    expect(damageKind(skill('Wheel Slash'))).toBe('mixed')
    expect(damageKind(skill('Seal of Pain'))).toBe('other')
  })
})

describe('linkFit', () => {
  it('blocks crit and Maximized runes on a skill without Strike', () => {
    for (const name of ['Find Weakness', 'Slaughter', 'Maximized DMG Increase', 'Increase Maximized DMG Chance']) {
      expect(linkFit(link(name), skill('Toxic Flame')).ok).toBe(false)
    }
    expect(linkFit(link('DoT'), skill('Toxic Flame')).ok).toBe(true)
    expect(linkFit(link('Spell DMG Increase'), skill('Toxic Flame')).ok).toBe(true)
  })

  it("reads a skill's restrictions, not only its tags", () => {
    expect(skill('Toxic Flame').restrictions).toContain('Cannot Split')
    expect(linkFit(link('Split Projectile'), skill('Toxic Flame')).ok).toBe(false)
    expect(linkFit(link('Split Projectile'), skill('Fire Ball')).ok).toBe(true)
  })

  it('reads cooldown rules from the description', () => {
    expect(linkFit(link('Mana Outburst'), skill('Fire Ball')).ok).toBe(false)
    expect(linkFit(link('Mana Outburst'), skill('Meteor')).ok).toBe(true)
    expect(linkFit(link('Time Warp'), skill('Fire Ball')).ok).toBe(true)
    expect(linkFit(link('Time Warp'), skill('Meteor')).ok).toBe(false)
  })

  it('reads the wording of Convert Physical Damage and Time Warp', () => {
    expect(linkFit(link('Convert Physical Damage'), skill('Fire Ball')).ok).toBe(true)
    expect(linkFit(link('Convert Physical Damage'), skill('Wheel Slash')).ok).toBe(false)
    expect(linkFit(link('Time Warp'), skill('Flamethrower')).ok).toBe(false)
  })

  it('needs a use count for Use Count', () => {
    expect(linkFit(link('Use Count'), skill('Meteor')).ok).toBe(true)
    expect(linkFit(link('Use Count'), skill('Fire Ball')).ok).toBe(false)
  })

  it('lets minion-friendly runes onto summons', () => {
    const summon = SKILL_RUNES.find((r) => r.tags.includes('Minion') && !r.tags.includes('Strike'))!
    expect(linkFit(link('Find Weakness'), summon).ok).toBe(true)
    expect(linkFit(link('Sharpness'), summon).ok).toBe(false)
  })
})

describe('triggerRoles', () => {
  it('is null for ordinary link runes', () => {
    expect(triggerRoles(link('DoT'), skill('Fire Ball'))).toBeNull()
  })

  it('knows which side of Spell Activation on Attack Hit a skill can take', () => {
    const rune = link('Spell Activation on Attack Hit')
    expect(triggerRoles(rune, skill('Cross Lightning Arrow'))).toEqual({ activator: true, target: false })
    expect(triggerRoles(rune, skill('Lightning Chain'))).toEqual({ activator: false, target: true })
  })

  it('maps the Channeling and Enhance wording to tags', () => {
    expect(triggerRoles(link('Spell Activation while Channeling'), skill('Flamethrower'))?.activator).toBe(true)
    expect(triggerRoles(link('Spell Activation while Channeling'), skill('Flamethrower'))?.target).toBe(false)
    expect(triggerRoles(link('Buff Activation when Hit'), skill('Intensify Pain'))).toEqual({ activator: false, target: true })
  })
})

describe('awakeningLinks', () => {
  it('finds runes an awakening grants and forbids', () => {
    expect(awakeningLinks(skill('Fire Ball'))).toEqual([{ tier: 'verity', rune: 'Quick Cast', grants: true, forbids: true }])
    expect(awakeningLinks(skill('Toxic Flame')).map((a) => `${a.tier}:${a.rune}`)).toEqual(['source:Quick Cast', 'verity:Parallel Multishot'])
  })
})

describe('link rune summaries', () => {
  it('splits the cost from the effects', () => {
    const rune = link('Mana Storm')
    expect(resourceCost(rune)).toBe('30%')
    expect(effectLines(rune).some((l) => l.startsWith('Resource Cost Increase'))).toBe(false)
    expect(effectLines(rune)).toContain('6% DoT Amplification')
  })

  it('groups runes by what they do', () => {
    expect(groupsOf(link('Find Weakness'))).toContain('crit')
    expect(groupsOf(link('Maximized DMG Increase'))).toContain('max')
    expect(groupsOf(link('DoT'))).toEqual(expect.arrayContaining(['amp', 'dot']))
    expect(groupsOf(link('Element Master'))).toContain('pen')
  })

  it('accounts for every link rune once', () => {
    const { usable, triggers, blocked } = analyseLinks(skill('Fire Ball'))
    expect(usable.length + triggers.length + blocked.flatMap((b) => b.runes).length).toBe(LINK_RUNES.length)
  })
})

describe('legacy runes', () => {
  it('adds runes the season sheet leaves out, flagged as legacy', () => {
    const rune = link('Spell Activation on Attack Hit')
    expect(rune.status).toBe('legacy')
    expect(rune.color).toBe('red')
    expect(rune.lv45).toContain('26.9% DMG Dampening for Activated Skill')
    expect(rune.grades.legendary).toContain('5% DMG Dampening for Activated Skill')
  })

  it('does not list a renamed rune twice', () => {
    expect(LINK_RUNES.some((r) => r.name === 'Increased Trap Install Distance')).toBe(false)
    expect(link('Increase Trap Install Distance').color).toBe('green')
  })

  it('keeps ids unique', () => {
    expect(new Set(LINK_RUNES.map((r) => r.id)).size).toBe(LINK_RUNES.length)
  })
})

describe('hand-written guide', () => {
  it('names real runes in the damage types', () => {
    for (const type of DAMAGE_TYPES) for (const name of type.runes) expect(() => link(name)).not.toThrow()
  })

  for (const [name, guide] of Object.entries(SKILL_GUIDES)) {
    for (const set of guide.sets) {
      it(`${name}: "${set.label}" can really be built`, () => {
        const target = skill(name)
        expect(set.links.length).toBeLessThanOrEqual(6)
        expect(new Set(set.links).size).toBe(set.links.length)
        const forbidden = awakeningLinks(target).filter((a) => a.forbids && set.awakening.includes(a.tier))
        for (const runeName of set.links) {
          const rune = link(runeName)
          expect(forbidden.map((a) => a.rune)).not.toContain(runeName)
          const roles = triggerRoles(rune, target)
          const ok = roles ? roles.activator || roles.target : linkFit(rune, target).ok
          expect(ok, `${runeName} on ${name}`).toBe(true)
        }
      })
    }
  }
})
