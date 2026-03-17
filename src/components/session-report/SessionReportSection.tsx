import { useState, useEffect, useMemo } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { DEFAULT_FIELD_LAYOUT } from '../../types/layout'
import { PPI_LABELS, PPI_AXES, type PPIAxis, type PPIScores } from '../../types/ppi'
import { DRILL_LIBRARY, getDrillsForAxis } from '../../types/drill'
import type { SessionData, SessionSummary } from '../../types/session'
import { SpiderChart } from '../ui/SpiderChart'
import { polygonPoints, axisEndpoint, labelPosition } from '../../lib/spider'

// ─── Helpers ────────────────────────────────────────────────

function rollingAverage(summaries: SessionSummary[], field: keyof SessionSummary, count = 10): number {
  const recent = summaries.slice(-count)
  if (recent.length === 0) return 0
  const sum = recent.reduce((acc, s) => acc + (Number(s[field]) || 0), 0)
  return sum / recent.length
}

function delta(current: number, average: number): { diff: number; direction: 'up' | 'down' | 'flat' } {
  const diff = current - average
  if (Math.abs(diff) < 0.5) return { diff: 0, direction: 'flat' }
  return { diff, direction: diff > 0 ? 'up' : 'down' }
}

function deltaColor(dir: 'up' | 'down' | 'flat'): string {
  if (dir === 'up') return '#39D353'
  if (dir === 'down') return '#F85149'
  return '#E3B341'
}

function deltaArrow(dir: 'up' | 'down' | 'flat'): string {
  if (dir === 'up') return '\u2191'
  if (dir === 'down') return '\u2193'
  return '\u2192'
}

function generateSuggestions(
  session: SessionData,
  focusAxis: string,
  verdict: 'improved' | 'flat' | 'declined',
): { icon: string; title: string; body: string; drillId: string; ppiAxis: PPIAxis }[] {
  const suggestions: { icon: string; title: string; body: string; drillId: string; ppiAxis: PPIAxis }[] = []

  // Suggestion based on verdict
  if (verdict === 'declined' || verdict === 'flat') {
    const drills = getDrillsForAxis(focusAxis as PPIAxis)
    if (drills.length > 0) {
      suggestions.push({
        icon: drills[0].icon,
        title: `Double down on ${PPI_LABELS[focusAxis as PPIAxis] || focusAxis}`,
        body: `Your focus area didn't improve this session. Try "${drills[0].name}" to build consistency.`,
        drillId: drills[0].id,
        ppiAxis: focusAxis as PPIAxis,
      })
    }
  }

  // Suggestion based on survival rate
  if (session.survivalRate < 0.4) {
    const moveDrills = getDrillsForAxis('movement')
    if (moveDrills.length > 0) {
      suggestions.push({
        icon: moveDrills[0].icon,
        title: 'Improve Survival Rate',
        body: `You survived only ${Math.round(session.survivalRate * 100)}% of points. Work on breakout movement and slide technique.`,
        drillId: moveDrills[0].id,
        ppiAxis: 'movement',
      })
    }
  }

  // Suggestion based on win rate
  const winRate = session.totalPoints > 0 ? session.wins / session.totalPoints : 0
  if (winRate < 0.5 && session.totalPoints >= 3) {
    const iqDrills = getDrillsForAxis('fieldIQ')
    if (iqDrills.length > 0) {
      suggestions.push({
        icon: iqDrills[0].icon,
        title: 'Boost Your Win Rate',
        body: `Only ${Math.round(winRate * 100)}% win rate today. Review field positioning and lane control.`,
        drillId: iqDrills[0].id,
        ppiAxis: 'fieldIQ',
      })
    }
  }

  // Suggestion for communication if deaths are high
  if (session.deaths > session.totalPoints * 0.6) {
    const commsDrills = getDrillsForAxis('communication')
    if (commsDrills.length > 0 && suggestions.length < 3) {
      suggestions.push({
        icon: commsDrills[0].icon,
        title: 'Better Team Communication',
        body: 'Getting eliminated too often can indicate poor information flow. Practice call-outs.',
        drillId: commsDrills[0].id,
        ppiAxis: 'communication',
      })
    }
  }

  // Fallback: always suggest at least one drill
  if (suggestions.length === 0) {
    const anyDrill = DRILL_LIBRARY[0]
    suggestions.push({
      icon: anyDrill.icon,
      title: 'Keep Practicing',
      body: 'Solid session! Stay sharp by running a quick drill before your next game day.',
      drillId: anyDrill.id,
      ppiAxis: anyDrill.ppiAxis,
    })
  }

  return suggestions.slice(0, 3)
}

// ─── Sub-Components ────────────────────────────────────────

/** 1. Focus-Area Verdict Hero Card */
function FocusVerdictCard({
  focusAxis,
  verdict,
  currentScore,
  averageScore,
}: {
  focusAxis: string
  verdict: 'improved' | 'flat' | 'declined'
  currentScore: number
  averageScore: number
}) {
  const label = PPI_LABELS[focusAxis as PPIAxis] || focusAxis
  const isImproved = verdict === 'improved'
  const verdictClass = isImproved ? 'verdict-improved' : 'verdict-needs-work'
  const glowClass = isImproved ? 'glow-green' : verdict === 'declined' ? 'glow-red' : 'glow-amber'
  const verdictText = isImproved ? 'IMPROVED' : verdict === 'declined' ? 'NEEDS WORK' : 'HOLDING STEADY'
  const arrow = isImproved ? '\u2191' : verdict === 'declined' ? '\u2193' : '\u2192'
  const verdictColor = isImproved ? '#39D353' : verdict === 'declined' ? '#F85149' : '#E3B341'

  return (
    <div className={`${verdictClass} ${glowClass} rounded-xl p-6 md:p-8 animate-fade-in`}>
      <span className="section-header">Today's Focus</span>
      <div className="mt-3 flex items-baseline gap-3 flex-wrap">
        <h1
          className="font-display text-3xl md:text-5xl tracking-tight"
          style={{ color: verdictColor }}
        >
          {label}: {verdictText} {arrow}
        </h1>
      </div>
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div>
          <span className="text-[#8B949E] text-xs uppercase tracking-wider font-semibold">Today</span>
          <div className="font-stat text-xl" style={{ color: verdictColor }}>
            {currentScore.toFixed(1)}
          </div>
        </div>
        <div>
          <span className="text-[#8B949E] text-xs uppercase tracking-wider font-semibold">10-Session Avg</span>
          <div className="font-stat text-xl text-[#8B949E]">{averageScore.toFixed(1)}</div>
        </div>
        <div>
          <span className="text-[#8B949E] text-xs uppercase tracking-wider font-semibold">Delta</span>
          <div className="font-stat text-xl" style={{ color: verdictColor }}>
            {(currentScore - averageScore) >= 0 ? '+' : ''}
            {(currentScore - averageScore).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}

/** 2. Session Stats Card */
function SessionStatsCard({
  session,
  summaries,
}: {
  session: SessionData
  summaries: SessionSummary[]
}) {
  const winRate = session.totalPoints > 0 ? (session.wins / session.totalPoints) * 100 : 0
  const avgWinRate = rollingAverage(summaries, 'winRate')
  const avgElims = rollingAverage(summaries, 'eliminations')
  const avgDeaths = rollingAverage(summaries, 'deaths')
  const avgTotalPts = rollingAverage(summaries, 'totalPoints')

  const stats = [
    {
      label: 'Points Played',
      value: session.totalPoints,
      avg: avgTotalPts,
    },
    {
      label: 'Win / Loss',
      value: winRate,
      avg: avgWinRate,
      format: (v: number) => `${v.toFixed(0)}%`,
    },
    {
      label: 'Eliminations',
      value: session.eliminations,
      avg: avgElims,
    },
    {
      label: 'Times Eliminated',
      value: session.deaths,
      avg: avgDeaths,
      invert: true,
    },
    {
      label: 'Survival Rate',
      value: session.survivalRate * 100,
      avg: summaries.length > 0
        ? summaries.slice(-10).reduce((a, s) => {
            const found = summaries.find(ss => ss.id === s.id)
            return a + (found ? (1 - found.deaths / Math.max(found.totalPoints, 1)) * 100 : 0)
          }, 0) / Math.min(summaries.length, 10)
        : 0,
      format: (v: number) => `${v.toFixed(0)}%`,
    },
    {
      label: 'Paint Pods',
      value: session.points.length > 0 ? session.points.length : 0,
      avg: 0,
      hideCompare: true,
      format: () => '--',
    },
  ]

  return (
    <div className="card-gaming p-5 animate-fade-in">
      <span className="section-header">Session Stats</span>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {stats.map((s) => {
          const d = delta(s.value, s.avg)
          const inverted = s.invert ? { ...d, direction: d.direction === 'up' ? 'down' as const : d.direction === 'down' ? 'up' as const : 'flat' as const } : d
          const color = deltaColor(inverted.direction)
          const arrow = deltaArrow(inverted.direction)
          const displayVal = s.format ? s.format(s.value) : s.value.toFixed(0)

          return (
            <div key={s.label} className="stat-card">
              <div className="stat-card-value font-stat" style={!s.hideCompare ? { color } : undefined}>
                {displayVal}
              </div>
              <div className="stat-card-label">{s.label}</div>
              {!s.hideCompare && summaries.length > 0 && (
                <div className="mt-1 text-xs font-semibold" style={{ color }}>
                  {arrow} {Math.abs(d.diff).toFixed(1)} vs avg
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 3. Elimination Heatmap */
function EliminationHeatmap({
  session,
  selectedDotId,
  onSelectDot,
}: {
  session: SessionData
  selectedDotId: string | null
  onSelectDot: (id: string | null) => void
}) {
  const layout = DEFAULT_FIELD_LAYOUT
  const svgW = 400
  const svgH = 260

  // Compute dot data from points
  const dots = useMemo(() => {
    const bunkerCounts: Record<string, { eliminations: number; survived: number; points: typeof session.points }> = {}

    for (const point of session.points) {
      const bId = point.eliminationBunker || 'unknown'
      if (!bunkerCounts[bId]) bunkerCounts[bId] = { eliminations: 0, survived: 0, points: [] }
      if (point.eliminationType === 'survived') {
        bunkerCounts[bId].survived++
      } else {
        bunkerCounts[bId].eliminations++
      }
      bunkerCounts[bId].points.push(point)
    }

    return Object.entries(bunkerCounts).map(([bunkerId, data]) => {
      const bunker = layout.bunkers.find(b => b.id === bunkerId)
      const x = bunker ? (bunker.x / 100) * svgW : svgW * 0.5
      const y = bunker ? (bunker.y / 100) * svgH : svgH * 0.5
      return { bunkerId, x, y, ...data }
    })
  }, [session.points])

  const selectedDot = dots.find(d => d.bunkerId === selectedDotId)

  return (
    <div className="card-gaming p-5 animate-fade-in">
      <span className="section-header">Elimination Heatmap</span>
      <div className="mt-4 flex justify-center">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full max-w-[500px]"
          style={{ background: '#0D1117', borderRadius: 8 }}
        >
          {/* Field outline */}
          <rect
            x={4} y={4}
            width={svgW - 8} height={svgH - 8}
            rx={6}
            fill="none"
            stroke="#30363D"
            strokeWidth={1}
          />

          {/* Center line */}
          <line
            x1={svgW / 2} y1={4}
            x2={svgW / 2} y2={svgH - 4}
            stroke="#21262D"
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />

          {/* Start box */}
          <rect x={svgW * 0.35} y={svgH - 30} width={svgW * 0.3} height={26} rx={3} fill="#21262D" opacity={0.5} />
          <text x={svgW / 2} y={svgH - 14} textAnchor="middle" fill="#484F58" fontSize={8} fontWeight={600}>
            START BOX
          </text>

          {/* Bunkers */}
          {layout.bunkers.map((b) => {
            const bx = (b.x / 100) * svgW
            const by = (b.y / 100) * svgH
            return (
              <g key={b.id}>
                <rect
                  x={bx - 8} y={by - 5}
                  width={16} height={10}
                  rx={2}
                  className="bunker-neutral"
                  opacity={0.6}
                />
                <text x={bx} y={by + 3} textAnchor="middle" fill="#484F58" fontSize={5} fontWeight={700}>
                  {b.shortName}
                </text>
              </g>
            )
          })}

          {/* Heatmap dots */}
          {dots.map((dot) => {
            const isSelected = dot.bunkerId === selectedDotId
            const hasElims = dot.eliminations > 0
            const hasSurvived = dot.survived > 0
            const total = dot.eliminations + dot.survived

            return (
              <g key={dot.bunkerId}>
                {/* Elimination dot (red) */}
                {hasElims && (
                  <circle
                    cx={dot.x - (hasSurvived ? 5 : 0)}
                    cy={dot.y}
                    r={Math.min(4 + dot.eliminations * 2.5, 14)}
                    fill="#F85149"
                    fillOpacity={0.6}
                    stroke={isSelected ? '#F85149' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                    className="animate-heatmap-dot cursor-pointer"
                    onClick={() => onSelectDot(isSelected ? null : dot.bunkerId)}
                  />
                )}
                {/* Survived dot (green) */}
                {hasSurvived && (
                  <circle
                    cx={dot.x + (hasElims ? 5 : 0)}
                    cy={dot.y}
                    r={Math.min(4 + dot.survived * 2.5, 14)}
                    fill="#39D353"
                    fillOpacity={0.6}
                    stroke={isSelected ? '#39D353' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                    className="animate-heatmap-dot cursor-pointer"
                    onClick={() => onSelectDot(isSelected ? null : dot.bunkerId)}
                  />
                )}
                {/* Count label */}
                {total > 1 && (
                  <text
                    x={dot.x}
                    y={dot.y - Math.min(4 + Math.max(dot.eliminations, dot.survived) * 2.5, 14) - 3}
                    textAnchor="middle"
                    fill="#E6EDF3"
                    fontSize={7}
                    fontWeight={700}
                  >
                    {total}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#F85149', opacity: 0.6 }} />
          <span className="text-[10px] text-[#8B949E]">Eliminated here</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#39D353', opacity: 0.6 }} />
          <span className="text-[10px] text-[#8B949E]">Survived / Kill</span>
        </div>
      </div>

      {/* Tap detail */}
      {selectedDot && (
        <div className="mt-3 panel-inner p-3 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#E6EDF3]">
              {layout.bunkers.find(b => b.id === selectedDot.bunkerId)?.name || 'Unknown'}
            </span>
          </div>
          <div className="flex gap-4 text-xs">
            <span style={{ color: '#F85149' }}>
              {selectedDot.eliminations} elimination{selectedDot.eliminations !== 1 ? 's' : ''}
            </span>
            <span style={{ color: '#39D353' }}>
              {selectedDot.survived} survived
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {selectedDot.points.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-[10px] text-[#8B949E]">
                <span className={p.result === 'win' ? 'text-[#39D353]' : 'text-[#F85149]'}>
                  Pt {p.pointNumber} - {p.result.toUpperCase()}
                </span>
                <span className="text-[#484F58]">{p.eliminationType.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** 4. PPI Update Animation — Spider chart before→after */
function PPIUpdateCard({
  oldScores,
  newScores,
  xpEarned,
  streak,
}: {
  oldScores: PPIScores
  newScores: PPIScores
  xpEarned: number
  streak: number
}) {
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowNew(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const labels = PPI_AXES.map(a => PPI_LABELS[a])
  const oldVals = PPI_AXES.map(a => oldScores[a])
  const newVals = PPI_AXES.map(a => newScores[a])
  const displayVals = showNew ? newVals : oldVals

  // Axes that improved
  const improvedAxes = PPI_AXES.filter(a => newScores[a] > oldScores[a])

  return (
    <div className="card-gaming p-5 glow-purple animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="section-header">PPI Update</span>
        <div className="flex items-center gap-3">
          {/* XP notification */}
          <div className="tag-pill tag-purple animate-count-up font-stat">
            +{xpEarned} XP
          </div>
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 flame-active" viewBox="0 0 24 24" fill="#F0883E">
                <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.02 4-8l1.24 1.21C6.9 9.55 6 11.22 6 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.78-.9-3.45-2.24-4.79L17 7c1.87 1.98 4 4.81 4 8 0 4.42-4.03 8-9 8zm-2-6c0 1.1.9 2 2 2s2-.9 2-2c0-1.5-2-4-2-4s-2 2.5-2 4z" />
              </svg>
              <span className="text-xs font-bold text-[#F0883E]">{streak}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <SpiderChart
          labels={labels}
          values={displayVals}
          compareValues={oldVals}
          color="#A371F7"
          compareColor="#484F58"
          size={280}
          iconLabels={false}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[3px] rounded" style={{ background: '#A371F7' }} />
          <span className="text-[10px] text-[#8B949E]">{showNew ? 'After' : 'Transitioning...'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[3px] rounded" style={{ background: '#484F58' }} />
          <span className="text-[10px] text-[#8B949E]">Before</span>
        </div>
      </div>

      {/* Improved axes callout */}
      {improvedAxes.length > 0 && showNew && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {improvedAxes.map(axis => (
            <span
              key={axis}
              className="tag-pill tag-green animate-pulse-axis"
            >
              {PPI_LABELS[axis]} +{(newScores[axis] - oldScores[axis]).toFixed(1)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** 5. Video Attachment Zone (placeholder) */
function VideoAttachmentZone() {
  const [files, setFiles] = useState<{ name: string; thumb: string }[]>([])

  const handleFakeUpload = () => {
    setFiles(prev => [
      ...prev,
      {
        name: `session-clip-${prev.length + 1}.mp4`,
        thumb: '',
      },
    ])
  }

  return (
    <div className="card-gaming p-5 animate-fade-in">
      <span className="section-header">Video Attachments</span>

      {/* Drop zone */}
      <button
        type="button"
        onClick={handleFakeUpload}
        className="mt-4 w-full border-2 border-dashed border-[#30363D] rounded-lg p-8 flex flex-col items-center justify-center gap-2 transition-colors hover:border-[#A371F7] hover:bg-[#A371F708] cursor-pointer"
      >
        <svg className="w-8 h-8 text-[#484F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm font-semibold text-[#8B949E]">Tap to attach video</span>
        <span className="text-[10px] text-[#484F58]">MP4, MOV up to 500MB</span>
      </button>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="panel-inner p-3 flex items-center gap-3">
              <div className="w-14 h-10 rounded bg-[#21262D] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#484F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#E6EDF3] truncate">{f.name}</div>
                <div className="text-[10px] text-[#484F58]">Placeholder - upload not active</div>
              </div>
              <button
                type="button"
                onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                className="text-[#484F58] hover:text-[#F85149] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** 6. AI-Generated Improvement Suggestions */
function SuggestionCards({
  suggestions,
  onStartDrill,
}: {
  suggestions: { icon: string; title: string; body: string; drillId: string; ppiAxis: PPIAxis }[]
  onStartDrill: (drillId: string) => void
}) {
  return (
    <div className="card-gaming p-5 animate-fade-in">
      <span className="section-header">AI Improvement Suggestions</span>
      <div className="mt-4 space-y-3">
        {suggestions.map((s, i) => {
          const drill = DRILL_LIBRARY.find(d => d.id === s.drillId)
          return (
            <div key={i} className="panel-inner p-4 flex items-start gap-3 border-l-2" style={{ borderColor: '#A371F7' }}>
              <div className="w-10 h-10 rounded-lg bg-[#A371F720] flex items-center justify-center text-lg shrink-0">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#E6EDF3]">{s.title}</h4>
                <p className="text-[11px] text-[#8B949E] mt-1 leading-relaxed">{s.body}</p>
                {drill && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="tag-pill tag-purple text-[10px]">{PPI_LABELS[s.ppiAxis]}</span>
                    <span className="text-[10px] text-[#484F58]">{drill.estimatedMinutes} min</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onStartDrill(s.drillId)}
                className="btn-primary text-xs !py-2 !px-4 !min-h-0 shrink-0"
              >
                Start Drill
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="card-gaming p-10 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#21262D] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#484F58]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <h2 className="font-display text-xl text-[#E6EDF3]">No Session Report Yet</h2>
        <p className="text-sm text-[#8B949E] mt-2 max-w-sm">
          Complete your first session to see your report. Log points during practice or a game, then come back here for your auto-generated analysis.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────

export function SessionReportSection() {
  const state = useAppState()
  const dispatch = useDispatch()
  const [selectedDotId, setSelectedDotId] = useState<string | null>(null)

  // Find most recent completed session
  const latestSession = useMemo(() => {
    const completed = state.sessions.filter(s => s.isComplete)
    return completed.length > 0 ? completed[completed.length - 1] : null
  }, [state.sessions])

  // Find the corresponding summary
  const latestSummary = useMemo(() => {
    if (!latestSession) return null
    return state.sessionSummaries.find(s => s.id === latestSession.id) || null
  }, [latestSession, state.sessionSummaries])

  // Compute focus verdict
  const focusAxis = latestSession?.focusArea || state.todaysFocusAxis
  const verdict: 'improved' | 'flat' | 'declined' = latestSummary?.focusVerdict || 'flat'

  // Compute focus area score for today vs rolling average
  const currentFocusScore = useMemo(() => {
    if (!latestSession) return 0
    // Use average focus rating from points if available
    const ratings = latestSession.points
      .filter(p => p.focusRating !== undefined)
      .map(p => p.focusRating!)
    if (ratings.length > 0) {
      return (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 20 // Scale 1-5 to 0-100
    }
    // Fallback: use win rate as a proxy
    return latestSession.totalPoints > 0
      ? (latestSession.wins / latestSession.totalPoints) * 100
      : 0
  }, [latestSession])

  const averageFocusScore = useMemo(() => {
    const recentSummaries = state.sessionSummaries
      .filter(s => s.focusArea === focusAxis)
      .slice(-10)
    if (recentSummaries.length === 0) return currentFocusScore
    return recentSummaries.reduce((a, s) => a + s.winRate, 0) / recentSummaries.length
  }, [state.sessionSummaries, focusAxis, currentFocusScore])

  // PPI scores: compute "old" from history
  const oldPpiScores: PPIScores = useMemo(() => {
    if (state.ppiHistory.length >= 2) {
      return state.ppiHistory[state.ppiHistory.length - 2].scores
    }
    if (state.ppiHistory.length === 1) {
      return state.ppiHistory[0].scores
    }
    // Default: slightly lower than current
    const result = { ...state.ppiScores }
    for (const axis of PPI_AXES) {
      result[axis] = Math.max(0, result[axis] - Math.random() * 3)
    }
    return result
  }, [state.ppiHistory, state.ppiScores])

  // XP earned
  const xpEarned = latestSummary?.xpEarned || 200

  // Suggestions
  const suggestions = useMemo(() => {
    if (!latestSession) return []
    return generateSuggestions(latestSession, focusAxis, verdict)
  }, [latestSession, focusAxis, verdict])

  // Handle "Start Drill" by navigating to drills section
  const handleStartDrill = (drillId: string) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', section: 'drills' })
  }

  // ─── Empty state ────
  if (!latestSession) {
    return <EmptyState />
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-white">Post-Session Report</h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            {latestSession.date} &middot; {latestSession.type} &middot; {latestSession.totalPoints} points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="level-badge">Lvl {state.challengesState.level}</span>
          {state.trainingStreak > 0 && (
            <div className="flex items-center gap-1 tag-pill tag-orange">
              <svg className="w-3.5 h-3.5 flame-active" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.02 4-8l1.24 1.21C6.9 9.55 6 11.22 6 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.78-.9-3.45-2.24-4.79L17 7c1.87 1.98 4 4.81 4 8 0 4.42-4.03 8-9 8zm-2-6c0 1.1.9 2 2 2s2-.9 2-2c0-1.5-2-4-2-4s-2 2.5-2 4z" />
              </svg>
              {state.trainingStreak} day streak
            </div>
          )}
        </div>
      </div>

      {/* 1. Focus-Area Verdict (Hero) */}
      <FocusVerdictCard
        focusAxis={focusAxis}
        verdict={verdict}
        currentScore={currentFocusScore}
        averageScore={averageFocusScore}
      />

      {/* 2. Session Stats */}
      <SessionStatsCard
        session={latestSession}
        summaries={state.sessionSummaries}
      />

      {/* 3. Elimination Heatmap */}
      <EliminationHeatmap
        session={latestSession}
        selectedDotId={selectedDotId}
        onSelectDot={setSelectedDotId}
      />

      {/* 4. PPI Update Animation */}
      <PPIUpdateCard
        oldScores={oldPpiScores}
        newScores={state.ppiScores}
        xpEarned={xpEarned}
        streak={state.trainingStreak}
      />

      {/* 5. Video Attachment Zone */}
      <VideoAttachmentZone />

      {/* 6. AI Suggestions */}
      <SuggestionCards
        suggestions={suggestions}
        onStartDrill={handleStartDrill}
      />
    </div>
  )
}
