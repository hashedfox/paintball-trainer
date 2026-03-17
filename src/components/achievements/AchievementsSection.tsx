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
  gold: '#D4A843',
  diamond: '#4A7BF7',
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg bg-[#2DD4A8] text-[#0A0E1A] font-bold text-sm shadow-lg shadow-[#2DD4A8]/30 animate-fade-in">
          Rank card copied! Ready to share.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[#F1F5F9]">Achievement Wall</h2>
        <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#2A3050] border border-[rgba(148, 163, 184, 0.08)]">
            <span className="text-[#7C5BF0] font-bold">{unlockedCount}</span>
            <span>/</span>
            <span>{totalCount}</span>
            <span>unlocked</span>
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          1. DIVISION PROGRESSION TRACKER (Hero)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-[#1A1F35] border border-[rgba(148, 163, 184, 0.08)] p-5 relative overflow-hidden">
        {/* Ambient glow behind current division */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${currentDivisionInfo?.color || '#7C5BF0'}80 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#94A3B8]">Division Ladder</h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#94A3B8]">Composite PPI</span>
              <span
                className="text-2xl font-black tabular-nums"
                style={{ color: currentDivisionInfo?.color || '#7C5BF0' }}
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
                      ? 'bg-[#2A3050] border border-[rgba(148, 163, 184, 0.08)] shadow-lg'
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
                        style={{ backgroundColor: isPast ? div.color : '#64748B' }}
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
                        className={`text-[13px] font-bold ${isCurrent ? '' : 'text-[#94A3B8]'}`}
                        style={isCurrent ? { color: div.color } : {}}
                      >
                        {div.name}
                      </span>
                      <span className="text-[9px] text-[#64748B] tabular-nums">
                        PPI {div.minPPI}–{div.maxPPI}
                      </span>
                    </div>
                    {isCurrent && (
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">{div.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar to next division */}
          {nextDiv && (
            <div className="bg-[#0A0E1A] rounded-lg p-3 border border-[rgba(148, 163, 184, 0.08)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#94A3B8]">
                  Progress to <span className="font-bold" style={{ color: nextDiv.color }}>{nextDiv.name}</span>
                </span>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: currentDivisionInfo?.color }}>
                  {compositeScore} / {nextDiv.minPPI} PPI
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#2A3050] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${divProgressPercent}%`,
                    background: `linear-gradient(90deg, ${currentDivisionInfo?.color || '#7C5BF0'}, ${nextDiv.color})`,
                    boxShadow: `0 0 8px ${currentDivisionInfo?.color || '#7C5BF0'}60`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-[#64748B]">{currentDivisionInfo?.shortName}</span>
                <span className="text-[9px] text-[#64748B]">{nextDiv.shortName}</span>
              </div>
            </div>
          )}
          {!nextDiv && (
            <div className="bg-[#0A0E1A] rounded-lg p-3 border border-[rgba(148, 163, 184, 0.08)] text-center">
              <span className="text-[13px] font-bold text-[#2DD4A8]">Maximum Division Reached</span>
              <p className="text-[10px] text-[#94A3B8] mt-1">You are at the professional level.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. ACHIEVEMENT BADGE WALL
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl bg-[#1A1F35] border border-[rgba(148, 163, 184, 0.08)] p-5">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3">Trophy Case</h3>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setBadgeFilter(cat.value)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200
                ${badgeFilter === cat.value
                  ? 'bg-[#7C5BF0] text-white shadow-md shadow-[#7C5BF0]/20'
                  : 'bg-[#2A3050] text-[#94A3B8] border border-[rgba(148, 163, 184, 0.08)] hover:border-[#64748B] hover:text-[#F1F5F9]'
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
                    ? 'bg-[#2A3050] hover:bg-[#2A3050]'
                    : 'bg-[#0A0E1A] opacity-50 grayscale'
                  }`}
                style={{
                  border: `2px solid ${badge.unlocked ? tierColor + '60' : 'rgba(148, 163, 184, 0.08)'}`,
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
                <div className="text-[10px] font-bold text-[#F1F5F9] leading-tight mb-1.5 line-clamp-2 min-h-[24px]">
                  {badge.unlocked ? badge.name : '???'}
                </div>

                {/* Mini progress bar */}
                <div className="h-1 rounded-full bg-[#0A0E1A] overflow-hidden">
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2.5 rounded-lg bg-[#0A0E1A] border border-[rgba(148, 163, 184, 0.08)] shadow-xl z-20 text-left">
                    <div className="text-[11px] font-bold text-[#F1F5F9] mb-0.5">{badge.name}</div>
                    <div className="text-[9px] text-[#94A3B8] mb-1">{badge.description}</div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold uppercase"
                        style={{ color: tierColor }}
                      >
                        {badge.tier}
                      </span>
                      <span className="text-[9px] text-[#64748B]">{badge.progress}%</span>
                    </div>
                    {badge.unlockedDate && (
                      <div className="text-[8px] text-[#64748B] mt-1">
                        Unlocked {new Date(badge.unlockedDate).toLocaleDateString()}
                      </div>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0A0E1A] border-r border-b border-[rgba(148, 163, 184, 0.08)] rotate-45 -mt-1" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-8 text-[#64748B] text-sm">
            No badges in this category yet.
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3. SHAREABLE RANK-UP CARD
         ═══════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl overflow-hidden border border-[rgba(148, 163, 184, 0.08)]">
        <div
          className="splatter-bg relative p-5"
          style={{
            background: 'linear-gradient(135deg, #0A0E1A 0%, #1A1F35 40%, #1a0e2e 100%)',
          }}
        >
          {/* Texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #7C5BF0 1px, transparent 1px),
                                radial-gradient(circle at 60% 70%, #2DD4A8 1px, transparent 1px),
                                radial-gradient(circle at 80% 20%, #EF4444 1px, transparent 1px),
                                radial-gradient(circle at 40% 80%, #D4A843 1px, transparent 1px)`,
              backgroundSize: '60px 60px, 80px 80px, 50px 50px, 70px 70px',
            }}
          />

          <div className="relative z-10">
            {/* Branding */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7C5BF0]">
                  PPI — Paintball Performance Index
                </div>
                <div className="text-[22px] font-black text-[#F1F5F9] leading-tight mt-1"
                  style={{ textShadow: `0 0 30px ${currentDivisionInfo?.color || '#7C5BF0'}40` }}
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
                  <div className="text-[9px] text-center text-[#64748B] uppercase tracking-wider mb-1 font-bold">Before</div>
                  <SpiderChart
                    labels={PPI_AXES.map(a => PPI_LABELS[a])}
                    values={PPI_AXES.map(a => prevPPI[a])}
                    color="#64748B"
                    size={140}
                  />
                </div>
              )}
              <div className={`${prevPPI ? 'flex-1 max-w-[160px]' : ''}`}>
                <div className="text-[9px] text-center uppercase tracking-wider mb-1 font-bold"
                  style={{ color: currentDivisionInfo?.color || '#7C5BF0' }}
                >
                  {prevPPI ? 'Current' : 'Your PPI'}
                </div>
                <SpiderChart
                  labels={PPI_AXES.map(a => PPI_LABELS[a])}
                  values={PPI_AXES.map(a => ppiScores[a])}
                  color={currentDivisionInfo?.color || '#7C5BF0'}
                  size={prevPPI ? 140 : 200}
                />
              </div>
            </div>

            {/* Key stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#0A0E1A]/60 rounded-lg p-2.5 text-center border border-[rgba(148, 163, 184, 0.08)]/50">
                <div className="text-[9px] uppercase tracking-wider text-[#94A3B8] font-bold">Division</div>
                <div className="text-[15px] font-black mt-0.5" style={{ color: currentDivisionInfo?.color }}>
                  {currentDivision}
                </div>
              </div>
              <div className="bg-[#0A0E1A]/60 rounded-lg p-2.5 text-center border border-[rgba(148, 163, 184, 0.08)]/50">
                <div className="text-[9px] uppercase tracking-wider text-[#94A3B8] font-bold">Composite</div>
                <div className="text-[15px] font-black text-[#7C5BF0] mt-0.5">
                  {compositeScore}
                </div>
              </div>
              <div className="bg-[#0A0E1A]/60 rounded-lg p-2.5 text-center border border-[rgba(148, 163, 184, 0.08)]/50">
                <div className="text-[9px] uppercase tracking-wider text-[#94A3B8] font-bold">Best Axis</div>
                <div className="text-[15px] font-black text-[#2DD4A8] mt-0.5 truncate">
                  {getBestAxis(ppiScores)}
                </div>
              </div>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2.5 rounded-lg font-bold text-[13px] text-[#0A0E1A] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${currentDivisionInfo?.color || '#7C5BF0'}, #2DD4A8)`,
                boxShadow: `0 0 20px ${currentDivisionInfo?.color || '#7C5BF0'}30`,
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
      <div className="rounded-xl bg-[#1A1F35] border border-[rgba(148, 163, 184, 0.08)] p-5">
        <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#94A3B8] mb-4">Level & XP</h3>

        <div className="flex items-center gap-4 mb-4">
          {/* Level badge */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(135deg, #7C5BF020, #7C5BF008)`,
                border: '2px solid #7C5BF040',
                boxShadow: '0 0 24px #7C5BF020',
              }}
            >
              <span className="text-2xl font-black text-[#7C5BF0] leading-none">{level}</span>
              <span className="text-[7px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">Level</span>
            </div>
          </div>

          {/* Level info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] font-extrabold text-[#F1F5F9]">{levelTitle}</span>
              {level < LEVEL_TITLES.length && (
                <span className="text-[10px] text-[#64748B]">
                  Next: <span className="text-[#94A3B8]">{nextLevelTitle}</span>
                </span>
              )}
            </div>

            {/* XP bar */}
            <div className="h-3 rounded-full bg-[#0A0E1A] overflow-hidden border border-[rgba(148, 163, 184, 0.08)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, #7C5BF0, #4A7BF7)',
                  boxShadow: '0 0 8px #7C5BF060',
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-[#64748B] tabular-nums">{xpInLevel} / {xpNeeded} XP</span>
              <span className="text-[10px] text-[#64748B] tabular-nums">Total: {xp} XP</span>
            </div>
          </div>
        </div>

        {/* Level rewards preview — show upcoming milestones */}
        <div className="bg-[#0A0E1A] rounded-lg p-3 border border-[rgba(148, 163, 184, 0.08)]">
          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Level Rewards</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEVEL_TITLES.slice(level - 1, level + 3).map((title, i) => {
              const lvl = level + i
              const isCurrentLevel = i === 0
              return (
                <div
                  key={title + lvl}
                  className={`rounded-lg p-2 text-center ${isCurrentLevel ? 'bg-[#7C5BF0]/10 border border-[#7C5BF0]/30' : 'bg-[#1A1F35] border border-[rgba(148, 163, 184, 0.08)]'}`}
                >
                  <div className={`text-[10px] font-black ${isCurrentLevel ? 'text-[#7C5BF0]' : 'text-[#64748B]'}`}>
                    Lv.{lvl}
                  </div>
                  <div className={`text-[9px] font-bold mt-0.5 ${isCurrentLevel ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'}`}>
                    {title}
                  </div>
                  {!isCurrentLevel && (
                    <div className="text-[8px] text-[#64748B] mt-0.5">
                      {LEVEL_XP[lvl - 1] ? `${LEVEL_XP[lvl - 1]} XP` : 'Max'}
                    </div>
                  )}
                  {isCurrentLevel && (
                    <div className="text-[8px] text-[#7C5BF0] mt-0.5 font-bold">Current</div>
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
      <div className="rounded-xl bg-[#1A1F35] border border-[rgba(148, 163, 184, 0.08)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#94A3B8]">Training Streak</h3>
          {streakFreezeAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4A7BF7]/15 border border-[#4A7BF7]/30 text-[10px] font-bold text-[#4A7BF7]">
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
                  ? 'linear-gradient(135deg, #EF444420, #F59E0B20, #D4A84320)'
                  : '#2A3050',
                border: `2px solid ${trainingStreak > 0 ? '#F59E0B50' : 'rgba(148, 163, 184, 0.08)'}`,
                boxShadow: trainingStreak > 0 ? '0 0 30px #F59E0B25' : 'none',
              }}
            >
              <span className="text-3xl leading-none mb-0.5">
                {trainingStreak > 0 ? '\uD83D\uDD25' : '\u2744\uFE0F'}
              </span>
              <span className={`text-lg font-black leading-none ${trainingStreak > 0 ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}>
                {trainingStreak}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-[16px] font-extrabold text-[#F1F5F9]">
              {trainingStreak === 0
                ? 'Start Your Streak'
                : trainingStreak === 1
                  ? '1 Day Streak'
                  : `${trainingStreak} Day Streak`
              }
            </div>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
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
                        : 'bg-[#0A0E1A] text-[#64748B] border border-[rgba(148, 163, 184, 0.08)]'
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
        <div className="bg-[#0A0E1A] rounded-lg p-3 border border-[rgba(148, 163, 184, 0.08)]">
          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Last 30 Days</div>
          <div className="grid grid-cols-10 gap-1">
            {heatmapDays.map((active, i) => {
              const dayDate = new Date()
              dayDate.setDate(dayDate.getDate() - (29 - i))
              const isToday = i === 29
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm transition-colors ${isToday ? 'ring-1 ring-[#F1F5F9]/30' : ''}`}
                  style={{
                    backgroundColor: active ? '#2DD4A8' : '#2A3050',
                    opacity: active ? (0.4 + (i / 29) * 0.6) : 1,
                  }}
                  title={`${dayDate.toLocaleDateString()} — ${active ? 'Active' : 'Inactive'}`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[8px] text-[#64748B]">30 days ago</span>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-[#64748B]">Less</span>
              <div className="w-2 h-2 rounded-sm bg-[#2A3050]" />
              <div className="w-2 h-2 rounded-sm bg-[#2DD4A8]/40" />
              <div className="w-2 h-2 rounded-sm bg-[#2DD4A8]/70" />
              <div className="w-2 h-2 rounded-sm bg-[#2DD4A8]" />
              <span className="text-[8px] text-[#64748B]">More</span>
            </div>
            <span className="text-[8px] text-[#64748B]">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
