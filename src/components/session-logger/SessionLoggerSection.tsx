import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { createNewSession, computeSessionStats, type PointLog, type SessionType, type EliminationType, type PointResult } from '../../types/session'
import { DEFAULT_FIELD_LAYOUT, type Bunker } from '../../types/layout'

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSION_TYPES: { value: SessionType; label: string; icon: string }[] = [
  { value: 'practice', label: 'Practice', icon: '🎯' },
  { value: 'scrimmage', label: 'Scrimmage', icon: '⚔️' },
  { value: 'tournament', label: 'Tournament', icon: '🏆' },
]

const ELIMINATION_TYPES: { value: EliminationType; label: string }[] = [
  { value: 'shot-out', label: 'Shot out' },
  { value: 'bunkered', label: 'Bunkered' },
  { value: 'run-through', label: 'Run-through' },
  { value: 'trade', label: 'Trade' },
]

const AUTO_ADVANCE_MS = 3000

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Bunker tap-target on the mini field */
function BunkerTarget({
  bunker,
  selected,
  heatColor,
  onTap,
}: {
  bunker: Bunker
  selected: boolean
  heatColor?: string
  onTap: (id: string) => void
}) {
  return (
    <button
      onClick={() => onTap(bunker.id)}
      className="absolute flex items-center justify-center rounded-lg transition-all active:scale-90"
      style={{
        left: `${bunker.x}%`,
        top: `${bunker.y}%`,
        transform: 'translate(-50%, -50%)',
        width: 44,
        height: 44,
        background: selected
          ? '#7C5BF0'
          : heatColor || 'rgba(148, 163, 184, 0.08)',
        border: selected ? '2px solid #fff' : '2px solid #64748B',
        boxShadow: selected ? '0 0 12px #7C5BF080' : undefined,
      }}
      title={bunker.name}
    >
      <span className="text-[10px] font-bold text-white leading-none select-none">
        {bunker.shortName}
      </span>
    </button>
  )
}

/** Mini field layout with tap-targets */
function MiniField({
  bunkers,
  selectedBunker,
  heatmap,
  onBunkerTap,
}: {
  bunkers: Bunker[]
  selectedBunker: string
  heatmap?: Map<string, string>
  onBunkerTap: (id: string) => void
}) {
  return (
    <div className="relative w-full rounded-xl border border-[rgba(148, 163, 184, 0.08)] bg-[#0A0E1A] overflow-hidden" style={{ aspectRatio: '5/3' }}>
      {/* Field lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[1px] h-full bg-[#2A3050]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[1px] w-full bg-[#2A3050]" />
      </div>
      {/* 50-yard line */}
      <div className="absolute left-0 right-0 top-[30%] h-[1px] bg-[rgba(148, 163, 184, 0.08)] opacity-40" />

      {/* Start box */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[12%] border border-dashed border-[rgba(148, 163, 184, 0.08)] rounded-t-md" />

      {bunkers.map((b) => (
        <BunkerTarget
          key={b.id}
          bunker={b}
          selected={selectedBunker === b.id}
          heatColor={heatmap?.get(b.id)}
          onTap={onBunkerTap}
        />
      ))}
    </div>
  )
}

/** Voice note floating button */
function VoiceNoteButton({ onRecordComplete }: { onRecordComplete: (url: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(() => {
    setRecording(true)
    setElapsed(0)
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= 10) {
          stopRecording()
          return 10
        }
        return prev + 1
      })
    }, 1000)
  }, [])

  const stopRecording = useCallback(() => {
    setRecording(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    // In a real app this would finalize the recording
    onRecordComplete(`voice-${Date.now()}`)
  }, [onRecordComplete])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-2">
      {recording && (
        <div className="animate-fade-in rounded-lg bg-[#1A1F35] border border-[#EF4444] px-3 py-1.5 text-xs font-semibold text-[#EF4444]">
          Recording... {10 - elapsed}s
        </div>
      )}
      <button
        onPointerDown={startRecording}
        onPointerUp={stopRecording}
        onPointerLeave={() => recording && stopRecording()}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
          recording
            ? 'bg-[#EF4444] animate-pulse-glow'
            : 'bg-[#2A3050] border border-[rgba(148, 163, 184, 0.08)]'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={recording ? '#fff' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    </div>
  )
}

/** Star rating input */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="p-1 transition-transform active:scale-90"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={star <= value ? '#D4A843' : 'none'}
            stroke={star <= value ? '#D4A843' : '#64748B'}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  )
}

/** Rolling stats pit board */
function PitBoard({ session }: { session: ReturnType<typeof computeSessionStats> }) {
  const totalPoints = session.totalPoints
  const winRate = totalPoints > 0 ? Math.round((session.wins / totalPoints) * 100) : 0
  const survivalPct = Math.round(session.survivalRate * 100)

  return (
    <div className="animate-fade-in space-y-3">
      <div className="section-header mb-2">Pit Board</div>
      <div className="grid grid-cols-4 gap-2">
        <div className="stat-card">
          <div className="stat-card-value">{totalPoints}</div>
          <div className="stat-card-label">Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: winRate >= 50 ? '#2DD4A8' : '#EF4444' }}>
            {winRate}%
          </div>
          <div className="stat-card-label">Win Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{session.wins}</div>
          <div className="stat-card-label">Wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: '#2DD4A8' }}>
            {survivalPct}%
          </div>
          <div className="stat-card-label">Survived</div>
        </div>
      </div>

      {/* Win/Loss bar */}
      {totalPoints > 0 && (
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${winRate}%`, background: '#2DD4A8' }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${100 - winRate}%`, background: '#EF4444' }}
          />
        </div>
      )}

      {/* Focus area */}
      {session.focusArea && (
        <div className="panel-inner p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-1">
            Today&apos;s Focus
          </div>
          <div className="text-sm font-bold text-[#7C5BF0]">
            {session.focusArea.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
          </div>
          {(() => {
            const rated = session.points.filter((p) => p.focusRating != null)
            if (rated.length === 0) return null
            const avg = rated.reduce((s, p) => s + (p.focusRating || 0), 0) / rated.length
            return (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs text-[#94A3B8]">Avg rating:</span>
                <span className="font-stat text-sm text-[#D4A843]">{avg.toFixed(1)}</span>
                <span className="text-xs text-[#94A3B8]">/ 5</span>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

/** Bunker heatmap overlay */
function BunkerHeatmap({ points, bunkers }: { points: PointLog[]; bunkers: Bunker[] }) {
  const heatmap = useMemo(() => {
    const map = new Map<string, { elims: number; survived: number }>()
    for (const p of points) {
      if (p.eliminationBunker) {
        const entry = map.get(p.eliminationBunker) || { elims: 0, survived: 0 }
        entry.elims++
        map.set(p.eliminationBunker, entry)
      }
    }
    // Count survived points — no bunker logged means survived
    for (const p of points) {
      if (p.eliminationType === 'survived') {
        // survived doesn't map to a specific bunker, skip
      }
    }
    return map
  }, [points])

  const colorMap = useMemo(() => {
    const cm = new Map<string, string>()
    for (const [bunkerId, stats] of heatmap) {
      const intensity = Math.min(stats.elims / 5, 1)
      // Red for frequent elimination spots
      cm.set(bunkerId, `rgba(248, 81, 73, ${0.3 + intensity * 0.5})`)
    }
    return cm
  }, [heatmap])

  if (points.length < 2) return null

  return (
    <div className="animate-fade-in space-y-2">
      <div className="section-header">Elimination Heatmap</div>
      <MiniField
        bunkers={bunkers}
        selectedBunker=""
        heatmap={colorMap}
        onBunkerTap={() => {}}
      />
      <div className="flex items-center gap-3 justify-center">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: 'rgba(248, 81, 73, 0.4)' }} />
          <span className="text-[10px] text-[#94A3B8]">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm" style={{ background: 'rgba(248, 81, 73, 0.8)' }} />
          <span className="text-[10px] text-[#94A3B8]">High</span>
        </div>
      </div>
    </div>
  )
}

// ─── Point Log flow step ─────────────────────────────────────────────────────

type LogStep = 'result' | 'bunker'

// ─── Main Component ──────────────────────────────────────────────────────────

export function SessionLoggerSection() {
  const state = useAppState()
  const dispatch = useDispatch()

  // Session start form
  const [selectedType, setSelectedType] = useState<SessionType>('practice')

  // 2-tap logging state
  const [logStep, setLogStep] = useState<LogStep>('result')
  const [pendingResult, setPendingResult] = useState<PointResult | null>(null)
  const [selectedBunker, setSelectedBunker] = useState('')
  const [selectedElimType, setSelectedElimType] = useState<EliminationType | null>(null)
  const [focusRating, setFocusRating] = useState(0)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)

  // View toggle: logger vs stats
  const [activeTab, setActiveTab] = useState<'log' | 'stats' | 'heatmap'>('log')

  // Derived
  const activeSession = state.sessions.find((s) => s.id === state.activeSessionId) ?? null
  const computedSession = activeSession ? computeSessionStats(activeSession) : null
  const layout = DEFAULT_FIELD_LAYOUT
  const pointCount = activeSession ? activeSession.points.length : 0

  // ── Auto-advance timeout for bunker step ──
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [])

  const startAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = setTimeout(() => {
      commitPoint('')
    }, AUTO_ADVANCE_MS)
  }, []) // commitPoint is stable via ref pattern below

  // ── Commit the point ──
  const commitPoint = useCallback(
    (bunkerOverride?: string) => {
      if (!activeSession || !pendingResult) return
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)

      const bunkerId = bunkerOverride ?? selectedBunker
      const elimType: EliminationType =
        bunkerId === '' ? 'survived' : selectedElimType || 'shot-out'

      const point: PointLog = {
        id: `pt-${Date.now()}`,
        pointNumber: pointCount + 1,
        result: pendingResult,
        eliminationBunker: bunkerId,
        eliminationType: elimType,
        focusRating: focusRating > 0 ? focusRating : undefined,
        timestamp: Date.now(),
      }

      dispatch({ type: 'LOG_POINT', sessionId: activeSession.id, point })
      dispatch({ type: 'RECORD_ACTIVITY' })
      dispatch({ type: 'ADD_XP', amount: 200 })

      // Reset
      setLogStep('result')
      setPendingResult(null)
      setSelectedBunker('')
      setSelectedElimType(null)
      setFocusRating(0)
    },
    [activeSession, pendingResult, selectedBunker, selectedElimType, focusRating, pointCount, dispatch],
  )

  // Patch startAutoAdvance to use latest commitPoint
  const commitPointRef = useRef(commitPoint)
  commitPointRef.current = commitPoint

  const handleResultTap = useCallback(
    (result: PointResult) => {
      setPendingResult(result)
      setLogStep('bunker')
      // Start auto-advance timer
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      autoAdvanceTimer.current = setTimeout(() => {
        commitPointRef.current('')
      }, AUTO_ADVANCE_MS)
    },
    [],
  )

  const handleBunkerTap = useCallback(
    (bunkerId: string) => {
      setSelectedBunker(bunkerId)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      // Brief delay so user sees selection, then commit
      autoAdvanceTimer.current = setTimeout(() => {
        commitPointRef.current(bunkerId)
      }, 600)
    },
    [],
  )

  const handleSurvivedTap = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    commitPointRef.current('')
  }, [])

  const handleStartSession = useCallback(() => {
    const session = createNewSession(selectedType, layout.id, state.todaysFocusAxis)
    dispatch({ type: 'START_SESSION', session })
    dispatch({ type: 'RECORD_ACTIVITY' })
  }, [selectedType, layout.id, state.todaysFocusAxis, dispatch])

  const handleEndSession = useCallback(() => {
    if (!activeSession) return
    dispatch({ type: 'END_SESSION', sessionId: activeSession.id })
    setShowConfirmEnd(false)
    setActiveTab('log')
  }, [activeSession, dispatch])

  const handleVoiceNote = useCallback(
    (_url: string) => {
      // In production: attach to latest point or session notes
    },
    [],
  )

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: No active session → Start screen
  // ────────────────────────────────────────────────────────────────────────────

  if (!activeSession) {
    return (
      <div className="animate-fade-in space-y-6 px-4 py-6">
        <div>
          <h2 className="font-display text-2xl text-[#F1F5F9]">Live Session</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">Log points in 2 taps during games</p>
        </div>

        {/* Session Type */}
        <div className="space-y-2">
          <div className="section-header">Session Type</div>
          <div className="grid grid-cols-3 gap-3">
            {SESSION_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all active:scale-95 ${
                  selectedType === t.value
                    ? 'border-[#2DD4A8] bg-[#2DD4A812]'
                    : 'border-[rgba(148, 163, 184, 0.08)] bg-[#1A1F35]'
                }`}
              >
                <span className="text-2xl">{t.icon}</span>
                <span
                  className={`text-sm font-semibold ${
                    selectedType === t.value ? 'text-[#2DD4A8]' : 'text-[#94A3B8]'
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Layout */}
        <div className="card-gaming p-4 space-y-2">
          <div className="section-header">Field Layout</div>
          <div className="text-sm font-semibold text-[#F1F5F9]">{layout.name}</div>
          <div className="text-xs text-[#94A3B8]">{layout.event} &middot; {layout.season}</div>
        </div>

        {/* Focus Area */}
        <div className="card-gaming p-4 space-y-2">
          <div className="section-header">Today&apos;s Focus</div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#7C5BF0]" />
            <span className="text-sm font-bold text-[#7C5BF0]">
              {state.todaysFocusAxis.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Rate yourself on this after each point
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartSession}
          className="btn-primary w-full text-lg glow-green"
          style={{ minHeight: 56 }}
        >
          Start Session
        </button>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER: Active session
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-full flex-col bg-[#0A0E1A]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[rgba(148, 163, 184, 0.08)] bg-[#1A1F35] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="tag-pill tag-green font-stat text-xs">
            PT {pointCount}
          </div>
          <div className="text-xs text-[#94A3B8]">
            {activeSession.type.charAt(0).toUpperCase() + activeSession.type.slice(1)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {computedSession && computedSession.totalPoints > 0 && (
            <span
              className="font-stat text-sm"
              style={{
                color:
                  computedSession.wins >= computedSession.losses ? '#2DD4A8' : '#EF4444',
              }}
            >
              {computedSession.wins}W-{computedSession.losses}L
            </span>
          )}
        </div>
      </div>

      {/* Tab bar: Log / Stats / Heatmap */}
      <div className="flex border-b border-[rgba(148, 163, 184, 0.08)] bg-[#1A1F35]">
        {(['log', 'stats', 'heatmap'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab
                ? 'text-[#2DD4A8] border-b-2 border-[#2DD4A8]'
                : 'text-[#64748B]'
            }`}
          >
            {tab === 'log' ? 'Logger' : tab === 'stats' ? 'Pit Board' : 'Heatmap'}
          </button>
        ))}
      </div>

      {/* ── Logger Tab ── */}
      {activeTab === 'log' && (
        <div className="flex flex-1 flex-col px-4 py-4">
          {/* Step 0: WIN / LOSS buttons */}
          {logStep === 'result' && (
            <div className="animate-fade-in flex flex-1 flex-col gap-4">
              <button
                onClick={() => handleResultTap('win')}
                className="win-btn flex flex-1 items-center justify-center"
                style={{ minHeight: 120 }}
              >
                WIN
              </button>
              <button
                onClick={() => handleResultTap('loss')}
                className="loss-btn flex flex-1 items-center justify-center"
                style={{ minHeight: 120 }}
              >
                LOSS
              </button>

              {/* Optional Enrichment — secondary, below main buttons */}
              {pointCount > 0 && (
                <div className="mt-2 space-y-3 opacity-70">
                  <div className="section-header">Last point quick-add</div>

                  {/* Recent point focus rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">Focus rating</span>
                    <StarRating
                      value={focusRating}
                      onChange={setFocusRating}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Bunker selection */}
          {logStep === 'bunker' && (
            <div className="animate-slide-up flex flex-1 flex-col gap-4">
              {/* Result indicator */}
              <div className="flex items-center justify-center gap-2">
                <div
                  className="rounded-lg px-4 py-1 text-sm font-bold"
                  style={{
                    background: pendingResult === 'win' ? '#2DD4A820' : '#EF444420',
                    color: pendingResult === 'win' ? '#2DD4A8' : '#EF4444',
                  }}
                >
                  {pendingResult === 'win' ? 'WIN' : 'LOSS'} logged
                </div>
                <span className="text-xs text-[#64748B]">
                  Tap bunker or wait {(AUTO_ADVANCE_MS / 1000).toFixed(0)}s
                </span>
              </div>

              {/* Survived button — pre-selected */}
              <button
                onClick={handleSurvivedTap}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all active:scale-95 ${
                  selectedBunker === ''
                    ? 'border-[#2DD4A8] bg-[#2DD4A815] text-[#2DD4A8]'
                    : 'border-[rgba(148, 163, 184, 0.08)] bg-[#1A1F35] text-[#94A3B8]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Survived
              </button>

              {/* Mini field for bunker selection */}
              <div className="flex-1">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-[#64748B] font-semibold text-center">
                  Tap where you were eliminated
                </div>
                <MiniField
                  bunkers={layout.bunkers}
                  selectedBunker={selectedBunker}
                  onBunkerTap={handleBunkerTap}
                />
              </div>

              {/* Elimination type quick-select (optional enrichment) */}
              {selectedBunker && (
                <div className="animate-fade-in space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold text-center">
                    How? (optional)
                  </div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {ELIMINATION_TYPES.map((et) => (
                      <button
                        key={et.value}
                        onClick={() => setSelectedElimType(et.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                          selectedElimType === et.value
                            ? 'bg-[#7C5BF020] text-[#7C5BF0] border border-[#7C5BF0]'
                            : 'bg-[#2A3050] text-[#94A3B8] border border-[rgba(148, 163, 184, 0.08)]'
                        }`}
                      >
                        {et.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Stats (Pit Board) Tab ── */}
      {activeTab === 'stats' && computedSession && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <PitBoard session={computedSession} />

          {/* Recent points feed */}
          {activeSession.points.length > 0 && (
            <div className="space-y-2">
              <div className="section-header">Recent Points</div>
              <div className="space-y-1.5">
                {[...activeSession.points]
                  .reverse()
                  .slice(0, 10)
                  .map((pt) => (
                    <div
                      key={pt.id}
                      className="flex items-center justify-between rounded-lg bg-[#1A1F35] border border-[rgba(148, 163, 184, 0.08)] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: pt.result === 'win' ? '#2DD4A8' : '#EF4444',
                          }}
                        />
                        <span className="font-stat text-xs text-[#F1F5F9]">
                          Pt {pt.pointNumber}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: pt.result === 'win' ? '#2DD4A8' : '#EF4444',
                          }}
                        >
                          {pt.result.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {pt.eliminationBunker && (
                          <span className="tag-pill tag-red text-[10px]">
                            {layout.bunkers.find((b) => b.id === pt.eliminationBunker)?.shortName || pt.eliminationBunker}
                          </span>
                        )}
                        {pt.eliminationType === 'survived' && (
                          <span className="tag-pill tag-green text-[10px]">Survived</span>
                        )}
                        {pt.focusRating != null && (
                          <span className="text-[10px] text-[#D4A843]">
                            {'★'.repeat(pt.focusRating)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Heatmap Tab ── */}
      {activeTab === 'heatmap' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {activeSession.points.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-3xl mb-2 opacity-30">🎯</div>
              <p className="text-sm text-[#64748B]">
                Log a few more points to see your heatmap
              </p>
            </div>
          ) : (
            <BunkerHeatmap points={activeSession.points} bunkers={layout.bunkers} />
          )}
        </div>
      )}

      {/* Voice note FAB */}
      <VoiceNoteButton onRecordComplete={handleVoiceNote} />

      {/* End Session */}
      <div className="border-t border-[rgba(148, 163, 184, 0.08)] bg-[#1A1F35] px-4 py-3">
        {!showConfirmEnd ? (
          <button
            onClick={() => setShowConfirmEnd(true)}
            className="btn-secondary w-full text-[#EF4444] border-[#EF444440]"
          >
            End Session
          </button>
        ) : (
          <div className="flex gap-3 animate-fade-in">
            <button
              onClick={() => setShowConfirmEnd(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleEndSession}
              className="btn-danger flex-1"
            >
              End Session ({pointCount} pts)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
