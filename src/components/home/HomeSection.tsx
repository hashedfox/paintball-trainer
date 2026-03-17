import { useState, useEffect, useRef, useMemo } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { OnboardingQuiz } from './OnboardingQuiz'
import { polygonPoints, axisEndpoint, labelPosition } from '../../lib/spider'
import { PPI_AXES, PPI_LABELS, type PPIAxis, getCompositeScore, getIdealShape, getWeightedCompositeScore, getDivisionFromPPI, getPositionWeakestAxis, getDivisionPercentile } from '../../types/ppi'
import { getPositionRole, type PositionRole } from '../../types/player'
import { xpForLevel } from '../../types/challenges'
import { getReadinessLabel, getReadinessColor, isInTaperWindow, getDaysUntilEvent } from '../../types/readiness'

/* ─────────────────────── AXIS SVG ICON PATHS ─────────────────────── */
const AXIS_ICONS: Record<string, React.ReactNode> = {
  snapShooting: ( // crosshair
    <g stroke="currentColor" strokeWidth="1.5" fill="none">
      <circle cx="8" cy="8" r="5" /><circle cx="8" cy="8" r="2" />
      <line x1="8" y1="0" x2="8" y2="3" /><line x1="8" y1="13" x2="8" y2="16" />
      <line x1="0" y1="8" x2="3" y2="8" /><line x1="13" y1="8" x2="16" y2="8" />
    </g>
  ),
  movement: ( // running figure
    <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="3" r="2" />
      <path d="M4 14l3-3 2 2 4-4 3 1" /><path d="M13 10v4h3" />
    </g>
  ),
  fieldIQ: ( // brain
    <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
      <path d="M8 15c-3 0-5-2.2-5-5a5 5 0 0110 0c0 2.8-2 5-5 5z" />
      <path d="M8 5v4M6 8h4" />
    </g>
  ),
  communication: ( // speech bubble
    <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
      <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V4a1 1 0 011-1z" />
      <line x1="5" y1="6" x2="11" y2="6" /><line x1="5" y1="9" x2="9" y2="9" />
    </g>
  ),
  gunSkills: ( // target
    <g stroke="currentColor" strokeWidth="1.5" fill="none">
      <circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="3" /><circle cx="8" cy="8" r="0.8" fill="currentColor" />
    </g>
  ),
  fitness: ( // heart-rate
    <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h3l2-4 3 8 2-4h4" />
    </g>
  ),
}

/* ─────────────────────── FOCUS REASONS ─────────────────────── */
const FOCUS_REASONS: Record<string, string> = {
  snapShooting: 'Your snap shooting needs the most work -- faster target acquisition will win more gunfights.',
  movement: 'Your movement score is lagging -- smoother transitions and faster breakouts will change games.',
  fieldIQ: 'Field IQ is your weakest axis -- better reads mean fewer trades and smarter pushes.',
  communication: 'Communication is holding you back -- calling out positions will elevate your whole team.',
  gunSkills: 'Gun skills need a boost -- tighter lanes and off-hand reps will lock down more kills.',
  fitness: 'Your fitness score is low -- better conditioning means faster recovery between points.',
  mentalGame: 'Mental game is your biggest gap -- composure under pressure separates good from great players.',
}

/* ─────────────────────── MENTAL GAME ICON ─────────────────────── */
const MENTAL_GAME_ICON = (
  <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
    <circle cx="8" cy="6" r="4" />
    <path d="M4 14c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <path d="M6 4.5l4 3M10 4.5l-4 3" />
  </g>
)

/* ─────────────────────── SESSION TYPE COLORS ─────────────────────── */
const SESSION_TYPE_STYLES: Record<string, string> = {
  practice: 'bg-[#2DD4A8]/15 text-[#2DD4A8] border-[#2DD4A8]/30',
  scrimmage: 'bg-[#7C5BF0]/15 text-[#7C5BF0] border-[#7C5BF0]/30',
  tournament: 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30',
}

const VERDICT_COLORS: Record<string, string> = {
  improved: 'bg-[#2DD4A8]',
  flat: 'bg-[#D4A843]',
  declined: 'bg-[#EF4444]',
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════ */

export function HomeSection() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { onboarding } = state
  const [showQuiz, setShowQuiz] = useState(!onboarding.completed)

  if (showQuiz && !onboarding.completed) {
    return <OnboardingQuiz onComplete={() => setShowQuiz(false)} />
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Tournament Countdown (if applicable) */}
      <TournamentCountdown />

      {/* Readiness Score Widget */}
      <ReadinessWidget />

      {/* PPI Spider Chart (Hero) */}
      <PPISpiderHero />

      {/* Season Timeline */}
      <SeasonTimeline />

      {/* Today's Focus Card */}
      <TodaysFocusCard />

      {/* Practice Streak + XP Bar */}
      <StreakXPBar />

      {/* Recent Sessions Feed */}
      <RecentSessionsFeed />

      {/* Quick-Start Buttons */}
      <QuickStartButtons />

      {/* Retake quiz link */}
      {onboarding.completed && (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_ONBOARDING', data: { completed: false } })
            setShowQuiz(true)
          }}
          className="text-[10px] text-[#64748B] hover:text-[#94A3B8] transition-colors block mx-auto"
        >
          Retake onboarding quiz
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  1. PPI SPIDER CHART HERO                                         */
/* ═══════════════════════════════════════════════════════════════════ */

function PPISpiderHero() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { ppiScores, ppiHistory, ppiEstimated, profile, onboarding } = state
  const svgRef = useRef<SVGSVGElement>(null)
  const [animProgress, setAnimProgress] = useState(0)
  const [viewAsRole, setViewAsRole] = useState<PositionRole | null>(null)

  useEffect(() => {
    let raf: number
    let start: number | null = null
    const duration = 800
    const step = (ts: number) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setAnimProgress(ease)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const cx = 160
  const cy = 160
  const r = 110
  const total = PPI_AXES.length

  // Position role for weighting
  const primaryRole = getPositionRole(onboarding.primaryPosition || (profile.position as any) || 'centre')
  const activeRole = viewAsRole || primaryRole
  const division = profile.division || getDivisionFromPPI(getCompositeScore(ppiScores))

  // Ideal shape for the current position
  const idealShape = useMemo(() => getIdealShape(activeRole, division), [activeRole, division])
  const idealValues = PPI_AXES.map(axis => (idealShape[axis] / 100) * animProgress)

  const currentValues = PPI_AXES.map(axis => (ppiScores[axis] / 100) * animProgress)

  const thirtyDaysAgo = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const old = ppiHistory
      .filter(h => new Date(h.date) <= cutoff)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return old.length > 0 ? old[0].scores : null
  }, [ppiHistory])

  const oldValues = thirtyDaysAgo
    ? PPI_AXES.map(axis => (thirtyDaysAgo[axis] / 100) * animProgress)
    : null

  const weightedComposite = getWeightedCompositeScore(ppiScores, activeRole)

  // Secondary positions for toggle
  const secondaryPositions = (onboarding.secondaryPositions || profile.secondaryPositions || []) as any[]
  const hasMultiplePositions = secondaryPositions.length > 0

  const rings = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] overflow-hidden relative animate-slide-up">
      {/* Gradient top accent */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(135deg, #7C5BF0 0%, #4A7BF7 50%, #2DD4A8 100%)' }} />

      <div className="p-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F1F5F9] tracking-wide uppercase">
            {profile.name || 'Player'} PPI
          </h2>
          <p className="text-[#94A3B8] text-xs">
            {ppiEstimated ? 'Estimated from profile' : 'Based on session data'}
            {' '}&middot;{' '}{division}
          </p>
        </div>
        <div className="text-right">
          <div className="font-stat text-3xl md:text-4xl font-bold text-[#2DD4A8] leading-none">{weightedComposite}</div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mt-1">
            {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Weighted
          </div>
        </div>
      </div>

      {/* Position toggle (multi-position support) */}
      {hasMultiplePositions && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setViewAsRole(null)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              !viewAsRole
                ? 'bg-[#7C5BF0]/20 text-[#7C5BF0] border border-[#7C5BF0]/40'
                : 'bg-[#2A3050] text-[#94A3B8] border border-transparent'
            }`}
          >
            {primaryRole}
          </button>
          {secondaryPositions.map((pos: any) => {
            const role = getPositionRole(pos)
            return (
              <button
                key={pos}
                onClick={() => setViewAsRole(role)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  viewAsRole === role
                    ? 'bg-[#4A7BF7]/20 text-[#4A7BF7] border border-[#4A7BF7]/40'
                    : 'bg-[#2A3050] text-[#94A3B8] border border-transparent'
                }`}
              >
                {role}
              </button>
            )
          })}
        </div>
      )}

      {/* SVG Spider Chart */}
      <div className="flex justify-center px-4 pb-4" style={{ minHeight: '50vh' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          className="w-full max-w-[400px]"
          style={{ filter: 'drop-shadow(0 0 20px rgba(124,91,240,0.15))' }}
        >
          {/* Grid rings */}
          {rings.map(pct => (
            <polygon
              key={pct}
              points={polygonPoints(Array(total).fill(pct), cx, cy, r)}
              fill="none"
              stroke="rgba(148,163,184,0.08)"
              strokeWidth={pct === 1 ? 1.2 : 0.6}
              opacity={pct === 1 ? 0.8 : 0.4}
            />
          ))}

          {/* Axis lines */}
          {PPI_AXES.map((_, i) => {
            const ep = axisEndpoint(i, total, cx, cy, r)
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={ep.x}
                y2={ep.y}
                stroke="rgba(148,163,184,0.08)"
                strokeWidth={0.6}
                opacity={0.5}
              />
            )
          })}

          {/* Ideal shape (faded target zone) — position-specific */}
          <polygon
            points={polygonPoints(idealValues, cx, cy, r)}
            fill="rgba(45,212,168,0.06)"
            stroke="#2DD4A8"
            strokeWidth={1.2}
            strokeDasharray="4 3"
            opacity={0.4}
            strokeLinejoin="round"
          />

          {/* 30-day-ago polygon (dashed, behind) */}
          {oldValues && (
            <polygon
              points={polygonPoints(oldValues, cx, cy, r)}
              fill="none"
              stroke="#64748B"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.6}
            />
          )}

          {/* Current polygon (filled purple) */}
          <polygon
            points={polygonPoints(currentValues, cx, cy, r)}
            fill="rgba(124,91,240,0.18)"
            stroke="#7C5BF0"
            strokeWidth={2}
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Data points */}
          {PPI_AXES.map((axis, i) => {
            const val = currentValues[i]
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2
            const px = cx + r * val * Math.cos(angle)
            const py = cy + r * val * Math.sin(angle)
            // Highlight axes with gap vs ideal
            const gap = idealShape[axis] - ppiScores[axis]
            const hasGap = gap > 10
            return (
              <circle
                key={axis}
                cx={px}
                cy={py}
                r={hasGap ? 5 : 4}
                fill={hasGap ? '#EF4444' : '#7C5BF0'}
                stroke="#1A1F35"
                strokeWidth={2}
                className="cursor-pointer"
              />
            )
          })}

          {/* Axis labels + icons + percentile badges */}
          {PPI_AXES.map((axis, i) => {
            const lp = labelPosition(i, total, cx, cy, r)
            const ep = axisEndpoint(i, total, cx, cy, r)
            const percentile = onboarding.benchmarkOptIn ? getDivisionPercentile(ppiScores[axis], division, axis) : null
            const icon = axis === 'mentalGame' ? MENTAL_GAME_ICON : AXIS_ICONS[axis]
            return (
              <g
                key={axis}
                className="cursor-pointer"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: 'drills' })}
              >
                <g transform={`translate(${ep.x - 8}, ${ep.y - 8})`} className="text-[#94A3B8]" opacity={0.7}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    {icon}
                  </svg>
                </g>
                <text
                  x={lp.x}
                  y={lp.y + 12}
                  textAnchor={lp.anchor}
                  className="fill-[#94A3B8] uppercase tracking-wider"
                  style={{ fontSize: '8px', fontWeight: 600 }}
                >
                  {PPI_LABELS[axis]}
                </text>
                <text
                  x={lp.x}
                  y={lp.y + 23}
                  textAnchor={lp.anchor}
                  className="fill-[#F1F5F9] font-stat font-bold"
                  style={{ fontSize: '11px' }}
                >
                  {ppiScores[axis]}
                </text>
                {/* Percentile badge */}
                {percentile !== null && (
                  <text
                    x={lp.x}
                    y={lp.y + 33}
                    textAnchor={lp.anchor}
                    fill="#4A7BF7"
                    style={{ fontSize: '7px', fontWeight: 700 }}
                  >
                    Top {100 - percentile}%
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] rounded bg-[#7C5BF0]" />
          <span className="text-[9px] text-[#94A3B8]">Your PPI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] rounded border-t border-dashed border-[#2DD4A8]" />
          <span className="text-[9px] text-[#94A3B8]">Ideal ({activeRole})</span>
        </div>
        {oldValues && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] rounded border-t border-dashed border-[#64748B]" />
            <span className="text-[9px] text-[#94A3B8]">30 days ago</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  2. SEASON TIMELINE                                               */
/* ═══════════════════════════════════════════════════════════════════ */

function SeasonTimeline() {
  const state = useAppState()
  const { sessionSummaries, ppiHistory } = state
  const scrollRef = useRef<HTMLDivElement>(null)

  const days = useMemo(() => {
    const now = new Date()
    const result: { date: string; sessions: typeof sessionSummaries; ppi: number | null }[] = []
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const daySessions = sessionSummaries.filter(s => s.date === dateStr)
      const dayPpi = ppiHistory.find(h => h.date === dateStr)
      result.push({
        date: dateStr,
        sessions: daySessions,
        ppi: dayPpi ? getCompositeScore(dayPpi.scores) : null,
      })
    }
    return result
  }, [sessionSummaries, ppiHistory])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4 animate-slide-up stagger-2">
      <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider mb-3">
        Season Timeline
      </h3>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {days.map(day => {
          const hasTournament = day.sessions.some(s => s.type === 'tournament')
          const hasPractice = day.sessions.length > 0
          const avgWr = day.sessions.length > 0
            ? day.sessions.reduce((a, s) => a + s.winRate, 0) / day.sessions.length
            : -1

          let dotColor = 'bg-[#2A3050]'
          if (hasTournament) dotColor = 'bg-[#D4A843]'
          else if (avgWr >= 0.6) dotColor = 'bg-[#2DD4A8]'
          else if (avgWr >= 0.4) dotColor = 'bg-[#D4A843]'
          else if (avgWr >= 0) dotColor = 'bg-[#EF4444]'

          const isToday = day.date === new Date().toISOString().split('T')[0]

          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 min-w-[12px]"
              title={`${day.date}${hasPractice ? ` - ${day.sessions.length} session(s)` : ''}`}
            >
              {hasTournament && (
                <div className="text-[#D4A843] text-[8px] leading-none">&#9873;</div>
              )}
              <div
                className={`w-2.5 h-2.5 rounded-full ${dotColor} ${
                  isToday ? 'ring-2 ring-[#4A7BF7] ring-offset-1 ring-offset-[#1A1F35]' : ''
                }`}
              />
              {new Date(day.date).getDay() === 0 && (
                <span className="text-[7px] text-[#64748B]">
                  {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {ppiHistory.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-semibold">PPI Trend</span>
          <div className="flex-1 h-px bg-white/[0.08] relative">
            <div className="absolute left-0 top-0 h-px bg-[#7C5BF0]" style={{ width: '100%' }} />
          </div>
          <span className="font-stat text-xs text-[#7C5BF0] font-bold">
            {ppiHistory.length > 0 ? getCompositeScore(ppiHistory[ppiHistory.length - 1].scores) : '--'}
          </span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  3. TODAY'S FOCUS CARD                                            */
/* ═══════════════════════════════════════════════════════════════════ */

function TodaysFocusCard() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { ppiScores, todaysFocusAxis, onboarding, profile } = state

  const role = getPositionRole(onboarding.primaryPosition || (profile.position as any) || 'centre')
  const weakest = getPositionWeakestAxis(ppiScores, role)
  const focusAxis = (todaysFocusAxis || weakest) as PPIAxis
  const reason = FOCUS_REASONS[focusAxis] || 'Focus on your weakest skill to level up fastest.'

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] overflow-hidden animate-slide-up stagger-3">
      {/* Gradient top accent */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(135deg, #7C5BF0 0%, #4A7BF7 50%, #2DD4A8 100%)' }} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div className="w-12 h-12 rounded-full bg-[#4A7BF7]/12 flex items-center justify-center text-[#4A7BF7] shrink-0">
            <svg width="24" height="24" viewBox="0 0 16 16">
              {AXIS_ICONS[focusAxis] || AXIS_ICONS.snapShooting}
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-[#F1F5F9] uppercase tracking-wide">
                Today&apos;s Focus
              </h3>
              <span className="tag-pill tag-blue">
                {PPI_LABELS[focusAxis]}
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">{reason}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold tracking-wider">Current score:</span>
              <span className="font-stat text-sm font-bold text-[#7C5BF0]">{ppiScores[focusAxis]}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: 'drills' })}
          className="btn-primary w-full mt-4"
        >
          Start Drill
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  4. PRACTICE STREAK + XP BAR                                      */
/* ═══════════════════════════════════════════════════════════════════ */

function StreakXPBar() {
  const state = useAppState()
  const { trainingStreak, challengesState } = state
  const { xp, level, activeChallenges } = challengesState

  const xpNeeded = xpForLevel(level)
  let totalForLevel = 0
  for (let l = 1; l < level; l++) totalForLevel += xpForLevel(l)
  const xpInLevel = xp - totalForLevel
  const pct = Math.min((xpInLevel / xpNeeded) * 100, 100)

  const dailyChallenge = activeChallenges.find(c => c.type === 'daily' && !c.completed)

  const isStreakActive = trainingStreak > 0

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4 animate-slide-up stagger-4">
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-2xl ${isStreakActive ? 'flame-active' : 'opacity-40'}`} role="img" aria-label="streak">
            &#128293;
          </span>
          <div>
            <div className="font-stat text-xl font-bold text-[#F1F5F9] leading-none">{trainingStreak}</div>
            <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-semibold">day streak</div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/[0.08]" />

        {/* XP Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              Level {level}
            </span>
            <span className="font-stat text-[10px] text-[#94A3B8]">
              {xpInLevel}/{xpNeeded} XP
            </span>
          </div>
          <div className="xp-bar-track">
            <div
              className="xp-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily challenge text */}
      {dailyChallenge && (
        <div className="mt-3 flex items-center gap-2 bg-[#2A3050] rounded-lg px-3 py-2">
          <span className="text-sm">{dailyChallenge.icon}</span>
          <span className="text-[11px] text-[#94A3B8] flex-1">{dailyChallenge.title}</span>
          <span className="font-stat text-[10px] text-[#D4A843] font-bold">+{dailyChallenge.xpReward} XP</span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  5. RECENT SESSIONS FEED                                          */
/* ═══════════════════════════════════════════════════════════════════ */

function RecentSessionsFeed() {
  const state = useAppState()
  const { sessionSummaries } = state

  const recent = useMemo(
    () => [...sessionSummaries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [sessionSummaries],
  )

  if (recent.length === 0) {
    return (
      <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-5 text-center animate-slide-up stagger-5">
        <p className="text-[#64748B] text-sm">No sessions yet. Log your first game to see data here.</p>
        <p className="text-[#94A3B8] text-xs mt-2">Use the session logger to track your games and unlock analytics.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4 animate-slide-up stagger-5">
      <h3 className="text-sm font-bold text-[#F1F5F9] uppercase tracking-wider mb-3">
        Recent Sessions
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {recent.map(session => (
          <div
            key={session.id}
            className="min-w-[200px] bg-[#2A3050] rounded-xl border border-white/[0.08] p-3 shrink-0 hover:bg-[#222842] hover:border-[#4A7BF7]/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-stat text-[11px] text-[#94A3B8]">{session.date}</span>
              <span className={`tag-pill ${SESSION_TYPE_STYLES[session.type]}`}>
                {session.type}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <div>
                <span className="font-stat text-lg font-bold text-[#F1F5F9]">{session.totalPoints}</span>
                <span className="text-[9px] text-[#64748B] ml-1 uppercase font-semibold">pts</span>
              </div>
              <div>
                <span className="font-stat text-lg font-bold text-[#F1F5F9]">
                  {Math.round(session.winRate * 100)}%
                </span>
                <span className="text-[9px] text-[#64748B] ml-1 uppercase font-semibold">W/L</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${VERDICT_COLORS[session.focusVerdict] || 'bg-[#64748B]'}`} />
              <span className="text-[10px] text-[#94A3B8]">
                {PPI_LABELS[session.focusArea as PPIAxis] || session.focusArea}
              </span>
              {/* Quality rating badge */}
              {session.qualityRating && session.qualityRating > 0 && (
                <span className="text-[10px] text-[#D4A843]">
                  {'★'.repeat(session.qualityRating)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  6a. READINESS SCORE WIDGET                                       */
/* ═══════════════════════════════════════════════════════════════════ */

function ReadinessWidget() {
  const state = useAppState()
  const dispatch = useDispatch()
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = state.readinessHistory.find(r => r.date === today)
  const [sliderValue, setSliderValue] = useState(todayEntry?.score || 0)
  const [submitted, setSubmitted] = useState(!!todayEntry)

  const handleSubmit = () => {
    if (sliderValue === 0) return
    dispatch({
      type: 'LOG_READINESS',
      entry: { date: today, score: sliderValue, timestamp: Date.now() },
    })
    setSubmitted(true)
  }

  // Show recent trend
  const recentReadiness = state.readinessHistory.slice(-7)
  const avgReadiness = recentReadiness.length > 0
    ? Math.round(recentReadiness.reduce((s, r) => s + r.score, 0) / recentReadiness.length)
    : 0

  if (submitted && todayEntry) {
    const score = todayEntry.score
    return (
      <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4 animate-slide-up">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold font-stat"
            style={{
              background: `${getReadinessColor(score)}15`,
              color: getReadinessColor(score),
              border: `2px solid ${getReadinessColor(score)}40`,
            }}
          >
            {score}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
              Today&apos;s Readiness
            </div>
            <div className="text-sm font-bold" style={{ color: getReadinessColor(score) }}>
              {getReadinessLabel(score)}
            </div>
          </div>
          {recentReadiness.length > 2 && (
            <div className="text-right">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">7-Day Avg</div>
              <div className="font-stat text-sm font-bold" style={{ color: getReadinessColor(avgReadiness) }}>
                {avgReadiness}/10
              </div>
            </div>
          )}
        </div>
        {/* Mini trend bars */}
        {recentReadiness.length > 2 && (
          <div className="flex gap-1 mt-3 items-end h-6">
            {recentReadiness.map((r, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${(r.score / 10) * 100}%`,
                  background: getReadinessColor(r.score),
                  opacity: i === recentReadiness.length - 1 ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-[#F1F5F9]">How does your body feel today?</div>
          <div className="text-[10px] text-[#64748B]">Quick daily check-in (2 seconds)</div>
        </div>
        {sliderValue > 0 && (
          <div className="font-stat text-2xl font-bold" style={{ color: getReadinessColor(sliderValue) }}>
            {sliderValue}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] text-[#EF4444] font-semibold">Wrecked</span>
        <input
          type="range"
          min="1"
          max="10"
          value={sliderValue || 5}
          onChange={e => setSliderValue(parseInt(e.target.value))}
          className="flex-1 accent-[#2DD4A8]"
        />
        <span className="text-[9px] text-[#2DD4A8] font-semibold">Explosive</span>
      </div>
      <button
        onClick={handleSubmit}
        className="btn-primary w-full mt-3 !py-2 text-xs"
        disabled={sliderValue === 0}
      >
        Log Readiness
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  6b. TOURNAMENT COUNTDOWN                                         */
/* ═══════════════════════════════════════════════════════════════════ */

function TournamentCountdown() {
  const state = useAppState()

  // Find the nearest upcoming tournament
  const nextTournament = useMemo(() => {
    const now = new Date().toISOString().split('T')[0]
    return state.upcomingTournaments
      .filter(t => t.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null
  }, [state.upcomingTournaments])

  if (!nextTournament) return null

  const daysUntil = getDaysUntilEvent(nextTournament.date)
  const inTaper = isInTaperWindow(nextTournament.date)

  if (daysUntil > 30) return null

  return (
    <div className={`rounded-xl border p-4 animate-slide-up ${
      inTaper
        ? 'bg-[#D4A843]/10 border-[#D4A843]/30'
        : 'bg-[#1A1F35] border-white/[0.08]'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          inTaper ? 'bg-[#D4A843]/20' : 'bg-[#4A7BF7]/15'
        }`}>
          {inTaper ? '\u23F3' : '\uD83C\uDFC6'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#F1F5F9]">{nextTournament.name}</div>
          <div className="text-[10px] text-[#94A3B8]">
            {nextTournament.league} &middot; {nextTournament.date}
          </div>
        </div>
        <div className="text-right">
          <div className="font-stat text-xl font-bold" style={{ color: inTaper ? '#D4A843' : '#4A7BF7' }}>
            {daysUntil}
          </div>
          <div className="text-[9px] text-[#64748B] uppercase font-semibold">days</div>
        </div>
      </div>
      {inTaper && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
          <span className="text-[10px] text-[#D4A843] font-semibold">
            Taper Mode — Focus on rest, visualization, and layout study. Reduce intensity.
          </span>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  7. QUICK-START BUTTONS                                           */
/* ═══════════════════════════════════════════════════════════════════ */

function QuickStartButtons() {
  const dispatch = useDispatch()

  const buttons = [
    {
      label: 'Log Session',
      section: 'session-logger',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      accent: 'border-[#4A7BF7]/20 hover:border-[#4A7BF7]/50',
      textColor: 'text-[#4A7BF7]',
      bgHover: 'hover:bg-[#4A7BF7]/10',
    },
    {
      label: 'Start Drill',
      section: 'drills',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: 'border-[#2DD4A8]/20 hover:border-[#2DD4A8]/50',
      textColor: 'text-[#2DD4A8]',
      bgHover: 'hover:bg-[#2DD4A8]/10',
    },
    {
      label: 'Plan Breakout',
      section: 'layout-planner',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      accent: 'border-[#7C5BF0]/20 hover:border-[#7C5BF0]/50',
      textColor: 'text-[#7C5BF0]',
      bgHover: 'hover:bg-[#7C5BF0]/10',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 animate-slide-up stagger-6">
      {buttons.map(btn => (
        <button
          key={btn.section}
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: btn.section })}
          className={`bg-[#1A1F35] ${btn.accent} ${btn.bgHover} border rounded-xl p-4 flex flex-col items-center gap-2 hover:translate-y-[-2px] active:scale-[0.97] transition-all`}
        >
          <div className={btn.textColor}>{btn.icon}</div>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${btn.textColor}`}>
            {btn.label}
          </span>
        </button>
      ))}
    </div>
  )
}
