import { useDndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { GRADE_TH } from '../../i18n/labels'
import { adjacentSkills, focusKey, linksOf, newCell, runeOf, type BuildState, type CellRune, type Cells } from '../../lib/buildState'
import { DIRS, LAYOUTS, hexCenter, hexKey, parseKey, type Hex } from '../../lib/hexBoard'
import type { Selection } from './boardOps'
import { accepts, dropId, type DragPayload, type DropTarget } from './dnd'

export interface Preview {
  key: string
  kind: 'skill' | 'link'
  id: string
}

const SQRT3 = Math.sqrt(3)
const MAX_STEP = { single: 124, full: 112 }

/** The board as it would look with the previewed rune dropped in (same rules as placeRune). */
function withPreview(real: Cells, p: Preview | null): Cells {
  if (!p) return real
  const prev = real[p.key]
  return { ...real, [p.key]: prev?.kind === p.kind ? { ...prev, id: p.id } : newCell(p.kind, p.id) }
}

const abbreviate = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 3)
    .map((w) => w[0])
    .join('')

function Cell({
  hex,
  cell,
  kinds,
  ghost,
  expansion,
  selected,
  focused,
  compact,
  emptyLabel,
  style,
  onClick,
}: {
  hex: Hex
  cell?: CellRune
  kinds: ('skill' | 'link')[]
  ghost: boolean
  expansion: boolean
  selected: boolean
  focused: boolean
  compact: boolean
  emptyLabel: string
  style: CSSProperties
  onClick: () => void
}) {
  const key = hexKey(hex)
  const target: DropTarget = { type: 'cell', key, kinds }
  const drop = useDroppable({ id: dropId(target), data: target })
  const payload: DragPayload | undefined = cell && !ghost ? { kind: cell.kind, id: cell.id, from: key } : undefined
  const drag = useDraggable({ id: `cell:${key}`, data: payload, disabled: !payload })
  const { active } = useDndContext()
  const dragging = active?.data.current as DragPayload | undefined
  const can = accepts(target, dragging) && dragging?.from !== key
  const rune = runeOf(cell)

  const cls = [
    'hex',
    cell ? `filled ${cell.kind} c-${rune?.color ?? 'none'}` : 'empty',
    ghost ? 'ghost' : '',
    expansion ? 'expansion' : '',
    can ? 'can-drop' : '',
    drop.isOver && can ? 'over' : '',
    selected ? 'selected' : '',
    focused ? 'focused' : '',
    drag.isDragging ? 'dragging' : '',
    cell && cell.grade !== 'normal' ? `g-${cell.grade}` : '',
  ].join(' ')

  return (
    <button
      ref={(n) => {
        drop.setNodeRef(n)
        drag.setNodeRef(n)
      }}
      className={cls}
      style={style}
      onClick={onClick}
      title={rune ? `${rune.name} · Lv.${cell!.level}` : expansion ? "ช่องขยาย (ในเกมปลดล็อกด้วย Traum's Crystal)" : emptyLabel}
      {...(payload ? drag.listeners : {})}
      {...(payload ? drag.attributes : {})}
      aria-label={rune ? rune.name : emptyLabel}
    >
      <span className="hex-inner">
        {rune ? (
          <>
            <span className="hex-name">{compact ? abbreviate(rune.name) : rune.name}</span>
            <span className="hex-level mono">
              {compact ? cell!.level : `Lv.${cell!.level}`}
              {!compact && cell!.grade !== 'normal' && ` · ${GRADE_TH[cell!.grade]}`}
            </span>
          </>
        ) : (
          <span className="hex-empty">{emptyLabel}</span>
        )}
      </span>
    </button>
  )
}

export function RuneBoard({
  build,
  selection,
  preview,
  onCellClick,
}: {
  build: BuildState
  selection: Selection
  preview: Preview | null
  onCellClick: (key: string) => void
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(480)
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = LAYOUTS[build.mode]
  const real = build.boards[build.mode]
  const cells = withPreview(real, preview)
  const focus = focusKey({ ...build, boards: { ...build.boards, [build.mode]: cells } })
  const selectedKey = selection?.type === 'cell' ? selection.key : null

  // geometry, in units of the centre-to-centre step
  const centers = layout.cells.map(hexCenter)
  const minX = Math.min(...centers.map((c) => c.x))
  const maxX = Math.max(...centers.map((c) => c.x))
  const minY = Math.min(...centers.map((c) => c.y))
  const maxY = Math.max(...centers.map((c) => c.y))
  const step = Math.min(MAX_STEP[build.mode], width / (maxX - minX + 1.05))
  const hexH = (2 / SQRT3) * step
  const boardW = (maxX - minX + 1) * step
  const boardH = (maxY - minY) * step + hexH
  const px = (h: Hex) => {
    const c = hexCenter(h)
    return { x: (c.x - minX + 0.5) * step, y: (c.y - minY) * step + hexH / 2 }
  }
  const compact = step < 78

  // link lines: every link rune next to every skill rune
  const lines = Object.keys(cells)
    .filter((k) => cells[k].kind === 'skill')
    .flatMap((sk) =>
      linksOf(cells, sk).map((l) => ({ skill: sk, link: l.key, dir: l.dir, ok: l.connection.ok, reason: l.connection.reason })),
    )
  // an empty selected cell: show which skills a link rune here would serve
  const potential =
    selectedKey && !cells[selectedKey] ? adjacentSkills(cells, selectedKey).map((s) => ({ skill: s.key, link: selectedKey, dir: s.dirFromSkill })) : []
  const touches = (l: { skill: string; link: string }) => !selectedKey || l.skill === selectedKey || l.link === selectedKey

  const slotDots = Object.keys(cells)
    .filter((k) => cells[k].kind === 'skill')
    .flatMap((sk) => {
      const at = parseKey(sk)
      return DIRS.map((d, dir) => {
        const neighbourKey = hexKey({ q: at.q + d.q, r: at.r + d.r })
        const onBoard = layout.cells.some((h) => hexKey(h) === neighbourKey)
        return { skill: sk, dir, neighbourKey, onBoard, color: cells[sk].slots?.[dir] ?? 'white' }
      }).filter((s) => s.onBoard)
    })

  return (
    <div ref={wrap} className="rune-board-wrap">
      <div className={`rune-board mode-${build.mode}`} style={{ width: boardW, height: boardH, '--step': `${step}px` } as CSSProperties}>
        {layout.cells.map((h) => {
          const key = hexKey(h)
          const kinds = (['skill', 'link'] as const).filter((k) => layout.accepts(h, k))
          const p = px(h)
          const isGhost = preview?.key === key
          return (
            <Cell
              key={key}
              hex={h}
              cell={cells[key]}
              kinds={[...kinds]}
              ghost={isGhost}
              expansion={layout.expansion.has(key)}
              selected={selectedKey === key}
              focused={focus === key && build.mode === 'full'}
              compact={compact}
              emptyLabel={build.mode === 'single' ? (kinds.includes('skill') ? 'รูนสกิล' : 'รูนลิงก์') : '+'}
              style={{ left: p.x, top: p.y, width: step * 0.94, height: hexH * 0.94 }}
              onClick={() => onCellClick(key)}
            />
          )
        })}

        <svg className="board-lines" width={boardW} height={boardH} aria-hidden>
          {potential.map((l) => {
            const a = px(parseKey(l.skill))
            const b = px(parseKey(l.link))
            return <line key={`p${l.skill}${l.link}`} className="ln potential" x1={a.x + (b.x - a.x) * 0.3} y1={a.y + (b.y - a.y) * 0.3} x2={a.x + (b.x - a.x) * 0.7} y2={a.y + (b.y - a.y) * 0.7} />
          })}
          {lines.map((l) => {
            const a = px(parseKey(l.skill))
            const b = px(parseKey(l.link))
            return (
              <line
                key={`l${l.skill}${l.link}`}
                className={`ln ${l.ok ? 'ok' : 'bad'} ${touches(l) ? '' : 'dim'}`}
                x1={a.x + (b.x - a.x) * 0.26}
                y1={a.y + (b.y - a.y) * 0.26}
                x2={a.x + (b.x - a.x) * 0.74}
                y2={a.y + (b.y - a.y) * 0.74}
              >
                {l.reason && <title>{l.reason}</title>}
              </line>
            )
          })}
          {slotDots.map((s) => {
            const a = px(parseKey(s.skill))
            const b = px(parseKey(s.neighbourKey))
            const line = lines.find((l) => l.skill === s.skill && l.link === s.neighbourKey)
            const r = Math.max(5, step * 0.085)
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            return (
              <g key={`s${s.skill}${s.dir}`} className={`slot-dot slot-${s.color} ${line ? (line.ok ? 'ok' : 'bad') : ''} ${line && !touches(line) ? 'dim' : ''}`}>
                <circle cx={mx} cy={my} r={r} />
                {line && (
                  <text x={mx} y={my} dy="0.35em" textAnchor="middle" style={{ fontSize: r * 1.3 }}>
                    {line.ok ? '✓' : '✕'}
                  </text>
                )}
                {s.color === 'closed' && !line && (
                  <text x={mx} y={my} dy="0.35em" textAnchor="middle" style={{ fontSize: r * 1.2 }}>
                    ×
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
