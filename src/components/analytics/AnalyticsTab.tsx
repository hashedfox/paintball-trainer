import { useTranslation } from '../../i18n/useTranslation'
import { useAppState } from '../../store/context'
import { useTeamStats, usePlayerStats } from '../../store/selectors'
import { GpiSection } from './GpiSection'
import { TeamPerformanceBars } from './TeamPerformanceBars'
import { TeamSpiderChart } from './TeamSpiderChart'
import { ProComparison } from './ProComparison'
import { CoachingRecommendations } from './CoachingRecommendations'
import { TrainingResources } from './TrainingResources'
import { ProHighlights } from './ProHighlights'
import { PlayerLeaderboard } from './PlayerLeaderboard'

export function AnalyticsTab() {
  const t = useTranslation()
  const state = useAppState()
  const teamStats = useTeamStats(state)
  const playerStats = usePlayerStats(state)
  const hasDummy = state.points.some((p) => p.isDummyData)
  const hasData = state.points.some((p) => p.teamStats.result !== null)

  if (!hasData && !hasDummy) {
    return (
      <div className="p-4 text-center text-slate-500 py-20">
        {t('analytics.noData')}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {hasDummy && (
        <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300">
          {t('points.demoData')}
        </div>
      )}

      <GpiSection teamStats={teamStats} />
      <TeamPerformanceBars teamStats={teamStats} />
      <TeamSpiderChart teamStats={teamStats} />
      <ProComparison teamStats={teamStats} />
      <PlayerLeaderboard playerStats={playerStats} />
      <CoachingRecommendations teamStats={teamStats} />
      <TrainingResources teamStats={teamStats} />
      <ProHighlights />

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-600 text-center italic px-4">
        {t('analytics.disclaimer')}
      </p>
    </div>
  )
}
