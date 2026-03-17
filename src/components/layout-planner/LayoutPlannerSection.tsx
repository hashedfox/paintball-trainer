import { useState, useRef, useCallback, useMemo, type MouseEvent as ReactMouseEvent } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import {
  DEFAULT_FIELD_LAYOUT,
  PLAYER_COLORS,
  type Bunker,
  type BreakoutPlan,
  type BreakoutArrow,
  type ScoutingNote,
} from '../../types/layout'

// ─── Constants ───────────────────────────────────────────────────────────────

const FIELD_W = 800
const FIELD_H = 500
const FIELD_PAD = 20

const BUNKER_SHAPES: Record<Bunker['type'], (b: Bunker, sel: boolean) => JSX.Element> = {
  snake: (b, sel) => (
    <rect
      x={pctX(b.x) - 14}
      y={pctY(b.y) - 6}
      width={28}
      height={12}
      rx={6}
      className={bunkerFill(sel)}
    />
  ),
  dorito: (b, sel) => (
    <polygon
      points={`${pctX(b.x)},${pctY(b.y) - 12} ${pctX(b.x) - 11},${pctY(b.y) + 8} ${pctX(b.x) + 11},${pctY(b.y) + 8}`}
      className={bunkerFill(sel)}
    />
  ),
  brick: (b, sel) => (
    <rect
      x={pctX(b.x) - 16}
      y={pctY(b.y) - 10}
      width={32}
      height={20}
      rx={3}
      className={bunkerFill(sel)}
    />
  ),
  cake: (b, sel) => (
    <circle cx={pctX(b.x)} cy={pctY(b.y)} r={11} className={bunkerFill(sel)} />
  ),
  temple: (b, sel) => (
    <rect
      x={pctX(b.x) - 14}
      y={pctY(b.y) - 14}
      width={28}
      height={28}
      rx={4}
      className={bunkerFill(sel)}
    />
  ),
  can: (b, sel) => (
    <circle cx={pctX(b.x)} cy={pctY(b.y)} r={9} className={bunkerFill(sel)} />
  ),
  'tall-cake': (b, sel) => (
    <rect
      x={pctX(b.x) - 10}
      y={pctY(b.y) - 16}
      width={20}
      height={32}
      rx={10}
      className={bunkerFill(sel)}
    />
  ),
  mini: (b, sel) => (
    <circle cx={pctX(b.x)} cy={pctY(b.y)} r={7} className={bunkerFill(sel)} />
  ),
  pin: (b, sel) => (
    <rect
      x={pctX(b.x) - 4}
      y={pctY(b.y) - 14}
      width={8}
      height={28}
      rx={4}
      className={bunkerFill(sel)}
    />
  ),
}

function pctX(pct: number) {
  return FIELD_PAD + (pct / 100) * (FIELD_W - FIELD_PAD * 2)
}
function pctY(pct: number) {
  return FIELD_PAD + (pct / 100) * (FIELD_H - FIELD_PAD * 2)
}
function bunkerFill(selected: boolean) {
  return selected ? 'fill-[#39D353] stroke-[#39D353]/60 stroke-2' : 'fill-[#30363D] stroke-[#484F58] stroke-[1.5]'
}

// Convert SVG coordinates back to percentage
function svgToPercent(svgX: number, svgY: number): { x: number; y: number } {
  const x = ((svgX - FIELD_PAD) / (FIELD_W - FIELD_PAD * 2)) * 100
  const y = ((svgY - FIELD_PAD) / (FIELD_H - FIELD_PAD * 2)) * 100
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
}

// ─── Drill data ──────────────────────────────────────────────────────────────

interface Drill {
  id: string
  name: string
  description: string
  duration: string
  ppiAxis: string
  ppiIcon: string
}

const DRILLS: Drill[] = [
  {
    id: 'snap-corners',
    name: 'Snap & Slide',
    description: 'Practice snapping out from bunker edges with target transitions.',
    duration: '10 min',
    ppiAxis: 'Snap Shooting',
    ppiIcon: '🎯',
  },
  {
    id: 'breakout-speed',
    name: 'Breakout Sprint',
    description: 'Timed runs from start box to primary bunkers. Build muscle memory.',
    duration: '8 min',
    ppiAxis: 'Movement',
    ppiIcon: '⚡',
  },
  {
    id: 'lane-denial',
    name: 'Lane Lock',
    description: 'Hold designated shooting lanes off the break for 3-second windows.',
    duration: '12 min',
    ppiAxis: 'Gun Skills',
    ppiIcon: '🔒',
  },
  {
    id: 'comm-calls',
    name: 'Comm Drill',
    description: 'Practice callouts: bunker names, kills, movements, and wrap alerts.',
    duration: '6 min',
    ppiAxis: 'Communication',
    ppiIcon: '📢',
  },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Interactive SVG field with bunkers */
function FieldSVG({
  bunkers,
  selectedBunkerId,
  onBunkerClick,
  arrows,
  drawingArrow,
  activePlayerId,
}: {
  bunkers: Bunker[]
  selectedBunkerId: string | null
  onBunkerClick: (b: Bunker) => void
  arrows: BreakoutArrow[]
  drawingArrow: { from: { x: number; y: number }; to: { x: number; y: number } } | null
  activePlayerId: number
}) {
  // Grid lines
  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = []
    for (let i = 0; i <= 10; i++) {
      const x = FIELD_PAD + (i / 10) * (FIELD_W - FIELD_PAD * 2)
      const y = FIELD_PAD + (i / 10) * (FIELD_H - FIELD_PAD * 2)
      lines.push(
        <line key={`vg${i}`} x1={x} y1={FIELD_PAD} x2={x} y2={FIELD_H - FIELD_PAD} stroke="#1a3a1a" strokeWidth={0.8} />,
        <line key={`hg${i}`} x1={FIELD_PAD} y1={y} x2={FIELD_W - FIELD_PAD} y2={y} stroke="#1a3a1a" strokeWidth={0.8} />,
      )
    }
    return lines
  }, [])

  // Midfield line
  const midY = FIELD_PAD + (FIELD_H - FIELD_PAD * 2) / 2

  return (
    <svg viewBox={`0 0 ${FIELD_W} ${FIELD_H}`} className="w-full h-auto rounded-lg border border-[#30363D] bg-[#0D1117]">
      {/* Defs for arrow markers and glow */}
      <defs>
        {PLAYER_COLORS.map((color, i) => (
          <marker
            key={`ah${i}`}
            id={`arrowhead-${i}`}
            markerWidth={8}
            markerHeight={6}
            refX={7}
            refY={3}
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill={color} />
          </marker>
        ))}
        <filter id="bunker-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="field-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Field surface */}
      <rect
        x={FIELD_PAD}
        y={FIELD_PAD}
        width={FIELD_W - FIELD_PAD * 2}
        height={FIELD_H - FIELD_PAD * 2}
        rx={4}
        fill="#0f2b0f"
      />

      {/* Grid */}
      {gridLines}

      {/* Midfield line */}
      <line
        x1={FIELD_PAD}
        y1={midY}
        x2={FIELD_W - FIELD_PAD}
        y2={midY}
        stroke="#2a5a2a"
        strokeWidth={2}
        strokeDasharray="8 4"
      />

      {/* Start boxes */}
      <rect
        x={FIELD_PAD + 4}
        y={FIELD_H - FIELD_PAD - 40}
        width={FIELD_W - FIELD_PAD * 2 - 8}
        height={36}
        rx={3}
        fill="none"
        stroke="#39D353"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        opacity={0.35}
      />
      <text
        x={FIELD_W / 2}
        y={FIELD_H - FIELD_PAD - 16}
        textAnchor="middle"
        fill="#39D353"
        fontSize={11}
        fontWeight={700}
        opacity={0.5}
        fontFamily="monospace"
      >
        START BOX
      </text>

      {/* Opponent start box */}
      <rect
        x={FIELD_PAD + 4}
        y={FIELD_PAD + 4}
        width={FIELD_W - FIELD_PAD * 2 - 8}
        height={36}
        rx={3}
        fill="none"
        stroke="#F85149"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        opacity={0.25}
      />

      {/* Saved arrows */}
      {arrows.map((arrow, idx) => {
        const color = PLAYER_COLORS[(arrow.playerId - 1) % PLAYER_COLORS.length]
        const markerId = `arrowhead-${(arrow.playerId - 1) % PLAYER_COLORS.length}`
        let dashArray: string | undefined
        if (arrow.type === 'secondary') dashArray = '8 4'
        if (arrow.type === 'lane') dashArray = '3 3'
        return (
          <line
            key={`arrow-${idx}`}
            x1={pctX(arrow.from.x)}
            y1={pctY(arrow.from.y)}
            x2={pctX(arrow.to.x)}
            y2={pctY(arrow.to.y)}
            stroke={color}
            strokeWidth={arrow.type === 'lane' ? 1.5 : 2.5}
            strokeDasharray={dashArray}
            markerEnd={`url(#${markerId})`}
            opacity={0.85}
          />
        )
      })}

      {/* Currently drawing arrow */}
      {drawingArrow && (
        <line
          x1={pctX(drawingArrow.from.x)}
          y1={pctY(drawingArrow.from.y)}
          x2={pctX(drawingArrow.to.x)}
          y2={pctY(drawingArrow.to.y)}
          stroke={PLAYER_COLORS[(activePlayerId - 1) % PLAYER_COLORS.length]}
          strokeWidth={2.5}
          markerEnd={`url(#arrowhead-${(activePlayerId - 1) % PLAYER_COLORS.length})`}
          opacity={0.6}
          strokeDasharray="4 2"
        />
      )}

      {/* Bunkers */}
      {bunkers.map((b) => {
        const isSel = selectedBunkerId === b.id
        return (
          <g
            key={b.id}
            onClick={() => onBunkerClick(b)}
            className="cursor-pointer"
            filter={isSel ? 'url(#bunker-glow)' : undefined}
          >
            {BUNKER_SHAPES[b.type](b, isSel)}
            <text
              x={pctX(b.x)}
              y={pctY(b.y) + (b.type === 'tall-cake' ? 24 : b.type === 'temple' ? 22 : 20)}
              textAnchor="middle"
              fill={isSel ? '#39D353' : '#8B949E'}
              fontSize={9}
              fontWeight={700}
              fontFamily="monospace"
            >
              {b.shortName}
            </text>
          </g>
        )
      })}

      {/* Side labels */}
      <text x={FIELD_PAD + 8} y={midY - 6} fill="#A371F7" fontSize={10} fontWeight={700} opacity={0.5} fontFamily="monospace">
        SNAKE SIDE
      </text>
      <text x={FIELD_W - FIELD_PAD - 8} y={midY - 6} textAnchor="end" fill="#A371F7" fontSize={10} fontWeight={700} opacity={0.5} fontFamily="monospace">
        DORITO SIDE
      </text>
    </svg>
  )
}

/** Player selector bar */
function PlayerSelector({
  activePlayer,
  onSelect,
}: {
  activePlayer: number
  onSelect: (id: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((pid) => {
        const color = PLAYER_COLORS[pid - 1]
        const active = activePlayer === pid
        return (
          <button
            key={pid}
            onClick={() => onSelect(pid)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all
              border
              ${active ? 'border-current shadow-lg scale-105' : 'border-[#30363D] opacity-60 hover:opacity-90'}
            `}
            style={{
              color: color,
              backgroundColor: active ? `${color}15` : 'transparent',
              borderColor: active ? color : undefined,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            P{pid}
          </button>
        )
      })}
    </div>
  )
}

/** Arrow type selector */
function ArrowTypeSelector({
  arrowType,
  onSelect,
}: {
  arrowType: BreakoutArrow['type']
  onSelect: (t: BreakoutArrow['type']) => void
}) {
  const types: { value: BreakoutArrow['type']; label: string; desc: string }[] = [
    { value: 'primary', label: '━━', desc: 'Primary' },
    { value: 'secondary', label: '╌╌', desc: 'Secondary' },
    { value: 'lane', label: '···', desc: 'Lane' },
  ]
  return (
    <div className="flex items-center gap-1.5">
      {types.map((t) => (
        <button
          key={t.value}
          onClick={() => onSelect(t.value)}
          className={`
            px-2.5 py-1 rounded text-[10px] font-bold tracking-wider transition-all border
            ${arrowType === t.value
              ? 'border-[#39D353] text-[#39D353] bg-[#39D353]/10'
              : 'border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'}
          `}
        >
          <span className="block text-sm leading-none">{t.label}</span>
          <span className="block mt-0.5">{t.desc}</span>
        </button>
      ))}
    </div>
  )
}

/** Breakout plan library panel */
function PlanLibrary({
  plans,
  activePlanId,
  onLoad,
  onDelete,
}: {
  plans: BreakoutPlan[]
  activePlanId: string | null
  onLoad: (plan: BreakoutPlan) => void
  onDelete: (planId: string) => void
}) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-[#484F58]">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-xs font-semibold">No saved plans yet</p>
        <p className="text-[10px] mt-1">Draw arrows on the field and save your breakout.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`
            p-3 rounded-lg border transition-all cursor-pointer group
            ${activePlanId === plan.id
              ? 'border-[#39D353]/50 bg-[#39D353]/5'
              : 'border-[#30363D] bg-[#161B22] hover:border-[#484F58]'}
          `}
          onClick={() => onLoad(plan)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#E6EDF3]">{plan.name}</p>
              <p className="text-[10px] text-[#484F58] mt-0.5">
                {plan.arrows.length} arrow{plan.arrows.length !== 1 ? 's' : ''} &middot;{' '}
                {new Date(plan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(plan.id)
              }}
              className="opacity-0 group-hover:opacity-100 text-[#F85149] hover:text-[#F85149]/80 transition-opacity p-1"
              title="Delete plan"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
              </svg>
            </button>
          </div>
          {plan.notes && (
            <p className="text-[10px] text-[#8B949E] mt-1.5 line-clamp-2">{plan.notes}</p>
          )}
        </div>
      ))}
    </div>
  )
}

/** Scouting notes panel */
function ScoutingPanel({
  notes,
  onSave,
}: {
  notes: ScoutingNote[]
  onSave: (note: ScoutingNote) => void
}) {
  const [teamName, setTeamName] = useState('')
  const [noteText, setNoteText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSave = () => {
    if (!teamName.trim()) return
    const note: ScoutingNote = {
      id: editingId || `scout-${Date.now()}`,
      teamName: teamName.trim(),
      notes: noteText.trim(),
      lastUpdated: new Date().toISOString(),
    }
    onSave(note)
    setTeamName('')
    setNoteText('')
    setEditingId(null)
  }

  const handleEdit = (note: ScoutingNote) => {
    setEditingId(note.id)
    setTeamName(note.teamName)
    setNoteText(note.notes)
  }

  return (
    <div className="space-y-4">
      {/* Input form */}
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
            Opponent Team
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Dynasty, Infamous..."
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-sm text-[#E6EDF3] placeholder-[#484F58] focus:border-[#A371F7] focus:outline-none focus:ring-1 focus:ring-[#A371F7]/30 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
            Notes
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tendencies, breakout patterns, key players, weaknesses..."
            rows={4}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-sm text-[#E6EDF3] placeholder-[#484F58] focus:border-[#A371F7] focus:outline-none focus:ring-1 focus:ring-[#A371F7]/30 transition-colors resize-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!teamName.trim()}
          className="w-full py-2 rounded-md text-xs font-bold tracking-wider uppercase transition-all bg-[#A371F7] text-white hover:bg-[#A371F7]/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {editingId ? 'Update Note' : 'Save Note'}
        </button>
      </div>

      {/* Saved notes */}
      {notes.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-[#484F58] uppercase tracking-wider">Saved Scouting</p>
          {notes.map((n) => (
            <div
              key={n.id}
              onClick={() => handleEdit(n)}
              className="p-3 rounded-lg border border-[#30363D] bg-[#161B22] hover:border-[#A371F7]/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#A371F7]">{n.teamName}</p>
                <span className="text-[9px] text-[#484F58]">
                  {new Date(n.lastUpdated).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-[#8B949E] mt-1 line-clamp-2">{n.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Practice drill card */
function DrillCard({ drill }: { drill: Drill }) {
  return (
    <div className="flex-shrink-0 w-56 p-4 rounded-xl border border-[#30363D] bg-[#161B22] hover:border-[#39D353]/40 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{drill.ppiIcon}</span>
        <span className="text-[9px] font-bold text-[#39D353] bg-[#39D353]/10 px-2 py-0.5 rounded-full">
          {drill.duration}
        </span>
      </div>
      <h4 className="text-sm font-extrabold text-[#E6EDF3] group-hover:text-[#39D353] transition-colors">
        {drill.name}
      </h4>
      <p className="text-[10px] text-[#8B949E] mt-1 leading-relaxed line-clamp-2">
        {drill.description}
      </p>
      <div className="mt-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A371F7]" />
        <span className="text-[9px] font-semibold text-[#A371F7]">{drill.ppiAxis}</span>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LayoutPlannerSection() {
  const state = useAppState()
  const dispatch = useDispatch()

  const { breakoutPlans, scoutingNotes } = state
  const field = DEFAULT_FIELD_LAYOUT
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Drawing state
  const [activePlayer, setActivePlayer] = useState(1)
  const [arrowType, setArrowType] = useState<BreakoutArrow['type']>('primary')
  const [arrows, setArrows] = useState<BreakoutArrow[]>([])
  const [selectedBunker, setSelectedBunker] = useState<string | null>(null)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null)
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [planName, setPlanName] = useState('')
  const [planNotes, setPlanNotes] = useState('')

  // Panel toggles
  const [showScouting, setShowScouting] = useState(false)
  const [showDrills, setShowDrills] = useState(false)
  const [showLibrary, setShowLibrary] = useState(true)

  // Zoom & pan state
  const [scale, setScale] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })

  // Get SVG coordinates from mouse event
  const getSVGPoint = useCallback(
    (e: ReactMouseEvent) => {
      const svgEl = svgRef.current
      if (!svgEl) return null
      const rect = svgEl.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * FIELD_W
      const y = ((e.clientY - rect.top) / rect.height) * FIELD_H
      return svgToPercent(x, y)
    },
    [],
  )

  // Handle bunker click — either start or complete an arrow
  const handleBunkerClick = useCallback(
    (bunker: Bunker) => {
      setSelectedBunker(bunker.id)

      if (!drawStart) {
        // Start drawing from this bunker (or start box area)
        setDrawStart({ x: bunker.x, y: bunker.y })
      } else {
        // Complete the arrow
        const newArrow: BreakoutArrow = {
          playerId: activePlayer,
          from: drawStart,
          to: { x: bunker.x, y: bunker.y },
          type: arrowType,
        }
        setArrows((prev) => [...prev, newArrow])
        setDrawStart(null)
        setDrawEnd(null)
      }
    },
    [drawStart, activePlayer, arrowType],
  )

  // Handle field click for freeform start point (start box area)
  const handleFieldClick = useCallback(
    (e: ReactMouseEvent) => {
      const pt = getSVGPoint(e)
      if (!pt) return

      // If already drawing, place arrow at click point
      if (drawStart) {
        const newArrow: BreakoutArrow = {
          playerId: activePlayer,
          from: drawStart,
          to: pt,
          type: arrowType,
        }
        setArrows((prev) => [...prev, newArrow])
        setDrawStart(null)
        setDrawEnd(null)
        return
      }

      // Start from click point (typically start box)
      setDrawStart(pt)
    },
    [drawStart, activePlayer, arrowType, getSVGPoint],
  )

  const handleFieldMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!drawStart) return
      const pt = getSVGPoint(e)
      if (pt) setDrawEnd(pt)
    },
    [drawStart, getSVGPoint],
  )

  // Save plan
  const handleSavePlan = () => {
    if (!planName.trim() && arrows.length === 0) return
    const plan: BreakoutPlan = {
      id: activePlanId || `plan-${Date.now()}`,
      name: planName.trim() || `Plan ${breakoutPlans.length + 1}`,
      layoutId: field.id,
      arrows,
      notes: planNotes,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'SAVE_BREAKOUT_PLAN', plan })
    setActivePlanId(plan.id)
  }

  // Load plan
  const handleLoadPlan = (plan: BreakoutPlan) => {
    setArrows(plan.arrows)
    setPlanName(plan.name)
    setPlanNotes(plan.notes)
    setActivePlanId(plan.id)
    setDrawStart(null)
    setDrawEnd(null)
  }

  // Clear canvas
  const handleClear = () => {
    setArrows([])
    setDrawStart(null)
    setDrawEnd(null)
    setSelectedBunker(null)
    setActivePlanId(null)
    setPlanName('')
    setPlanNotes('')
  }

  // Undo last arrow
  const handleUndo = () => {
    if (drawStart) {
      setDrawStart(null)
      setDrawEnd(null)
    } else {
      setArrows((prev) => prev.slice(0, -1))
    }
  }

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5))
  const handleResetView = () => {
    setScale(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Pan handlers
  const handlePanStart = (e: ReactMouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning.current = true
      panStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y }
    }
  }

  const handlePanMove = (e: ReactMouseEvent) => {
    if (isPanning.current) {
      setPanOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      })
    }
  }

  const handlePanEnd = () => {
    isPanning.current = false
  }

  // Drawing arrow preview
  const drawingArrow = drawStart && drawEnd ? { from: drawStart, to: drawEnd } : null

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#E6EDF3] tracking-tight">
            LAYOUT PLANNER
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5 font-semibold">
            {field.name} &middot; {field.event}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScouting(!showScouting)}
            className={`
              px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase border transition-all
              ${showScouting
                ? 'border-[#A371F7] text-[#A371F7] bg-[#A371F7]/10'
                : 'border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'}
            `}
          >
            Intel
          </button>
          <button
            onClick={() => setShowDrills(!showDrills)}
            className={`
              px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase border transition-all
              ${showDrills
                ? 'border-[#39D353] text-[#39D353] bg-[#39D353]/10'
                : 'border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3]'}
            `}
          >
            Drills
          </button>
        </div>
      </div>

      {/* Main layout: field + side panels */}
      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Field + drawing tools column */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Drawing toolbar */}
          <div className="p-3 rounded-xl border border-[#30363D] bg-[#161B22] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <PlayerSelector activePlayer={activePlayer} onSelect={setActivePlayer} />
              <ArrowTypeSelector arrowType={arrowType} onSelect={setArrowType} />
            </div>

            {drawStart && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#39D353]/10 border border-[#39D353]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39D353] animate-pulse" />
                <span className="text-[10px] font-bold text-[#39D353] tracking-wide">
                  CLICK A BUNKER OR FIELD POSITION TO COMPLETE ARROW
                </span>
              </div>
            )}
          </div>

          {/* Interactive field */}
          <div className="relative rounded-xl border border-[#30363D] bg-[#0D1117] overflow-hidden">
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button
                onClick={handleZoomIn}
                className="w-7 h-7 rounded bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center text-sm font-bold transition-colors"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 rounded bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center text-sm font-bold transition-colors"
                title="Zoom out"
              >
                −
              </button>
              <button
                onClick={handleResetView}
                className="w-7 h-7 rounded bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] flex items-center justify-center text-[9px] font-bold transition-colors"
                title="Reset view"
              >
                1:1
              </button>
            </div>

            {/* Pan hint */}
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-[9px] text-[#484F58] font-semibold bg-[#0D1117]/80 px-2 py-1 rounded">
                Alt+drag to pan &middot; Click to draw
              </span>
            </div>

            {/* SVG container with zoom/pan */}
            <div
              className="overflow-hidden"
              style={{
                transform: `scale(${scale}) translate(${panOffset.x / scale}px, ${panOffset.y / scale}px)`,
                transformOrigin: 'center center',
                transition: isPanning.current ? 'none' : 'transform 0.15s ease-out',
              }}
              onMouseDown={handlePanStart}
              onMouseMove={(e) => {
                handlePanMove(e)
                handleFieldMouseMove(e)
              }}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              onClick={(e) => {
                if (!isPanning.current) handleFieldClick(e)
              }}
            >
              <FieldSVG
                bunkers={field.bunkers}
                selectedBunkerId={selectedBunker}
                onBunkerClick={handleBunkerClick}
                arrows={arrows}
                drawingArrow={drawingArrow}
                activePlayerId={activePlayer}
              />
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Plan name..."
              className="flex-1 min-w-[140px] bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-sm text-[#E6EDF3] placeholder-[#484F58] focus:border-[#39D353] focus:outline-none focus:ring-1 focus:ring-[#39D353]/30 transition-colors"
            />
            <button
              onClick={handleSavePlan}
              disabled={arrows.length === 0}
              className="px-4 py-2 rounded-md text-xs font-bold tracking-wider uppercase bg-[#39D353] text-[#0D1117] hover:bg-[#39D353]/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Save Plan
            </button>
            <button
              onClick={handleUndo}
              disabled={arrows.length === 0 && !drawStart}
              className="px-3 py-2 rounded-md text-xs font-bold tracking-wider text-[#8B949E] border border-[#30363D] hover:text-[#E6EDF3] hover:border-[#484F58] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Undo
            </button>
            <button
              onClick={handleClear}
              disabled={arrows.length === 0}
              className="px-3 py-2 rounded-md text-xs font-bold tracking-wider text-[#F85149] border border-[#30363D] hover:border-[#F85149]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Clear
            </button>
          </div>

          {/* Plan notes */}
          <textarea
            value={planNotes}
            onChange={(e) => setPlanNotes(e.target.value)}
            placeholder="Breakout notes — timing, reads, adjustments..."
            rows={2}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] placeholder-[#484F58] focus:border-[#39D353] focus:outline-none focus:ring-1 focus:ring-[#39D353]/30 transition-colors resize-none"
          />
        </div>

        {/* Side panels */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
          {/* Breakout Plan Library */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22] overflow-hidden">
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39D353" strokeWidth={2}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
                <span className="text-xs font-extrabold text-[#E6EDF3] uppercase tracking-wider">
                  Playbook
                </span>
                <span className="text-[9px] font-bold text-[#484F58] bg-[#21262D] px-1.5 py-0.5 rounded-full">
                  {breakoutPlans.length}
                </span>
              </div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#484F58"
                strokeWidth={2.5}
                className={`transition-transform ${showLibrary ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showLibrary && (
              <div className="px-4 pb-4">
                <PlanLibrary
                  plans={breakoutPlans}
                  activePlanId={activePlanId}
                  onLoad={handleLoadPlan}
                  onDelete={(planId) => {
                    dispatch({ type: 'DELETE_BREAKOUT_PLAN', planId })
                    if (activePlanId === planId) {
                      handleClear()
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Scouting Notes Panel */}
          {showScouting && (
            <div className="rounded-xl border border-[#A371F7]/30 bg-[#161B22] overflow-hidden animate-slide-in">
              <div className="flex items-center gap-2 p-4 border-b border-[#30363D]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A371F7" strokeWidth={2}>
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                </svg>
                <span className="text-xs font-extrabold text-[#E6EDF3] uppercase tracking-wider">
                  Scouting Intel
                </span>
              </div>
              <div className="p-4">
                <ScoutingPanel
                  notes={scoutingNotes}
                  onSave={(note) => dispatch({ type: 'SAVE_SCOUTING_NOTE', note })}
                />
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4">
            <p className="text-[10px] font-extrabold text-[#484F58] uppercase tracking-wider mb-3">
              Arrow Legend
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0 border-t-2 border-[#58A6FF]" />
                <span className="text-[10px] text-[#8B949E]">Primary route (solid)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0 border-t-2 border-dashed border-[#39D353]" />
                <span className="text-[10px] text-[#8B949E]">Secondary route (dashed)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0 border-t-2 border-dotted border-[#E3B341]" />
                <span className="text-[10px] text-[#8B949E]">Shooting lane (dotted)</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#21262D] space-y-1.5">
              {PLAYER_COLORS.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-[10px] text-[#8B949E]">Player {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practice Drill Selector — Bottom sheet */}
      {showDrills && (
        <div className="rounded-xl border border-[#39D353]/30 bg-[#161B22] overflow-hidden animate-slide-in">
          <div className="flex items-center justify-between p-4 border-b border-[#30363D]">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39D353" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="#39D353" />
              </svg>
              <span className="text-xs font-extrabold text-[#E6EDF3] uppercase tracking-wider">
                Practice Drills
              </span>
            </div>
            <button
              onClick={() => setShowDrills(false)}
              className="text-[#484F58] hover:text-[#8B949E] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 flex gap-3 overflow-x-auto custom-scrollbar pb-2">
            {DRILLS.map((drill) => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
