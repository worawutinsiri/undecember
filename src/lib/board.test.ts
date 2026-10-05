import { afterEach, describe, expect, it, vi } from 'vitest'
import { RUNE_BY_ID } from '../data'
import { autoCell, moveRune, placeRune } from '../components/sim/boardOps'
import { CENTER, EMPTY_BUILD, focusKey, linksOf, loadBuild, toSimInput, type BuildState } from './buildState'
import { ALL_WHITE, DIRS, LAYOUTS, connect, directionTo, hexKey, hexagon, neighbour, runeCastCells } from './hexBoard'

const rune = (key: string) => {
  const r = RUNE_BY_ID.get(key)
  if (!r) throw new Error(`missing rune ${key}`)
  return r
}
const FIRE_BALL = rune('skill:fire-ball')
const ELEMENT_AMP = rune('link:element-dmg-amplification')
const QUICK_ATTACK = rune('link:quick-attack') // Attack skills only

describe('hex geometry', () => {
  it('builds hexagon boards', () => {
    expect(hexagon(1)).toHaveLength(7)
    expect(hexagon(3)).toHaveLength(37)
  })

  it('lays out the in-game Rune Cast: rows of 5,6,7,8,7,6,5 with 14 expansion cells', () => {
    const { cells, expansion } = runeCastCells()
    expect(cells).toHaveLength(44)
    const rows = [-3, -2, -1, 0, 1, 2, 3].map((r) => cells.filter((h) => h.r === r).length)
    expect(rows).toEqual([5, 6, 7, 8, 7, 6, 5])
    expect(expansion.size).toBe(14)
    expect(cells.every((h) => Number.isInteger(h.q))).toBe(true)
  })

  it('finds directions between neighbours, opposite directions are 3 apart', () => {
    const o = { q: 0, r: 0 }
    DIRS.forEach((_, d) => {
      expect(directionTo(o, neighbour(o, d))).toBe(d)
      expect(directionTo(neighbour(o, d), o)).toBe((d + 3) % 6)
    })
    expect(directionTo(o, { q: 2, r: 0 })).toBe(-1)
  })
})

describe('connect', () => {
  it('needs an open slot of a matching colour and matching tags', () => {
    expect(connect(ELEMENT_AMP, FIRE_BALL, ALL_WHITE, 0).ok).toBe(true)
    expect(connect(QUICK_ATTACK, FIRE_BALL, ALL_WHITE, 0).ok).toBe(false)

    const closed = [...ALL_WHITE]
    closed[2] = 'closed'
    expect(connect(ELEMENT_AMP, FIRE_BALL, closed, 2)).toMatchObject({ ok: false })

    const wrong = [...ALL_WHITE]
    wrong[1] = ELEMENT_AMP.color === 'red' ? 'blue' : 'red'
    expect(connect(ELEMENT_AMP, FIRE_BALL, wrong, 1).ok).toBe(false)
    if (ELEMENT_AMP.color) {
      const right = [...ALL_WHITE]
      right[1] = ELEMENT_AMP.color
      expect(connect(ELEMENT_AMP, FIRE_BALL, right, 1).ok).toBe(true)
    }
  })
})

describe('board operations', () => {
  const single = (): BuildState => ({ ...EMPTY_BUILD, mode: 'single' })
  const full = (): BuildState => ({ ...EMPTY_BUILD, mode: 'full' })

  it('pins the skill to the centre on the single-skill board', () => {
    let b = placeRune(single(), 'skill', 'fire-ball', CENTER)
    expect(b.boards.single[CENTER]?.id).toBe('fire-ball')
    const ring = hexKey(DIRS[0])
    b = placeRune(b, 'skill', 'fire-ball', ring)
    expect(b.boards.single[ring]).toBeUndefined()
  })

  it('puts "+" links next to the analysed skill', () => {
    let b = placeRune(full(), 'skill', 'fire-ball', '1,1')
    const key = autoCell(b, 'link')!
    expect(directionTo({ q: 1, r: 1 }, { q: Number(key.split(',')[0]), r: Number(key.split(',')[1]) })).toBeGreaterThanOrEqual(0)
    b = placeRune(b, 'link', 'element-dmg-amplification', key)
    expect(linksOf(b.boards.full, '1,1')).toHaveLength(1)
  })

  it('lets one link rune serve two neighbouring skills', () => {
    let b = placeRune(full(), 'skill', 'fire-ball', '0,0')
    b = placeRune(b, 'skill', 'meteor', '2,0')
    b = placeRune(b, 'link', 'element-dmg-amplification', '1,0')
    expect(linksOf(b.boards.full, '0,0').map((l) => l.key)).toEqual(['1,0'])
    expect(linksOf(b.boards.full, '2,0').map((l) => l.key)).toEqual(['1,0'])
  })

  it('swaps runes when moving onto an occupied cell, and focus follows the skill', () => {
    let b = placeRune(full(), 'skill', 'fire-ball', '0,0')
    b = placeRune(b, 'link', 'element-dmg-amplification', '1,0')
    const moved = moveRune(b, '0,0', '1,0')!
    expect(moved.boards.full['1,0'].kind).toBe('skill')
    expect(moved.boards.full['0,0'].kind).toBe('link')
    expect(focusKey(moved)).toBe('1,0')
  })

  it('refuses moves the single-skill layout does not allow', () => {
    let b = placeRune(single(), 'skill', 'fire-ball', CENTER)
    b = placeRune(b, 'link', 'element-dmg-amplification', hexKey(DIRS[0]))
    expect(moveRune(b, CENTER, hexKey(DIRS[1]))).toBeNull()
  })

  it('counts the same link rune only once per skill', () => {
    let b = placeRune(single(), 'skill', 'fire-ball', CENTER)
    b = placeRune(b, 'link', 'element-dmg-amplification', hexKey(DIRS[0]))
    b = placeRune(b, 'link', 'element-dmg-amplification', hexKey(DIRS[1]))
    expect(linksOf(b.boards.single, CENTER).map((l) => l.connection.ok)).toEqual([true, false])
  })

  it('gives links in white slots +1 level', () => {
    let b = placeRune(single(), 'skill', 'fire-ball', CENTER)
    b = placeRune(b, 'link', 'element-dmg-amplification', hexKey(DIRS[0]))
    expect(toSimInput(b).links[0]?.level).toBe(46)
    const cells = b.boards.single
    const slots = [...ALL_WHITE]
    slots[0] = ELEMENT_AMP.color ?? 'red'
    b = { ...b, boards: { ...b.boards, single: { ...cells, [CENTER]: { ...cells[CENTER], slots } } } }
    expect(toSimInput(b).links[0]?.level).toBe(45)
  })

  it('refuses a second copy of the same skill rune', () => {
    let b = placeRune(full(), 'skill', 'fire-ball', '0,0')
    b = placeRune(b, 'skill', 'fire-ball', '2,0')
    expect(b.boards.full['2,0']).toBeUndefined()
  })

  it('passes blocked links to the simulator with a reason', () => {
    let b = placeRune(single(), 'skill', 'fire-ball', CENTER)
    b = placeRune(b, 'link', 'quick-attack', hexKey(DIRS[0]))
    const input = toSimInput(b)
    expect(input.links).toHaveLength(1)
    expect(input.links[0]?.blocked).toBeTruthy()
  })

  it('every layout cell is unique', () => {
    for (const l of Object.values(LAYOUTS)) expect(new Set(l.cells.map(hexKey)).size).toBe(l.cells.length)
  })
})

describe('loadBuild', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('migrates a v1 build (one skill + six links) onto the single-skill board', () => {
    const store: Record<string, string> = {
      'ud-sim-build-v1': JSON.stringify({
        skill: { id: 'fire-ball', level: 30, grade: 'rare', awakening: {} },
        links: [{ id: 'element-dmg-amplification', level: 20, grade: 'normal', awakening: {} }, null, null, null, null, null],
        rollQuality: 1,
      }),
    }
    vi.stubGlobal('localStorage', { getItem: (k: string) => store[k] ?? null, setItem: () => {} })
    const b = loadBuild()
    expect(b.mode).toBe('single')
    expect(b.boards.single[CENTER]).toMatchObject({ kind: 'skill', id: 'fire-ball', level: 30, grade: 'rare' })
    expect(b.boards.single[hexKey(DIRS[0])]).toMatchObject({ kind: 'link', id: 'element-dmg-amplification', level: 20 })
    expect(b.rollQuality).toBe(1)
  })
})
