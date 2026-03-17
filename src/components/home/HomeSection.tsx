import { useState, useEffect, useRef, useMemo } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { OnboardingQuiz } from './OnboardingQuiz'
import { polygonPoints, axisEndpoint, labelPosition } from '../../lib/spider'
import { PPI_AXES, PPI_LABELS, type PPIAxis, getCompositeScore, getWeakestAxis } from '../../types/ppi'
import { xpForLevel } from '../../types/challenges'

/* ─────────────────────── AXIS SVG ICON PATHS ─────────────────────── */
const AXIS_ICONS: Record<string, JSX.Element> = {
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
}

/* ─────────────────────── SESSION TYPE COLORS ─────────────────────── */
const SESSION_TYPE_STYLES: Record<string, string> = {
  practice: 'bg-pb-green/15 text-pb-green border-pb-green/30',
  scrimmage: 'bg-pb-purple/15 text-pb-purple border-pb-purple/30',
  tournament: 'bg-pb-amber/15 text-pb-amber border-pb-amber/30',
}

const VERDICT_COLORS: Record<string, string> = {
  improved: 'bg-pb-green',
  flat: 'bg-pb-amber',
  declined: 'bg-pb-red',
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
    <div className="min-h-screen bg-[#0D1117] p-4 md:p-6 space-y-5 animate-fade-in">
      {/* ── PPI Spider Chart (Hero) ── */}
      <PPISpiderHero />

      {/* ── Season Timeline ── */}
      <SeasonTimeline />

      {/* ── Today's Focus Card ── */}
      <TodaysFocusCard />

      {/* ── Practice Streak + XP Bar ── */}
      <StreakXPBar />

      {/* ── Recent Sessions Feed ── */}
      <RecentSessionsFeed />

      {/* ── Quick-Start Buttons ── */}
      <QuickStartButtons />

      {/* Retake quiz link */}
      {onboarding.completed && (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'SET_ONBOARDING', data: { completed: false } })
            setShowQuiz(true)
          }}
          className="text-[10px] text-pb-text-muted hover:text-pb-text-dim transition-colors block mx-auto"
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
  const { ppiScores, ppiHistory, ppiEstimated, profile } = state
  const svgRef = useRef<SVGSVGElement>(null)
  const [animProgress, setAnimProgress] = useState(0)

  // On-load animation: polygon draws from center outward
  useEffect(() => {
    let raf: number
    let start: number | null = null
    const duration = 800
    const step = (ts: number) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      // easeOutCubic
      const ease = 1 - Math.pow(1 - t, 3)
      setAnimProgress(ease)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const cx = 160
  const cy = 160
  const r = 120
  const total = PPI_AXES.length

  // Normalize scores 0-1 and apply animation
  const currentValues = PPI_AXES.map(axis => (ppiScores[axis] / 100) * animProgress)

  // 30-day-ago scores
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

  const composite = getCompositeScore(ppiScores)

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0]

  return (
    <div className="bg-[#161B22] rounded-xl border border-pb-border overflow-hidden relative">
      {/* Gradient top edge */}
      <div className="h-1 bg-gradient-to-r from-pb-purple via-pb-green to-pb-purple" />

      <div className="p-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-pb-text tracking-wide uppercase">
            {profile.name || 'Player'} PPI
          </h2>
          <p className="text-pb-text-dim text-xs">
            {ppiEstimated ? 'Estimated from profile' : 'Based on session data'}
            {' '}&middot;{' '}{profile.division}
          </p>
        </div>
        <div className="text-right">
          <div className="font-stat text-3xl md:text-4xl font-bold text-pb-green leading-none">{composite}</div>
          <div className="text-[10px] text-pb-text-muted uppercase tracking-wider">Composite</div>
        </div>
      </div>

      {/* SVG Spider Chart — fills ~50vh */}
      <div className="flex justify-center px-4 pb-4" style={{ minHeight: '50vh' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          className="w-full max-w-[400px]"
          style={{ filter: 'drop-shadow(0 0 20px rgba(163,113,247,0.15))' }}
        >
          {/* Grid rings */}
          {rings.map(pct => (
            <polygon
              key={pct}
              points={polygonPoints(Array(total).fill(pct), cx, cy, r)}
              fill="none"
              stroke="#30363D"
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
                stroke="#30363D"
                strokeWidth={0.6}
                opacity={0.5}
              />
            )
          })}

          {/* 30-day-ago polygon (dashed, behind) */}
          {oldValues && (
            <polygon
              points={polygonPoints(oldValues, cx, cy, r)}
              fill="none"
              stroke="#484F58"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={0.6}
            />
          )}

          {/* Current polygon (filled purple) */}
          <polygon
            points={polygonPoints(currentValues, cx, cy, r)}
            fill="rgba(163,113,247,0.18)"
            stroke="#A371F7"
            strokeWidth={2}
            strokeLinejoin="round"
            className="transition-all duration-300"
          />

          {/* Data points on current polygon */}
          {PPI_AXES.map((axis, i) => {
            const val = currentValues[i]
            const angle = (Math.PI * 2 * i) / total - Math.PI / 2
            const px = cx + r * val * Math.cos(angle)
            const py = cy + r * val * Math.sin(angle)
            return (
              <circle
                key={axis}
                cx={px}
                cy={py}
                r={4}
                fill="#A371F7"
                stroke="#161B22"
                strokeWidth={2}
                className="cursor-pointer"
              />
            )
          })}

          {/* Axis labels + icons (tappable) */}
          {PPI_AXES.map((axis, i) => {
            const lp = labelPosition(i, total, cx, cy, r)
            const ep = axisEndpoint(i, total, cx, cy, r)
            return (
              <g
                key={axis}
                className="cursor-pointer"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: 'drills' })}
              >
                {/* Icon at axis endpoint */}
                <g transform={`translate(${ep.x - 8}, ${ep.y - 8})`} className="text-pb-text-dim" opacity={0.7}>
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    {AXIS_ICONS[axis]}
                  </svg>
                </g>
                {/* Label */}
                <text
                  x={lp.x}
                  y={lp.y + 12}
                  textAnchor={lp.anchor}
                  className="fill-pb-text-dim text-[9px] font-display uppercase tracking-wider"
                  style={{ fontSize: '9px' }}
                >
                  {PPI_LABELS[axis]}
                </text>
                {/* Score value */}
                <text
                  x={lp.x}
                  y={lp.y + 23}
                  textAnchor={lp.anchor}
                  className="fill-pb-text font-stat text-[11px] font-bold"
                  style={{ fontSize: '11px' }}
                >
                  {ppiScores[axis]}
                </text>
              </g>
            )
          })}
        </svg>
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

  // Build last 60 days of entries
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

  // Auto-scroll to end
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  return (
    <div className="bg-[#161B22] rounded-xl border border-pb-border p-4">
      <h3 className="font-display text-sm font-bold text-pb-text uppercase tracking-wider mb-3">
        Season Timeline
      </h3>
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pb-border scrollbar-track-transparent"
      >
        {days.map(day => {
          const hasTournament = day.sessions.some(s => s.type === 'tournament')
          const hasPractice = day.sessions.length > 0
          const avgWr = day.sessions.length > 0
            ? day.sessions.reduce((a, s) => a + s.winRate, 0) / day.sessions.length
            : -1

          let dotColor = 'bg-[#21262D]'
          if (hasTournament) dotColor = 'bg-pb-amber'
          else if (avgWr >= 0.6) dotColor = 'bg-pb-green'
          else if (avgWr >= 0.4) dotColor = 'bg-pb-amber'
          else if (avgWr >= 0) dotColor = 'bg-pb-red'

          const isToday = day.date === new Date().toISOString().split('T')[0]

          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 min-w-[12px]"
              title={`${day.date}${hasPractice ? ` - ${day.sessions.length} session(s)` : ''}`}
            >
              {/* Tournament flag */}
              {hasTournament && (
                <div className="text-pb-amber text-[8px] leading-none">&#9873;</div>
              )}
              {/* Dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full ${dotColor} ${
                  isToday ? 'ring-2 ring-pb-green ring-offset-1 ring-offset-[#161B22]' : ''
                }`}
              />
              {/* Date label every 7 days */}
              {new Date(day.date).getDay() === 0 && (
                <span className="text-[7px] text-pb-text-muted">
                  {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {/* PPI trend line (simplified) */}
      {ppiHistory.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] text-pb-text-muted uppercase tracking-wider">PPI Trend</span>
          <div className="flex-1 h-px bg-pb-border relative">
            <div className="absolute left-0 top-0 h-px bg-pb-purple" style={{ width: '100%' }} />
          </div>
          <span className="font-stat text-xs text-pb-purple font-bold">
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
  const { ppiScores, todaysFocusAxis } = state

  const weakest = getWeakestAxis(ppiScores)
  const focusAxis = (todaysFocusAxis || weakest) as PPIAxis
  const reason = FOCUS_REASONS[focusAxis] || 'Focus on your weakest skill to level up fastest.'

  return (
    <div className="bg-[#161B22] rounded-xl border border-pb-border overflow-hidden">
      {/* Gradient top accent */}
      <div className="h-1 bg-gradient-to-r from-pb-green via-pb-blue to-pb-green" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-pb-green/10 border border-pb-green/20 flex items-center justify-center text-pb-green shrink-0">
            <svg width="24" height="24" viewBox="0 0 16 16">
              {AXIS_ICONS[focusAxis] || AXIS_ICONS.snapShooting}
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-base font-bold text-pb-text uppercase tracking-wide">
                Today&apos;s Focus
              </h3>
              <span className="font-stat text-xs text-pb-green font-bold bg-pb-green/10 px-2 py-0.5 rounded">
                {PPI_LABELS[focusAxis]}
              </span>
            </div>
            <p className="text-pb-text-dim text-xs leading-relaxed">{reason}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-pb-text-muted">Current score:</span>
              <span className="font-stat text-sm font-bold text-pb-purple">{ppiScores[focusAxis]}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: 'drills' })}
          className="quick-start-btn w-full mt-4 py-3 bg-pb-green text-[#0D1117] font-display font-bold text-sm uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pb-green/20"
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
  // xp within current level
  let totalForLevel = 0
  for (let l = 1; l < level; l++) totalForLevel += xpForLevel(l)
  const xpInLevel = xp - totalForLevel
  const pct = Math.min((xpInLevel / xpNeeded) * 100, 100)

  const dailyChallenge = activeChallenges.find(c => c.type === 'daily' && !c.completed)

  const isStreakActive = trainingStreak > 0

  return (
    <div className="bg-[#161B22] rounded-xl border border-pb-border p-4">
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-2xl ${isStreakActive ? 'flame-active' : 'opacity-40'}`} role="img" aria-label="streak">
            &#128293;
          </span>
          <div>
            <div className="font-stat text-xl font-bold text-pb-text leading-none">{trainingStreak}</div>
            <div className="text-[9px] text-pb-text-muted uppercase tracking-wider">day streak</div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-pb-border" />

        {/* XP Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-xs font-bold text-pb-text uppercase tracking-wider">
              Level {level}
            </span>
            <span className="font-stat text-[10px] text-pb-text-dim">
              {xpInLevel}/{xpNeeded} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#21262D] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pb-green to-pb-blue rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily challenge text */}
      {dailyChallenge && (
        <div className="mt-3 flex items-center gap-2 bg-[#21262D] rounded-lg px-3 py-2">
          <span className="text-sm">{dailyChallenge.icon}</span>
          <span className="text-[11px] text-pb-text-dim flex-1">{dailyChallenge.title}</span>
          <span className="font-stat text-[10px] text-pb-amber font-bold">+{dailyChallenge.xpReward} XP</span>
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
      <div className="bg-[#161B22] rounded-xl border border-pb-border p-5 text-center">
        <p className="text-pb-text-muted text-xs">No sessions yet. Log your first game to see data here.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#161B22] rounded-xl border border-pb-border p-4">
      <h3 className="font-display text-sm font-bold text-pb-text uppercase tracking-wider mb-3">
        Recent Sessions
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pb-border scrollbar-track-transparent">
        {recent.map(session => (
          <div
            key={session.id}
            className="min-w-[200px] bg-[#21262D] rounded-lg border border-pb-border p-3 shrink-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-stat text-[11px] text-pb-text-dim">{session.date}</span>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${SESSION_TYPE_STYLES[session.type]}`}>
                {session.type}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <div>
                <span className="font-stat text-lg font-bold text-pb-text">{session.totalPoints}</span>
                <span className="text-[9px] text-pb-text-muted ml-1">pts</span>
              </div>
              <div>
                <span className="font-stat text-lg font-bold text-pb-text">
                  {Math.round(session.winRate * 100)}%
                </span>
                <span className="text-[9px] text-pb-text-muted ml-1">W/L</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${VERDICT_COLORS[session.focusVerdict] || 'bg-pb-text-muted'}`} />
              <span className="text-[10px] text-pb-text-dim">
                {PPI_LABELS[session.focusArea as PPIAxis] || session.focusArea}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  6. QUICK-START BUTTONS                                           */
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
      accent: 'from-pb-blue/20 to-pb-blue/5 border-pb-blue/30 hover:border-pb-blue/60',
      textColor: 'text-pb-blue',
    },
    {
      label: 'Start Drill',
      section: 'drills',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      accent: 'from-pb-green/20 to-pb-green/5 border-pb-green/30 hover:border-pb-green/60',
      textColor: 'text-pb-green',
    },
    {
      label: 'Plan Breakout',
      section: 'layout-planner',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      accent: 'from-pb-purple/20 to-pb-purple/5 border-pb-purple/30 hover:border-pb-purple/60',
      textColor: 'text-pb-purple',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map(btn => (
        <button
          key={btn.section}
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: btn.section })}
          className={`quick-start-btn bg-gradient-to-br ${btn.accent} border rounded-xl p-4 flex flex-col items-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-all`}
        >
          <div className={btn.textColor}>{btn.icon}</div>
          <span className={`font-display text-[11px] font-bold uppercase tracking-wider ${btn.textColor}`}>
            {btn.label}
          </span>
        </button>
      ))}
    </div>
  )
}
