import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import {
  DRILL_LIBRARY,
  getDrillsForAxis,
  getTodaysDrill,
  type DrillDefinition,
  type DrillResult,
} from '../../types/drill'
import {
  PPI_AXES,
  PPI_LABELS,
  getWeakestAxis,
  type PPIAxis,
} from '../../types/ppi'
import { nanoid } from 'nanoid'

// ─── Constants ──────────────────────────────────────────────────────────────

const AXIS_COLORS: Record<PPIAxis, string> = {
  snapShooting: '#F85149',
  movement: '#58A6FF',
  fieldIQ: '#A371F7',
  communication: '#56D4DD',
  gunSkills: '#F0883E',
  fitness: '#39D353',
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: 'rgba(57,211,83,0.15)', text: '#39D353' },
  medium: { bg: 'rgba(227,179,65,0.15)', text: '#E3B341' },
  hard: { bg: 'rgba(248,81,73,0.15)', text: '#F85149' },
}

type DrillView = 'library' | 'drill-active' | 'drill-summary'
type AxisFilter = 'all' | PPIAxis

// ─── Communication drill scenarios ─────────────────────────────────────────

interface CommsScenario {
  id: string
  situation: string
  expectedCall: string
  hint: string
}

const COMMS_SCENARIOS: CommsScenario[] = [
  { id: 'c1', situation: 'Opponent just bumped from Snake 1 to Snake 2 on the dorito side.', expectedCall: '"Snake 2! Snake 2 doritos!"', hint: 'Call the new position + side' },
  { id: 'c2', situation: 'You eliminated the opponent in the center 50. Your teammate is pinned at corner.', expectedCall: '"Center 50 is out! Corner you\'re clear to bump!"', hint: 'Confirm the kill, direct next action' },
  { id: 'c3', situation: 'You see two opponents shooting lanes from the back center and back right.', expectedCall: '"Two back! Back center and back right laning!"', hint: 'Count + positions + what they\'re doing' },
  { id: 'c4', situation: 'Your teammate just got hit and is walking off from the snake side.', expectedCall: '"We lost snake side! Close that lane!"', hint: 'Announce the loss, redirect coverage' },
  { id: 'c5', situation: 'Clock is at 30 seconds, you have a 3v1 advantage.', expectedCall: '"30 seconds, 3 on 1! Push together on go!"', hint: 'Time + count advantage + coordinate push' },
  { id: 'c6', situation: 'An opponent is running from their back left to the snake insert.', expectedCall: '"Runner! Runner snake side! Shoot the lane!"', hint: 'Alert movement + direction + action needed' },
]

// ─── Fitness workout exercises ──────────────────────────────────────────────

interface FitnessExercise {
  name: string
  sets: number
  reps: string
  restSeconds: number
  icon: string
}

const FITNESS_WORKOUTS: Record<string, FitnessExercise[]> = {
  'fitness-sprint': [
    { name: 'Breakout Sprint', sets: 8, reps: '15 sec sprint', restSeconds: 45, icon: '🏃' },
    { name: 'Lateral Shuffle', sets: 6, reps: '20 sec', restSeconds: 30, icon: '↔️' },
    { name: 'Backpedal Sprint', sets: 6, reps: '10 sec', restSeconds: 30, icon: '⬅️' },
    { name: 'Slide Practice', sets: 10, reps: '1 slide each side', restSeconds: 20, icon: '🎿' },
  ],
  'fitness-agility': [
    { name: 'Ladder In-Out', sets: 4, reps: '2 lengths', restSeconds: 30, icon: '🪜' },
    { name: 'Ladder Lateral', sets: 4, reps: '2 lengths', restSeconds: 30, icon: '↔️' },
    { name: 'Cone Weave', sets: 6, reps: '1 circuit', restSeconds: 20, icon: '🔶' },
    { name: 'Box Drill', sets: 6, reps: '4 corners', restSeconds: 25, icon: '⬛' },
  ],
  'fitness-hiit': [
    { name: 'Burpees', sets: 4, reps: '12 reps', restSeconds: 30, icon: '💪' },
    { name: 'Mountain Climbers', sets: 4, reps: '30 sec', restSeconds: 20, icon: '🏔️' },
    { name: 'Jump Squats', sets: 4, reps: '15 reps', restSeconds: 25, icon: '🦵' },
    { name: 'Plank Hold', sets: 3, reps: '45 sec', restSeconds: 30, icon: '🧘' },
    { name: 'Sprint in Place', sets: 4, reps: '20 sec', restSeconds: 20, icon: '🏃' },
    { name: 'Tuck Jumps', sets: 3, reps: '10 reps', restSeconds: 30, icon: '⬆️' },
  ],
}

// ─── Layout quiz bunker positions ───────────────────────────────────────────

interface BunkerPosition {
  x: number
  y: number
  label: string
}

const LAYOUT_LEVELS: BunkerPosition[][] = [
  // Level 1: 3 bunkers
  [
    { x: 50, y: 30, label: 'Center 50' },
    { x: 20, y: 60, label: 'Snake 1' },
    { x: 80, y: 60, label: 'Dorito 1' },
  ],
  // Level 2: 5 bunkers
  [
    { x: 50, y: 25, label: 'Center 50' },
    { x: 20, y: 45, label: 'Snake 1' },
    { x: 15, y: 70, label: 'Snake 2' },
    { x: 80, y: 45, label: 'Dorito 1' },
    { x: 85, y: 70, label: 'Dorito 2' },
  ],
  // Level 3: 8 bunkers
  [
    { x: 50, y: 20, label: 'Center 50' },
    { x: 35, y: 35, label: 'Temple L' },
    { x: 65, y: 35, label: 'Temple R' },
    { x: 20, y: 40, label: 'Snake 1' },
    { x: 12, y: 65, label: 'Snake 2' },
    { x: 80, y: 40, label: 'Dorito 1' },
    { x: 88, y: 65, label: 'Dorito 2' },
    { x: 50, y: 55, label: 'Center Insert' },
  ],
  // Level 4: Full layout
  [
    { x: 50, y: 15, label: 'Center 50' },
    { x: 30, y: 25, label: 'Temple L' },
    { x: 70, y: 25, label: 'Temple R' },
    { x: 20, y: 38, label: 'Snake 1' },
    { x: 12, y: 55, label: 'Snake 2' },
    { x: 8, y: 75, label: 'Snake 3' },
    { x: 80, y: 38, label: 'Dorito 1' },
    { x: 88, y: 55, label: 'Dorito 2' },
    { x: 92, y: 75, label: 'Dorito 3' },
    { x: 50, y: 45, label: 'Center Insert' },
    { x: 38, y: 60, label: 'Can L' },
    { x: 62, y: 60, label: 'Can R' },
  ],
]

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function DrillsSection() {
  const state = useAppState()
  const dispatch = useDispatch()

  const [view, setView] = useState<DrillView>('library')
  const [activeDrill, setActiveDrill] = useState<DrillDefinition | null>(null)
  const [axisFilter, setAxisFilter] = useState<AxisFilter>('all')
  const [summaryData, setSummaryData] = useState<{
    score: number
    personalBest: boolean
    xpEarned: number
    drillName: string
    ppiAxis: PPIAxis
  } | null>(null)

  const weakestAxis = getWeakestAxis(state.ppiScores)
  const todaysDrill = getTodaysDrill(
    (state.todaysFocusAxis as PPIAxis) || weakestAxis,
    state.completedDrillIds
  )

  const filteredDrills =
    axisFilter === 'all'
      ? DRILL_LIBRARY
      : getDrillsForAxis(axisFilter)

  const getBestScore = (drillId: string): number | null => {
    const results = state.drillResults.filter((r) => r.drillId === drillId)
    if (results.length === 0) return null
    return Math.max(...results.map((r) => r.score))
  }

  const handleStartDrill = (drill: DrillDefinition) => {
    setActiveDrill(drill)
    setView('drill-active')
  }

  const handleCompleteDrill = (score: number, metrics: Record<string, number>, duration: number) => {
    if (!activeDrill) return

    const best = getBestScore(activeDrill.id)
    const isPB = best === null || score > best
    const xpEarned = Math.round(30 + score * 0.5 + (isPB ? 25 : 0))

    const result: DrillResult = {
      id: nanoid(),
      drillId: activeDrill.id,
      date: new Date().toISOString().split('T')[0],
      score,
      personalBest: isPB,
      duration,
      xpEarned,
      ppiAxis: activeDrill.ppiAxis,
      metrics,
    }

    dispatch({ type: 'COMPLETE_DRILL', result })
    dispatch({ type: 'ADD_XP', amount: xpEarned })
    dispatch({ type: 'RECORD_ACTIVITY' })

    // Slight PPI bump based on drill completion
    const currentPPI = state.ppiScores[activeDrill.ppiAxis]
    const bump = Math.max(0.5, (100 - currentPPI) * 0.03 * (score / 100))
    dispatch({ type: 'UPDATE_PPI_AXIS', axis: activeDrill.ppiAxis, value: currentPPI + bump })

    setSummaryData({
      score,
      personalBest: isPB,
      xpEarned,
      drillName: activeDrill.name,
      ppiAxis: activeDrill.ppiAxis,
    })
    setView('drill-summary')
  }

  const handleBackToLibrary = () => {
    setView('library')
    setActiveDrill(null)
    setSummaryData(null)
  }

  // ─── Render Dispatch ────────────────────────────────────────────────────

  if (view === 'drill-summary' && summaryData) {
    return <DrillSummary data={summaryData} streak={state.trainingStreak} onNextDrill={() => {
      const next = getTodaysDrill((state.todaysFocusAxis as PPIAxis) || weakestAxis, state.completedDrillIds)
      if (next) handleStartDrill(next)
      else handleBackToLibrary()
    }} onDone={handleBackToLibrary} />
  }

  if (view === 'drill-active' && activeDrill) {
    switch (activeDrill.type) {
      case 'snap-trainer':
        return <SnapTrainer drill={activeDrill} bestScore={getBestScore(activeDrill.id)} onComplete={handleCompleteDrill} onBack={handleBackToLibrary} />
      case 'layout-quiz':
        return <LayoutQuiz drill={activeDrill} bestScore={getBestScore(activeDrill.id)} onComplete={handleCompleteDrill} onBack={handleBackToLibrary} />
      case 'fitness-workout':
        return <FitnessWorkout drill={activeDrill} bestScore={getBestScore(activeDrill.id)} onComplete={handleCompleteDrill} onBack={handleBackToLibrary} />
      case 'comms-drill':
        return <CommsDrill drill={activeDrill} bestScore={getBestScore(activeDrill.id)} onComplete={handleCompleteDrill} onBack={handleBackToLibrary} />
      case 'accuracy-drill':
        return <SnapTrainer drill={activeDrill} bestScore={getBestScore(activeDrill.id)} onComplete={handleCompleteDrill} onBack={handleBackToLibrary} />
      default:
        return <SnapTrainer drill={activeDrill} bestScore={getBestScore(activeDrill.id)} onComplete={handleCompleteDrill} onBack={handleBackToLibrary} />
    }
  }

  // ─── Library View ───────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white">Solo Drill Mode</h2>
          <p className="text-[12px] text-pb-text-dim mt-0.5">Train between practice days</p>
        </div>
        {state.trainingStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(227,179,65,0.12)', border: '1px solid rgba(227,179,65,0.25)' }}>
            <span className="flame-active text-lg">🔥</span>
            <span className="text-[13px] font-bold" style={{ color: '#E3B341' }}>{state.trainingStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Today's Focus Drill */}
      {todaysDrill && (
        <div className="card-gaming p-5 glow-green relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ background: `radial-gradient(circle at 80% 20%, ${AXIS_COLORS[todaysDrill.ppiAxis]}, transparent 60%)` }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="section-header" style={{ color: '#39D353' }}>TODAY&apos;S FOCUS</span>
              <span className="tag-pill tag-purple text-[10px]">
                {PPI_LABELS[todaysDrill.ppiAxis]}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(57,211,83,0.12)' }}>
                {todaysDrill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold text-white">{todaysDrill.name}</h3>
                <p className="text-[12px] text-pb-text-dim mt-1 leading-relaxed">{todaysDrill.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-pb-text-muted flex items-center gap-1">
                    <ClockIcon /> {todaysDrill.estimatedMinutes} min
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: DIFFICULTY_COLORS[todaysDrill.difficulty].bg,
                      color: DIFFICULTY_COLORS[todaysDrill.difficulty].text,
                    }}>
                    {todaysDrill.difficulty.charAt(0).toUpperCase() + todaysDrill.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStartDrill(todaysDrill)}
              className="btn-primary w-full mt-4 animate-pulse-glow"
            >
              <PlayIcon />
              Start Drill
            </button>
          </div>
        </div>
      )}

      {/* Axis Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setAxisFilter('all')}
          className={`pill-tab whitespace-nowrap ${axisFilter === 'all' ? 'pill-tab-active' : ''}`}
        >
          All
        </button>
        {PPI_AXES.map((axis) => (
          <button
            key={axis}
            type="button"
            onClick={() => setAxisFilter(axis)}
            className={`pill-tab whitespace-nowrap ${axisFilter === axis ? 'pill-tab-active' : ''}`}
          >
            {PPI_LABELS[axis]}
          </button>
        ))}
      </div>

      {/* Drill Library Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredDrills.map((drill) => {
          const best = getBestScore(drill.id)
          const isCompleted = state.completedDrillIds.includes(drill.id)

          return (
            <button
              key={drill.id}
              type="button"
              onClick={() => handleStartDrill(drill)}
              className="card-gaming p-4 text-left group relative overflow-hidden"
            >
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(57,211,83,0.2)' }}>
                    <CheckIcon />
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${AXIS_COLORS[drill.ppiAxis]}15` }}>
                  {drill.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-white group-hover:text-pb-green transition-colors">
                    {drill.name}
                  </h4>
                  <p className="text-[11px] text-pb-text-dim mt-0.5 line-clamp-2 leading-relaxed">
                    {drill.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: DIFFICULTY_COLORS[drill.difficulty].bg,
                        color: DIFFICULTY_COLORS[drill.difficulty].text,
                      }}>
                      {drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)}
                    </span>
                    <span className="text-[10px] text-pb-text-muted flex items-center gap-1">
                      <ClockIcon size={10} /> {drill.estimatedMinutes}m
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${AXIS_COLORS[drill.ppiAxis]}18`,
                        color: AXIS_COLORS[drill.ppiAxis],
                      }}>
                      {PPI_LABELS[drill.ppiAxis]}
                    </span>
                  </div>
                  {best !== null && (
                    <div className="mt-2 text-[11px] font-stat" style={{ color: '#39D353' }}>
                      Best: {best}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SNAP SHOOTING TRAINER
// ═══════════════════════════════════════════════════════════════════════════

function SnapTrainer({
  drill,
  bestScore,
  onComplete,
  onBack,
}: {
  drill: DrillDefinition
  bestScore: number | null
  onComplete: (score: number, metrics: Record<string, number>, duration: number) => void
  onBack: () => void
}) {
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'active' | 'done'>('ready')
  const [countdown, setCountdown] = useState(3)
  const [timer, setTimer] = useState(0)
  const [reps, setReps] = useState(0)
  const [targets, setTargets] = useState<{ x: number; y: number; side: 'left' | 'right'; hitTime?: number }[]>([])
  const [activeTarget, setActiveTarget] = useState<{ x: number; y: number; side: 'left' | 'right' } | null>(null)
  const [targetAppearTime, setTargetAppearTime] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [leftHits, setLeftHits] = useState(0)
  const [rightHits, setRightHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const targetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)

  const TOTAL_REPS = drill.difficulty === 'easy' ? 10 : drill.difficulty === 'medium' ? 15 : 20
  const TARGET_SHOW_MS = drill.difficulty === 'easy' ? 2000 : drill.difficulty === 'medium' ? 1500 : 1000

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('active')
      startTimeRef.current = Date.now()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Main timer
  useEffect(() => {
    if (phase !== 'active') return
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 200)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Spawn targets
  const spawnTarget = useCallback(() => {
    if (phase !== 'active') return
    const side = Math.random() > 0.5 ? 'right' : 'left'
    const x = side === 'left' ? 15 + Math.random() * 30 : 55 + Math.random() * 30
    const y = 15 + Math.random() * 60
    setActiveTarget({ x, y, side })
    setTargetAppearTime(Date.now())

    targetTimerRef.current = setTimeout(() => {
      // Missed
      setActiveTarget(null)
      setMisses((m) => m + 1)
      setReps((r) => {
        const next = r + 1
        if (next >= TOTAL_REPS) setPhase('done')
        return next
      })
    }, TARGET_SHOW_MS)
  }, [phase, TOTAL_REPS, TARGET_SHOW_MS])

  useEffect(() => {
    if (phase === 'active' && !activeTarget && reps < TOTAL_REPS) {
      const delay = 400 + Math.random() * 800
      const t = setTimeout(spawnTarget, delay)
      return () => clearTimeout(t)
    }
  }, [phase, activeTarget, reps, TOTAL_REPS, spawnTarget])

  const handleTargetHit = () => {
    if (!activeTarget) return
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current)

    const reactionMs = Date.now() - targetAppearTime
    setReactionTimes((prev) => [...prev, reactionMs])
    if (activeTarget.side === 'left') setLeftHits((h) => h + 1)
    else setRightHits((h) => h + 1)

    setTargets((prev) => [...prev, { ...activeTarget, hitTime: reactionMs }])
    setActiveTarget(null)
    setReps((r) => {
      const next = r + 1
      if (next >= TOTAL_REPS) setPhase('done')
      return next
    })
  }

  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'active' || activeTarget) return
    // Click on empty field = miss
    setMisses((m) => m + 1)
  }

  // Calculate score when done
  useEffect(() => {
    if (phase !== 'done') return
    if (timerRef.current) clearInterval(timerRef.current)
    const totalHits = leftHits + rightHits
    const accuracy = TOTAL_REPS > 0 ? (totalHits / TOTAL_REPS) * 100 : 0
    const avgReaction = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : TARGET_SHOW_MS
    // Score: accuracy weighted 60%, speed weighted 40%
    const speedScore = Math.max(0, 100 - (avgReaction / TARGET_SHOW_MS) * 100)
    const score = Math.round(accuracy * 0.6 + speedScore * 0.4)
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

    const balanceRatio = TOTAL_REPS > 0
      ? Math.min(leftHits, rightHits) / Math.max(leftHits, rightHits, 1)
      : 0

    onComplete(Math.min(100, score), {
      accuracy: Math.round(accuracy),
      avgReactionMs: Math.round(avgReaction),
      leftHits,
      rightHits,
      misses,
      balanceRatio: Math.round(balanceRatio * 100),
    }, duration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack}
          className="text-pb-text-dim text-[12px] font-semibold flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeftIcon /> Back
        </button>
        <span className="tag-pill" style={{
          background: `${AXIS_COLORS[drill.ppiAxis]}18`,
          color: AXIS_COLORS[drill.ppiAxis],
        }}>
          {PPI_LABELS[drill.ppiAxis]}
        </span>
      </div>

      {/* Drill Title */}
      <div className="text-center">
        <span className="text-3xl">{drill.icon}</span>
        <h2 className="text-xl font-extrabold text-white mt-2">{drill.name}</h2>
        <p className="text-[12px] text-pb-text-dim mt-1">{drill.description}</p>
      </div>

      {/* Timer & Stats Bar */}
      <div className="card-gaming p-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="drill-timer">{formatTime(timer)}</div>
            <div className="text-[10px] text-pb-text-muted uppercase tracking-wider mt-1">Time</div>
          </div>
          <div className="w-px h-12 bg-pb-border" />
          <div className="text-center flex-1">
            <div className="font-stat text-2xl text-white">{reps}/{TOTAL_REPS}</div>
            <div className="text-[10px] text-pb-text-muted uppercase tracking-wider mt-1">Reps</div>
          </div>
          <div className="w-px h-12 bg-pb-border" />
          <div className="text-center flex-1">
            <div className="font-stat text-2xl" style={{ color: '#39D353' }}>
              {reactionTimes.length > 0
                ? `${Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms`
                : '--'}
            </div>
            <div className="text-[10px] text-pb-text-muted uppercase tracking-wider mt-1">Avg React</div>
          </div>
        </div>
        {bestScore !== null && (
          <div className="text-center mt-3 pt-3 border-t border-pb-border">
            <span className="text-[11px] text-pb-text-dim">Personal Best: </span>
            <span className="font-stat text-[13px] text-pb-amber">{bestScore}</span>
          </div>
        )}
      </div>

      {/* Target Area */}
      <div
        className="card-gaming relative overflow-hidden cursor-crosshair"
        style={{ height: 320 }}
        onClick={handleFieldClick}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[20, 40, 60, 80].map((p) => (
            <div key={`v${p}`} className="absolute top-0 bottom-0 w-px bg-pb-text-muted" style={{ left: `${p}%` }} />
          ))}
          {[25, 50, 75].map((p) => (
            <div key={`h${p}`} className="absolute left-0 right-0 h-px bg-pb-text-muted" style={{ top: `${p}%` }} />
          ))}
        </div>

        {/* Center line */}
        <div className="absolute top-0 bottom-0 w-px left-1/2 bg-pb-border opacity-40" />

        {/* Side labels */}
        <div className="absolute top-2 left-3 text-[10px] font-semibold text-pb-text-muted uppercase tracking-wider">Left</div>
        <div className="absolute top-2 right-3 text-[10px] font-semibold text-pb-text-muted uppercase tracking-wider">Right</div>

        {/* Ready / Countdown overlay */}
        {phase === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pb-dark/60 z-10">
            <p className="text-[14px] text-pb-text-dim mb-4">Tap targets as fast as you can</p>
            <button
              type="button"
              onClick={() => { setPhase('countdown'); setCountdown(3) }}
              className="btn-primary text-lg px-12"
            >
              <PlayIcon /> GO
            </button>
          </div>
        )}

        {phase === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-pb-dark/70 z-10">
            <div className="text-7xl font-display animate-count-up" style={{ color: '#39D353', textShadow: '0 0 40px rgba(57,211,83,0.5)' }}>
              {countdown}
            </div>
          </div>
        )}

        {/* Active target */}
        {activeTarget && phase === 'active' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTargetHit() }}
            className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full transition-transform hover:scale-110 active:scale-90 z-20"
            style={{
              left: `${activeTarget.x}%`,
              top: `${activeTarget.y}%`,
              background: 'radial-gradient(circle, #F85149 30%, #F8514950 70%)',
              boxShadow: '0 0 30px rgba(248,81,73,0.5), 0 0 60px rgba(248,81,73,0.2)',
              animation: 'pulse-glow-target 0.8s ease-in-out infinite',
            }}
          >
            <div className="absolute inset-2 rounded-full border-2 border-white/40" />
            <div className="absolute inset-[40%] rounded-full bg-white/80" />
          </button>
        )}

        {/* Hit markers */}
        {targets.slice(-5).map((t, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full opacity-30"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              background: '#39D353',
            }}
          />
        ))}

        {/* Balance indicator */}
        {phase === 'active' && reps > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <span className="text-[9px] text-pb-text-muted">L:{leftHits}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-pb-surface">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(leftHits / Math.max(leftHits + rightHits, 1)) * 100}%`,
                  background: '#58A6FF',
                }}
              />
            </div>
            <span className="text-[9px] text-pb-text-muted">R:{rightHits}</span>
          </div>
        )}
      </div>

      {/* Accuracy bar */}
      {phase === 'active' && reps > 0 && (
        <div className="card-gaming p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-pb-text-dim">Accuracy</span>
            <span className="font-stat text-[12px]" style={{ color: '#39D353' }}>
              {Math.round(((leftHits + rightHits) / reps) * 100)}%
            </span>
          </div>
          <div className="xp-bar-track h-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((leftHits + rightHits) / reps) * 100}%`,
                background: 'linear-gradient(90deg, #39D353, #2EA043)',
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow-target {
          0%, 100% { box-shadow: 0 0 20px rgba(248,81,73,0.4), 0 0 40px rgba(248,81,73,0.15); }
          50% { box-shadow: 0 0 35px rgba(248,81,73,0.6), 0 0 70px rgba(248,81,73,0.25); }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT MEMORIZATION QUIZ
// ═══════════════════════════════════════════════════════════════════════════

function LayoutQuiz({
  drill,
  bestScore,
  onComplete,
  onBack,
}: {
  drill: DrillDefinition
  bestScore: number | null
  onComplete: (score: number, metrics: Record<string, number>, duration: number) => void
  onBack: () => void
}) {
  const levelIndex = drill.difficulty === 'easy' ? 0 : drill.difficulty === 'hard' ? 3 : 1
  const bunkers = LAYOUT_LEVELS[levelIndex]

  const [phase, setPhase] = useState<'preview' | 'countdown' | 'quiz' | 'results'>('preview')
  const [previewTimer, setPreviewTimer] = useState(5)
  const [placements, setPlacements] = useState<{ x: number; y: number }[]>([])
  const [quizTimer, setQuizTimer] = useState(0)
  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Preview countdown
  useEffect(() => {
    if (phase !== 'preview') return
    if (previewTimer <= 0) {
      setPhase('countdown')
      return
    }
    const t = setTimeout(() => setPreviewTimer((p) => p - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, previewTimer])

  // Transition from countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    const t = setTimeout(() => {
      setPhase('quiz')
      startTimeRef.current = Date.now()
    }, 1000)
    return () => clearTimeout(t)
  }, [phase])

  // Quiz timer
  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setQuizTimer(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 200)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleFieldTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'quiz') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPlacements((prev) => [...prev, { x, y }])
  }

  const handleUndo = () => {
    setPlacements((prev) => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('results')

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

    // Score each placement: find nearest bunker, calculate distance
    let totalDistance = 0
    const matched = new Set<number>()

    for (const placement of placements) {
      let minDist = Infinity
      let minIdx = -1
      bunkers.forEach((b, i) => {
        if (matched.has(i)) return
        const dist = Math.sqrt((placement.x - b.x) ** 2 + (placement.y - b.y) ** 2)
        if (dist < minDist) { minDist = dist; minIdx = i }
      })
      if (minIdx >= 0) {
        matched.add(minIdx)
        totalDistance += minDist
      }
    }

    const correctPlacements = matched.size
    const avgDistance = matched.size > 0 ? totalDistance / matched.size : 50
    const positionAccuracy = Math.max(0, 100 - avgDistance * 2)
    const countAccuracy = (Math.min(placements.length, bunkers.length) / bunkers.length) * 100
    const countPenalty = Math.abs(placements.length - bunkers.length) * 5
    const speedBonus = Math.max(0, 20 - duration) * 2

    const score = Math.min(100, Math.max(0,
      Math.round(positionAccuracy * 0.5 + countAccuracy * 0.3 + speedBonus - countPenalty)
    ))

    onComplete(score, {
      correctPlacements,
      totalBunkers: bunkers.length,
      avgDistanceError: Math.round(avgDistance),
      timeSeconds: duration,
    }, duration)
  }

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack}
          className="text-pb-text-dim text-[12px] font-semibold flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeftIcon /> Back
        </button>
        <span className="tag-pill tag-purple">{PPI_LABELS[drill.ppiAxis]}</span>
      </div>

      <div className="text-center">
        <span className="text-3xl">{drill.icon}</span>
        <h2 className="text-xl font-extrabold text-white mt-2">{drill.name}</h2>
      </div>

      {/* Phase: Preview */}
      {phase === 'preview' && (
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-[13px] text-pb-text-dim">Memorize the bunker positions!</span>
            <div className="drill-timer mt-2" style={{ color: '#E3B341' }}>{previewTimer}</div>
          </div>
          <FieldDisplay bunkers={bunkers} showLabels placements={[]} />
        </div>
      )}

      {/* Phase: Countdown transition */}
      {phase === 'countdown' && (
        <div className="card-gaming flex items-center justify-center" style={{ height: 300 }}>
          <div className="text-center">
            <div className="text-5xl font-display animate-count-up" style={{ color: '#F85149' }}>GO!</div>
            <p className="text-[12px] text-pb-text-dim mt-2">Tap where the bunkers were</p>
          </div>
        </div>
      )}

      {/* Phase: Quiz */}
      {phase === 'quiz' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-stat text-[14px] text-pb-text-dim">{quizTimer}s</span>
            <span className="text-[12px] text-pb-text-dim">
              {placements.length} / {bunkers.length} placed
            </span>
          </div>
          <FieldDisplay bunkers={[]} showLabels={false} placements={placements} onTap={handleFieldTap} interactive />
          <div className="flex gap-3">
            <button type="button" onClick={handleUndo} disabled={placements.length === 0}
              className="btn-secondary flex-1 disabled:opacity-30">
              Undo
            </button>
            <button type="button" onClick={handleSubmit} className="btn-primary flex-1">
              Submit ({placements.length})
            </button>
          </div>
        </div>
      )}

      {bestScore !== null && phase === 'preview' && (
        <div className="text-center">
          <span className="text-[11px] text-pb-text-dim">Personal Best: </span>
          <span className="font-stat text-[13px] text-pb-amber">{bestScore}</span>
        </div>
      )}
    </div>
  )
}

function FieldDisplay({
  bunkers,
  showLabels,
  placements,
  onTap,
  interactive,
}: {
  bunkers: BunkerPosition[]
  showLabels: boolean
  placements: { x: number; y: number }[]
  onTap?: (e: React.MouseEvent<HTMLDivElement>) => void
  interactive?: boolean
}) {
  return (
    <div
      className={`card-gaming relative overflow-hidden ${interactive ? 'cursor-crosshair' : ''}`}
      style={{ height: 300, background: '#0D1117' }}
      onClick={onTap}
    >
      {/* Field outline */}
      <div className="absolute inset-4 border border-pb-border rounded-lg opacity-40" />
      <div className="absolute left-4 right-4 top-1/2 h-px bg-pb-border opacity-30" />

      {/* Start boxes */}
      <div className="absolute left-4 right-[50%] bottom-4 h-8 border border-pb-border/30 rounded-sm" />
      <div className="absolute left-[50%] right-4 bottom-4 h-8 border border-pb-border/30 rounded-sm" />

      {/* Bunkers */}
      {bunkers.map((b, i) => (
        <div key={i} className="absolute -ml-3 -mt-3" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          <div className="w-6 h-6 rounded-full border-2 border-pb-purple bg-pb-purple/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-pb-purple" />
          </div>
          {showLabels && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-pb-text-muted font-semibold">
              {b.label}
            </div>
          )}
        </div>
      ))}

      {/* Player placements */}
      {placements.map((p, i) => (
        <div key={i} className="absolute -ml-2.5 -mt-2.5" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: '#39D353', background: 'rgba(57,211,83,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-pb-green" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FITNESS WORKOUT BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function FitnessWorkout({
  drill,
  bestScore,
  onComplete,
  onBack,
}: {
  drill: DrillDefinition
  bestScore: number | null
  onComplete: (score: number, metrics: Record<string, number>, duration: number) => void
  onBack: () => void
}) {
  const exercises = FITNESS_WORKOUTS[drill.id] || FITNESS_WORKOUTS['fitness-sprint']
  const [completed, setCompleted] = useState<boolean[]>(new Array(exercises.length).fill(false))
  const [activeExercise, setActiveExercise] = useState<number | null>(null)
  const [exerciseTimer, setExerciseTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    const t = setInterval(() => setTotalElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  // Exercise timer
  useEffect(() => {
    if (!isTimerRunning) return
    timerRef.current = setInterval(() => {
      setExerciseTimer((t) => {
        if (t <= 1) {
          setIsTimerRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isTimerRunning])

  const toggleComplete = (index: number) => {
    const next = [...completed]
    next[index] = !next[index]
    setCompleted(next)
  }

  const startRestTimer = (seconds: number) => {
    setExerciseTimer(seconds)
    setIsTimerRunning(true)
  }

  const completedCount = completed.filter(Boolean).length
  const allDone = completedCount === exercises.length

  const handleFinish = () => {
    const duration = Math.floor((Date.now() - startRef.current) / 1000)
    const completionRate = (completedCount / exercises.length) * 100
    const score = Math.round(completionRate)

    onComplete(score, {
      exercisesCompleted: completedCount,
      totalExercises: exercises.length,
      totalTimeSeconds: duration,
    }, duration)
  }

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack}
          className="text-pb-text-dim text-[12px] font-semibold flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeftIcon /> Back
        </button>
        <span className="tag-pill tag-green">{PPI_LABELS[drill.ppiAxis]}</span>
      </div>

      <div className="text-center">
        <span className="text-3xl">{drill.icon}</span>
        <h2 className="text-xl font-extrabold text-white mt-2">{drill.name}</h2>
        <p className="text-[12px] text-pb-text-dim mt-1">{drill.description}</p>
      </div>

      {/* Progress + Timer */}
      <div className="card-gaming p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-stat text-lg text-white">{completedCount}/{exercises.length}</span>
            <span className="text-[11px] text-pb-text-dim ml-2">exercises</span>
          </div>
          <span className="font-stat text-[14px] text-pb-text-dim">{formatTimer(totalElapsed)}</span>
        </div>
        <div className="xp-bar-track h-2.5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(completedCount / exercises.length) * 100}%`,
              background: 'linear-gradient(90deg, #39D353, #2EA043)',
            }}
          />
        </div>
      </div>

      {/* Rest Timer */}
      {isTimerRunning && (
        <div className="card-gaming p-4 text-center glow-amber">
          <span className="text-[11px] text-pb-text-dim uppercase tracking-wider">Rest Timer</span>
          <div className="drill-timer mt-1" style={{ color: '#E3B341', fontSize: 42 }}>
            {formatTimer(exerciseTimer)}
          </div>
          <button type="button" onClick={() => { setIsTimerRunning(false); setExerciseTimer(0) }}
            className="btn-secondary mt-2 text-[12px]">Skip Rest</button>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-2">
        {exercises.map((ex, i) => (
          <div
            key={i}
            className={`card-gaming p-4 transition-all ${completed[i] ? 'opacity-60' : ''} ${activeExercise === i ? 'glow-green' : ''}`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleComplete(i)}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                style={{
                  borderColor: completed[i] ? '#39D353' : '#30363D',
                  background: completed[i] ? 'rgba(57,211,83,0.2)' : 'transparent',
                }}
              >
                {completed[i] && <CheckIcon />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ex.icon}</span>
                  <h4 className={`text-[14px] font-bold ${completed[i] ? 'line-through text-pb-text-dim' : 'text-white'}`}>
                    {ex.name}
                  </h4>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-pb-text-dim">{ex.sets} x {ex.reps}</span>
                  <span className="text-[11px] text-pb-text-muted">Rest: {ex.restSeconds}s</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {!completed[i] && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveExercise(i)
                      startRestTimer(ex.restSeconds)
                    }}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-pb-surface text-pb-text-dim hover:text-white transition-colors"
                  >
                    Rest
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Finish Button */}
      <button
        type="button"
        onClick={handleFinish}
        className={`w-full ${allDone ? 'btn-primary animate-pulse-glow' : 'btn-secondary'}`}
      >
        {allDone ? (
          <><CheckIcon /> Complete Workout</>
        ) : (
          <>Finish Early ({completedCount}/{exercises.length})</>
        )}
      </button>

      {bestScore !== null && (
        <div className="text-center">
          <span className="text-[11px] text-pb-text-dim">Personal Best: </span>
          <span className="font-stat text-[13px] text-pb-amber">{bestScore}</span>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNICATION DRILL
// ═══════════════════════════════════════════════════════════════════════════

function CommsDrill({
  drill,
  bestScore,
  onComplete,
  onBack,
}: {
  drill: DrillDefinition
  bestScore: number | null
  onComplete: (score: number, metrics: Record<string, number>, duration: number) => void
  onBack: () => void
}) {
  const scenarioCount = drill.difficulty === 'easy' ? 3 : drill.difficulty === 'hard' ? 6 : 4
  const [scenarios] = useState(() => {
    const shuffled = [...COMMS_SCENARIOS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, scenarioCount)
  })

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'scenario' | 'reveal' | 'done'>('ready')
  const [countdown, setCountdown] = useState(3)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [scenarioTimer, setScenarioTimer] = useState(0)
  const startTimeRef = useRef(0)
  const scenarioStartRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('scenario')
      scenarioStartRef.current = Date.now()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Scenario timer
  useEffect(() => {
    if (phase !== 'scenario') return
    timerRef.current = setInterval(() => {
      setScenarioTimer(Math.floor((Date.now() - scenarioStartRef.current) / 1000))
    }, 200)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const handleStart = () => {
    startTimeRef.current = Date.now()
    setCountdown(3)
    setPhase('countdown')
  }

  const handleReveal = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('reveal')
  }

  const handleSelfAssess = (correct: boolean) => {
    const next = [...answers, correct]
    setAnswers(next)

    if (currentIndex + 1 >= scenarios.length) {
      // Done
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const correctCount = next.filter(Boolean).length
      const score = Math.round((correctCount / scenarios.length) * 100)

      onComplete(score, {
        correctCalls: correctCount,
        totalScenarios: scenarios.length,
        timeSeconds: duration,
      }, duration)
    } else {
      setCurrentIndex((i) => i + 1)
      setScenarioTimer(0)
      setCountdown(3)
      setPhase('countdown')
    }
  }

  const current = scenarios[currentIndex]

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack}
          className="text-pb-text-dim text-[12px] font-semibold flex items-center gap-1 hover:text-white transition-colors">
          <ChevronLeftIcon /> Back
        </button>
        <span className="tag-pill tag-cyan">{PPI_LABELS[drill.ppiAxis]}</span>
      </div>

      <div className="text-center">
        <span className="text-3xl">{drill.icon}</span>
        <h2 className="text-xl font-extrabold text-white mt-2">{drill.name}</h2>
        <p className="text-[12px] text-pb-text-dim mt-1">{drill.description}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {scenarios.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              background:
                i < currentIndex
                  ? answers[i] ? '#39D353' : '#F85149'
                  : i === currentIndex
                    ? '#A371F7'
                    : '#21262D',
            }}
          />
        ))}
      </div>

      {/* Ready */}
      {phase === 'ready' && (
        <div className="card-gaming p-8 text-center">
          <p className="text-[14px] text-pb-text-dim mb-2">
            You will see a game scenario. Call out what you would say, then check your answer.
          </p>
          <p className="text-[12px] text-pb-text-muted mb-6">{scenarioCount} scenarios</p>
          <button type="button" onClick={handleStart} className="btn-primary text-lg px-12">
            <PlayIcon /> Ready?
          </button>
          {bestScore !== null && (
            <div className="mt-4">
              <span className="text-[11px] text-pb-text-dim">Personal Best: </span>
              <span className="font-stat text-[13px] text-pb-amber">{bestScore}</span>
            </div>
          )}
        </div>
      )}

      {/* Countdown */}
      {phase === 'countdown' && (
        <div className="card-gaming p-12 text-center" style={{ minHeight: 200 }}>
          <span className="text-[12px] text-pb-text-muted uppercase tracking-wider">Get Ready</span>
          <div className="text-6xl font-display mt-4 animate-count-up" style={{ color: '#E3B341' }}>
            {countdown}
          </div>
        </div>
      )}

      {/* Scenario */}
      {phase === 'scenario' && current && (
        <div className="space-y-4 animate-slide-up">
          <div className="card-gaming p-5"
            style={{ background: 'linear-gradient(135deg, #161B22 0%, #1B2430 100%)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#56D4DD' }}>
                Scenario {currentIndex + 1} of {scenarios.length}
              </span>
              <span className="font-stat text-[13px] text-pb-text-dim">{scenarioTimer}s</span>
            </div>
            <p className="text-[15px] text-white font-semibold leading-relaxed">{current.situation}</p>
            <p className="text-[11px] text-pb-text-muted mt-3 italic">Hint: {current.hint}</p>
          </div>

          <p className="text-center text-[12px] text-pb-text-dim">
            Say your call-out, then tap reveal to check
          </p>

          <button type="button" onClick={handleReveal}
            className="btn-primary w-full">
            Reveal Answer
          </button>
        </div>
      )}

      {/* Reveal */}
      {phase === 'reveal' && current && (
        <div className="space-y-4 animate-slide-up">
          <div className="card-gaming p-5">
            <span className="text-[11px] text-pb-text-muted uppercase tracking-wider">Situation</span>
            <p className="text-[13px] text-pb-text-dim mt-1">{current.situation}</p>
          </div>

          <div className="card-gaming p-5 glow-green"
            style={{ background: 'linear-gradient(135deg, #161B22, #0D2818)' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#39D353' }}>
              Expected Call-Out
            </span>
            <p className="text-[16px] text-white font-bold mt-2 leading-relaxed">{current.expectedCall}</p>
          </div>

          <p className="text-center text-[13px] text-pb-text-dim font-semibold">Did you get it right?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => handleSelfAssess(false)}
              className="flex-1 py-3 rounded-lg font-bold text-[14px] transition-all"
              style={{ background: 'rgba(248,81,73,0.15)', color: '#F85149', border: '1px solid rgba(248,81,73,0.3)' }}>
              No
            </button>
            <button type="button" onClick={() => handleSelfAssess(true)}
              className="flex-1 py-3 rounded-lg font-bold text-[14px] transition-all"
              style={{ background: 'rgba(57,211,83,0.15)', color: '#39D353', border: '1px solid rgba(57,211,83,0.3)' }}>
              Yes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DRILL SESSION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function DrillSummary({
  data,
  streak,
  onNextDrill,
  onDone,
}: {
  data: { score: number; personalBest: boolean; xpEarned: number; drillName: string; ppiAxis: PPIAxis }
  streak: number
  onNextDrill: () => void
  onDone: () => void
}) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let frame = 0
    const target = data.score
    const duration = 60 // frames
    const step = target / duration
    const interval = setInterval(() => {
      frame++
      if (frame >= duration) {
        setAnimatedScore(target)
        clearInterval(interval)
      } else {
        setAnimatedScore(Math.round(step * frame))
      }
    }, 16)
    return () => clearInterval(interval)
  }, [data.score])

  const gradeClass =
    data.score >= 90 ? 'grade-s' :
    data.score >= 75 ? 'grade-a' :
    data.score >= 55 ? 'grade-b' :
    data.score >= 35 ? 'grade-c' :
    'grade-d'

  const grade =
    data.score >= 90 ? 'S' :
    data.score >= 75 ? 'A' :
    data.score >= 55 ? 'B' :
    data.score >= 35 ? 'C' : 'D'

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in splatter-bg min-h-[80vh] flex flex-col justify-center">
      <div className="text-center space-y-6">
        {/* Drill Complete */}
        <div>
          <span className="text-[11px] uppercase tracking-widest text-pb-text-muted font-bold">Drill Complete</span>
          <h2 className="text-[16px] font-bold text-white mt-1">{data.drillName}</h2>
        </div>

        {/* Score */}
        <div className="relative">
          <div className="font-display text-[80px] leading-none animate-count-up"
            style={{ color: '#39D353', textShadow: '0 0 40px rgba(57,211,83,0.3)' }}>
            {animatedScore}
          </div>
          <div className={`font-display text-3xl ${gradeClass} mt-1`}
            style={{ textShadow: '0 0 20px currentColor' }}>
            {grade}
          </div>
        </div>

        {/* Personal Best */}
        {data.personalBest && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-slide-up"
            style={{ background: 'rgba(227,179,65,0.15)', border: '1px solid rgba(227,179,65,0.3)' }}>
            <span className="text-lg">🏆</span>
            <span className="text-[13px] font-bold" style={{ color: '#E3B341' }}>New Personal Best!</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex justify-center gap-4">
          <div className="stat-card px-6">
            <div className="stat-card-value" style={{ color: '#A371F7' }}>+{data.xpEarned}</div>
            <div className="stat-card-label">XP Earned</div>
          </div>
          <div className="stat-card px-6">
            <div className="stat-card-value flex items-center justify-center gap-1">
              <span className="flame-active">🔥</span>
              <span style={{ color: '#E3B341' }}>{streak}</span>
            </div>
            <div className="stat-card-label">Day Streak</div>
          </div>
        </div>

        {/* PPI Axis Badge */}
        <div className="flex justify-center">
          <span className="tag-pill text-[11px]"
            style={{
              background: `${AXIS_COLORS[data.ppiAxis]}18`,
              color: AXIS_COLORS[data.ppiAxis],
            }}>
            {PPI_LABELS[data.ppiAxis]} improved
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <button type="button" onClick={onNextDrill}
          className="btn-primary w-full text-[15px]">
          <PlayIcon /> Next Drill
        </button>
        <button type="button" onClick={onDone}
          className="btn-secondary w-full">
          All Done
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE ICONS
// ═══════════════════════════════════════════════════════════════════════════

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#39D353" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ClockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  )
}
