import { useState, useMemo } from 'react'
import { useAppState, useDispatch } from '../../store/context'
import { getCompositeScore, getDivisionFromPPI, PPI_LABELS, PPI_AXES, type PPIScores } from '../../types/ppi'
import { DIVISIONS, type Achievement, type BadgeCategory } from '../../types/achievement'
import { SpiderChart } from '../ui/SpiderChart'

const LEVEL_TITLES = ['Recruit', 'Rookie', 'Regular', 'Competitor', 'Veteran', 'Elite', 'Master', 'Champion', 'Legend', 'Icon']
const LEVEL_XP = [0, 500, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000]

const BADGE_TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#E3B341',
  diamond: '#58A6FF',
}

const CATEGORY_FILTERS: { label: string; value: BadgeCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Snap', value: 'snapShooting' },
  { label: 'Movement', value: 'movement' },
  { label: 'Field IQ', value: 'fieldIQ' },
  { label: 'Comms', value: 'communication' },
  { label: 'Gun Skills', value: 'gunSkills' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Meta', value: 'meta' },
]

const STREAK_MILESTONES = [
  { days: 7, label: '7 Day', tier: 'bronze' as const },
  { days: 30, label: '30 Day', tier: 'silver' as const },
  { days: 90, label: '90 Day', tier: 'gold' as const },
  { days: 365, label: '365 Day', tier: 'diamond' as const },
]

function getLevelFromXp(xp: number): number {
  for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP[i]) return i + 1
  }
  return 1
}

function getXpForNextLevel(level: number): number {
  if (level >= LEVEL_XP.length) return LEVEL_XP[LEVEL_XP.length - 1]
  return LEVEL_XP[level] // index = level because LEVEL_XP[0] = level 1 threshold
}

function getXpInCurrentLevel(xp: number, level: number): number {
  const base = LEVEL_XP[level - 1] || 0
  return xp - base
}

function getXpNeededForCurrentLevel(level: number): number {
  const base = LEVEL_XP[level - 1] || 0
  const next = LEVEL_XP[level] || LEVEL_XP[LEVEL_XP.length - 1]
  return next - base
}

function getBestAxis(scores: PPIScores): string {
  let best: keyof PPIScores = 'snapShooting'
  let max = 0
  for (const key of PPI_AXES) {
    if (scores[key] > max) {
      max = scores[key]
      best = key
    }
  }
  return PPI_LABELS[best]
}

// Generate heatmap data for last 30 days
function generateHeatmap(streak: number, lastActivityDate: string): boolean[] {
  const today = new Date()
  const days: boolean[] = []
  const lastActive = lastActivityDate ? new Date(lastActivityDate) : null

  for (let i = 29; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(day.getDate() - i)
    if (lastActive && streak > 0) {
      const diffDays = Math.floor((lastActive.getTime() - day.getTime()) / (1000 * 60 * 60 * 24))
      days.push(diffDays >= 0 && diffDays < streak)
    } else {
      days.push(false)
    }
  }
  return days
}

export function AchievementsSection() {
  const state = useAppState()
  const [badgeFilter, setBadgeFilter] = useState<BadgeCategory | 'all'>('all')
  const [showShareToast, setShowShareToast] = useState(false)
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const { ppiScores, ppiHistory, achievements, challengesState, trainingStreak, lastActivityDate, streakFreezeAvailable } = state

  const compositeScore = getCompositeScore(ppiScores)
  const currentDivision = getDivisionFromPPI(compositeScore)
  const currentDivisionInfo = DIVISIONS.find(d => d.name === currentDivision || d.shortName === currentDivision)
  const currentDivIndex = DIVISIONS.findIndex(d => d.name === currentDivision || d.shortName === currentDivision)

  // XP / Level
  const xp = challengesState.xp
  const level = getLevelFromXp(xp)
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
  const xpInLevel = getXpInCurrentLevel(xp, level)
  const xpNeeded = getXpNeededForCurrentLevel(level)
  const xpProgress = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100
  const nextLevelTitle = LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)]

  // Progress to next division
  const nextDiv = currentDivIndex < DIVISIONS.length - 1 ? DIVISIONS[currentDivIndex + 1] : null
  const divProgressPercent = currentDivisionInfo
    ? nextDiv
      ? Math.min(((compositeScore - currentDivisionInfo.minPPI) / (nextDiv.minPPI - currentDivisionInfo.minPPI)) * 100, 100)
      : 100
    : 0

  // Badge filtering
  const filteredBadges = useMemo(() =>
    achievements.filter(a => badgeFilter === 'all' || a.category === badgeFilter),
    [achievements, badgeFilter]
  )
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  // Previous PPI for rank-up card
  const prevPPI = ppiHistory.length > 1 ? ppiHistory[ppiHistory.length - 2]?.scores : null

  // Heatmap
  const heatmapDays = useMemo(() => generateHeatmap(trainingStreak, lastActivityDate), [trainingStreak, lastActivityDate])

  const handleShare = () => {
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Toast */}
      {showShareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg bg-[#39D353] text-[#0D1117] font-bold text-sm shadow-lg shadow-[#39D353]/30 animate-fade-in">
          Rank card copied! Ready to share.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[#E6EDF3]">Achievement Wall</h2>
        <div className="flex items-center gap-2 text-[11px] text-[#8B949E]">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#21262D] border border-[#30363D]">
            <span className="text-[#A371F7] font-bold">{unlockedCount}</span>
            <span>/</span>
            <span>{totalCount}</span>
            <span>unlocked</span>
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. DIVISION PROGRESSION TRACKER (Hero)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-5 relative overflow-hidden">
        {/* Ambient glow behind current division */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${currentDivisionInfo?.color || '#A371F7'}80 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8B949E]">Division Ladder</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8B949E]">Composite PPI</span>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: currentDivisionInfo?.color || '#A371F7' }}
              >
                {compositeScore}
              </span>
            </div>
          </div>

          {/* Division ladder — vertical */}
          <div className="flex flex-col gap-1.5 mb-5">
            {[...DIVISIONS].reverse().map((div, i) => {
              const isCurrent = div.id === currentDivisionInfo?.id
              const isPast = currentDivIndex > (DIVISIONS.length - 1 - i)
              return (
                <div
                  key={div.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300
                    ${isCurrent
                      ? 'bg-[#21262D] border border-[#30363D] shadow-lg'
                      : isPast
                        ? 'opacity-60'
                        : 'opacity-40'
                    }`}
                  style={isCurrent ? { boxShadow: `0 0 20px ${div.color}30, inset 0 0 20px ${div.color}08` } : {}}
                >
                  {/* Current indicator */}
                  <div className="w-5 flex justify-center">
                    {isCurrent ? (
                      <svg className="w-4 h-4 animate-pulse" fill={div.color} viewBox="0 0 20 20">
                        <path d="M10 3l-7 7h4v7h6v-7h4L10 3z" />
                      </svg>
                    ) : (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isPast ? div.color : '#484F58' }}
                      />
                    )}
                  </div>

                  {/* Division badge */}
                  <div
                    className="w-10 h-7 rounded flex items-center justify-center text-[11px] font-black tracking-wider"
                    style={{
                      backgroundColor: `${div.color}18`,
                      color: div.color,
                      border: `1px solid ${div.color}${isCurrent ? '60' : '30'}`,
                    }}
                  >
                    {div.shortName}
                  </div>

                  {/* Name + desc */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[13px] font-bold ${isCurrent ? '' : 'text-[#8B949E]'}`}
                        style={isCurrent ? { color: div.color } : {}}
                      >
                        {div.name}
                      </span>
                      <span className="text-[9px] text-[#484F58] tabular-nums">
                        PPI {div.minPPI}–{div.maxPPI}
                      </span>
                    </div>
                    {isCurrent && (
                      <p className="text-[10px] text-[#8B949E] mt-0.5">{div.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar to next division */}
          {nextDiv && (
            <div className="bg-[#0D1117] rounded-lg p-3 border border-[#30363D]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#8B949E]">
                  Progress to <span className="font-bold" style={{ color: nextDiv.color }}>{nextDiv.name}</span>
                </span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: currentDivisionInfo?.color }}>
                  {compositeScore} / {nextDiv.minPPI} PPI
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#21262D] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${divProgressPercent}%`,
                    background: `linear-gradient(90deg, ${currentDivisionInfo?.color || '#A371F7'}, ${nextDiv.color})`,
                    boxShadow: `0 0 8px ${currentDivisionInfo?.color || '#A371F7'}60`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-[#484F58]">{currentDivisionInfo?.shortName}</span>
                <span className="text-[9px] text-[#484F58]">{nextDiv.shortName}</span>
              </div>
            </div>
          )}
          {!nextDiv && (
            <div className="bg-[#0D1117] rounded-lg p-3 border border-[#30363D] text-center">
              <span className="text-[13px] font-bold text-[#39D353]">Maximum Division Reached</span>
              <p className="text-[10px] text-[#8B949E] mt-1">You are at the professional level.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. ACHIEVEMENT BADGE WALL
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-5">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8B949E] mb-3">Trophy Case</h3>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setBadgeFilter(cat.value)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200
                ${badgeFilter === cat.value
                  ? 'bg-[#A371F7] text-white shadow-md shadow-[#A371F7]/20'
                  : 'bg-[#21262D] text-[#8B949E] border border-[#30363D] hover:border-[#484F58] hover:text-[#E6EDF3]'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredBadges.map(badge => {
            const tierColor = BADGE_TIER_COLORS[badge.tier]
            const isHovered = hoveredBadge === badge.id
            return (
              <div
                key={badge.id}
                className={`relative rounded-xl p-3 text-center transition-all duration-300 cursor-pointer
                  ${badge.unlocked
                    ? 'bg-[#21262D] hover:bg-[#282E36]'
                    : 'bg-[#0D1117] opacity-50 grayscale'
                  }`}
                style={{
                  border: `2px solid ${badge.unlocked ? tierColor + '60' : '#30363D'}`,
                  boxShadow: badge.unlocked && isHovered
                    ? `0 0 16px ${tierColor}30, inset 0 0 12px ${tierColor}08`
                    : 'none',
                }}
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                {/* Tier indicator dot */}
                <div
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: tierColor }}
                />

                {/* Icon */}
                <div className="text-2xl mb-1.5 leading-none">
                  {badge.unlocked ? badge.icon : (
                    <span className="grayscale opacity-50">{badge.icon}</span>
                  )}
                </div>

                {/* Name */}
                <div className="text-[10px] font-bold text-[#E6EDF3] leading-tight mb-1.5 line-clamp-2 min-h-[24px]">
                  {badge.unlocked ? badge.name : '???'}
                </div>

                {/* Mini progress bar */}
                <div className="h-1 rounded-full bg-[#0D1117] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${badge.progress}%`,
                      backgroundColor: tierColor,
                    }}
                  />
                </div>

                {/* Hover tooltip */}
                {isHovered && badge.unlocked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] shadow-xl z-20 text-left">
                    <div className="text-[11px] font-bold text-[#E6EDF3] mb-0.5">{badge.name}</div>
                    <div className="text-[9px] text-[#8B949E] mb-1">{badge.description}</div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold uppercase"
                        style={{ color: tierColor }}
                      >
                        {badge.tier}
                      </span>
                      <span className="text-[9px] text-[#484F58]">{badge.progress}%</span>
                    </div>
                    {badge.unlockedDate && (
                      <div className="text-[8px] text-[#484F58] mt-1">
                        Unlocked {new Date(badge.unlockedDate).toLocaleDateString()}
                      </div>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0D1117] border-r border-b border-[#30363D] rotate-45 -mt-1" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-8 text-[#484F58] text-sm">
            No badges in this category yet.
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3. SHAREABLE RANK-UP CARD
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl overflow-hidden border border-[#30363D]">
        <div
          className="splatter-bg relative p-5"
          style={{
            background: 'linear-gradient(135deg, #0D1117 0%, #161B22 40%, #1a0e2e 100%)',
          }}
        >
          {/* Texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #A371F7 1px, transparent 1px),
                                radial-gradient(circle at 60% 70%, #39D353 1px, transparent 1px),
                                radial-gradient(circle at 80% 20%, #F85149 1px, transparent 1px),
                                radial-gradient(circle at 40% 80%, #E3B341 1px, transparent 1px)`,
              backgroundSize: '60px 60px, 80px 80px, 50px 50px, 70px 70px',
            }}
          />

          <div className="relative z-10">
            {/* Branding */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A371F7]">
                  PPI — Paintball Performance Index
                </div>
                <div className="text-[22px] font-black text-[#E6EDF3] leading-tight mt-1"
                  style={{ textShadow: `0 0 30px ${currentDivisionInfo?.color || '#A371F7'}40` }}
                >
                  RANK CARD
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border-2"
                style={{
                  color: currentDivisionInfo?.color,
                  borderColor: currentDivisionInfo?.color,
                  backgroundColor: `${currentDivisionInfo?.color}15`,
                  boxShadow: `0 0 20px ${currentDivisionInfo?.color}30`,
                }}
              >
                {currentDivisionInfo?.shortName}
              </div>
            </div>

            {/* Spider charts side by side */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {prevPPI && (
                <div className="flex-1 max-w-[160px]">
                  <div className="text-[9px] text-center text-[#484F58] uppercase tracking-wider mb-1 font-bold">Before</div>
                  <SpiderChart
                    labels={PPI_AXES.map(a => PPI_LABELS[a])}
                    values={PPI_AXES.map(a => prevPPI[a])}
                    color="#484F58"
                    size={140}
                  />
                </div>
              )}
              <div className={`${prevPPI ? 'flex-1 max-w-[160px]' : ''}`}>
                <div className="text-[9px] text-center uppercase tracking-wider mb-1 font-bold"
                  style={{ color: currentDivisionInfo?.color || '#A371F7' }}
                >
                  {prevPPI ? 'Current' : 'Your PPI'}
                </div>
                <SpiderChart
                  labels={PPI_AXES.map(a => PPI_LABELS[a])}
                  values={PPI_AXES.map(a => ppiScores[a])}
                  color={currentDivisionInfo?.color || '#A371F7'}
                  size={prevPPI ? 140 : 200}
                />
              </div>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#0D1117]/60 rounded-lg p-2.5 text-center border border-[#30363D]/50">
                <div className="text-[9px] uppercase tracking-wider text-[#8B949E] font-bold">Division</div>
                <div className="text-[15px] font-black mt-0.5" style={{ color: currentDivisionInfo?.color }}>
                  {currentDivision}
                </div>
              </div>
              <div className="bg-[#0D1117]/60 rounded-lg p-2.5 text-center border border-[#30363D]/50">
                <div className="text-[9px] uppercase tracking-wider text-[#8B949E] font-bold">Composite</div>
                <div className="text-[15px] font-black text-[#A371F7] mt-0.5">
                  {compositeScore}
                </div>
              </div>
              <div className="bg-[#0D1117]/60 rounded-lg p-2.5 text-center border border-[#30363D]/50">
                <div className="text-[9px] uppercase tracking-wider text-[#8B949E] font-bold">Best Axis</div>
                <div className="text-[15px] font-black text-[#39D353] mt-0.5 truncate">
                  {getBestAxis(ppiScores)}
                </div>
              </div>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2.5 rounded-lg font-bold text-[13px] text-[#0D1117] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${currentDivisionInfo?.color || '#A371F7'}, #39D353)`,
                boxShadow: `0 0 20px ${currentDivisionInfo?.color || '#A371F7'}30`,
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Rank Card
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          4. LEVEL & XP PROGRESS
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-5">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8B949E] mb-4">Level & XP</h3>

        <div className="flex items-center gap-4 mb-4">
          {/* Level badge */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(135deg, #A371F720, #A371F708)`,
                border: '2px solid #A371F740',
                boxShadow: '0 0 24px #A371F720',
              }}
            >
              <span className="text-2xl font-black text-[#A371F7] leading-none">{level}</span>
              <span className="text-[7px] font-bold text-[#8B949E] uppercase tracking-wider mt-0.5">Level</span>
            </div>
          </div>

          {/* Level info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] font-extrabold text-[#E6EDF3]">{levelTitle}</span>
              {level < LEVEL_TITLES.length && (
                <span className="text-[10px] text-[#484F58]">
                  Next: <span className="text-[#8B949E]">{nextLevelTitle}</span>
                </span>
              )}
            </div>

            {/* XP bar */}
            <div className="h-3 rounded-full bg-[#0D1117] overflow-hidden border border-[#30363D]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, #A371F7, #58A6FF)',
                  boxShadow: '0 0 8px #A371F760',
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-[#484F58] tabular-nums">{xpInLevel} / {xpNeeded} XP</span>
              <span className="text-[10px] text-[#484F58] tabular-nums">Total: {xp} XP</span>
            </div>
          </div>
        </div>

        {/* Level rewards preview — show upcoming milestones */}
        <div className="bg-[#0D1117] rounded-lg p-3 border border-[#30363D]">
          <div className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-2">Level Rewards</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEVEL_TITLES.slice(level - 1, level + 3).map((title, i) => {
              const lvl = level + i
              const isCurrentLevel = i === 0
              return (
                <div
                  key={title + lvl}
                  className={`rounded-lg p-2 text-center ${isCurrentLevel ? 'bg-[#A371F7]/10 border border-[#A371F7]/30' : 'bg-[#161B22] border border-[#30363D]'}`}
                >
                  <div className={`text-[10px] font-black ${isCurrentLevel ? 'text-[#A371F7]' : 'text-[#484F58]'}`}>
                    Lv.{lvl}
                  </div>
                  <div className={`text-[9px] font-bold mt-0.5 ${isCurrentLevel ? 'text-[#E6EDF3]' : 'text-[#8B949E]'}`}>
                    {title}
                  </div>
                  {!isCurrentLevel && (
                    <div className="text-[8px] text-[#484F58] mt-0.5">
                      {LEVEL_XP[lvl - 1] ? `${LEVEL_XP[lvl - 1]} XP` : 'Max'}
                    </div>
                  )}
                  {isCurrentLevel && (
                    <div className="text-[8px] text-[#A371F7] mt-0.5 font-bold">Current</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5. STREAK DISPLAY
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#8B949E]">Training Streak</h3>
          {streakFreezeAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#58A6FF]/15 border border-[#58A6FF]/30 text-[10px] font-bold text-[#58A6FF]">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.789l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
              Freeze Available
            </span>
          )}
        </div>

        {/* Streak hero */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${trainingStreak > 0 ? 'flame-active' : ''}`}
              style={{
                background: trainingStreak > 0
                  ? 'linear-gradient(135deg, #F8514920, #F0883E20, #E3B34120)'
                  : '#21262D',
                border: `2px solid ${trainingStreak > 0 ? '#F0883E50' : '#30363D'}`,
                boxShadow: trainingStreak > 0 ? '0 0 30px #F0883E25' : 'none',
              }}
            >
              <span className="text-3xl leading-none mb-0.5">
                {trainingStreak > 0 ? '\uD83D\uDD25' : '\u2744\uFE0F'}
              </span>
              <span className={`text-lg font-black leading-none ${trainingStreak > 0 ? 'text-[#F0883E]' : 'text-[#484F58]'}`}>
                {trainingStreak}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-[16px] font-extrabold text-[#E6EDF3]">
              {trainingStreak === 0
                ? 'Start Your Streak'
                : trainingStreak === 1
                  ? '1 Day Streak'
                  : `${trainingStreak} Day Streak`
              }
            </div>
            <p className="text-[11px] text-[#8B949E] mt-0.5">
              {trainingStreak === 0
                ? 'Log a training session to begin.'
                : `Keep training daily to maintain your streak.`
              }
            </p>

            {/* Streak milestones */}
            <div className="flex gap-2 mt-2">
              {STREAK_MILESTONES.map(ms => {
                const achieved = trainingStreak >= ms.days
                return (
                  <div
                    key={ms.days}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all
                      ${achieved
                        ? 'border'
                        : 'bg-[#0D1117] text-[#484F58] border border-[#30363D]'
                      }`}
                    style={achieved ? {
                      color: BADGE_TIER_COLORS[ms.tier],
                      borderColor: `${BADGE_TIER_COLORS[ms.tier]}50`,
                      backgroundColor: `${BADGE_TIER_COLORS[ms.tier]}15`,
                    } : {}}
                  >
                    {achieved && (
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {ms.label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Heatmap calendar — last 30 days */}
        <div className="bg-[#0D1117] rounded-lg p-3 border border-[#30363D]">
          <div className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-2">Last 30 Days</div>
          <div className="grid grid-cols-10 gap-1">
            {heatmapDays.map((active, i) => {
              const dayDate = new Date()
              dayDate.setDate(dayDate.getDate() - (29 - i))
              const isToday = i === 29
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm transition-colors ${isToday ? 'ring-1 ring-[#E6EDF3]/30' : ''}`}
                  style={{
                    backgroundColor: active ? '#39D353' : '#21262D',
                    opacity: active ? (0.4 + (i / 29) * 0.6) : 1,
                  }}
                  title={`${dayDate.toLocaleDateString()} — ${active ? 'Active' : 'Inactive'}`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[8px] text-[#484F58]">30 days ago</span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-[#484F58]">Less</span>
              <div className="w-2 h-2 rounded-sm bg-[#21262D]" />
              <div className="w-2 h-2 rounded-sm bg-[#39D353]/40" />
              <div className="w-2 h-2 rounded-sm bg-[#39D353]/70" />
              <div className="w-2 h-2 rounded-sm bg-[#39D353]" />
              <span className="text-[8px] text-[#484F58]">More</span>
            </div>
            <span className="text-[8px] text-[#484F58]">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
