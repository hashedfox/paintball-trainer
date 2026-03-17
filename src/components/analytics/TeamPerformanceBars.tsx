import { useTranslation } from '../../i18n/useTranslation'
import { ProgressBar } from '../ui/ProgressBar'
import { getBenchmarkColor } from '../../constants/benchmarks'
import type { TeamAggregate } from '../../store/selectors'

interface Props {
  teamStats: TeamAggregate
}

export function TeamPerformanceBars({ teamStats }: Props) {
  const t = useTranslation()

  const bars = [
    { label: t('analytics.winRate'), value: teamStats.winPct, max: 100, key: 'winPct' as const, suffix: '%' },
    { label: t('analytics.survivalRate'), value: teamStats.survivalPct, max: 100, key: 'survivalPct' as const, suffix: '%' },
    { label: t('analytics.otbRate'), value: teamStats.otbPct, max: 100, key: 'otbPct' as const, suffix: '%' },
    { label: t('analytics.killsPerPoint'), value: teamStats.killsPP, max: 1.5, key: 'killsPP' as const },
    { label: t('analytics.g1PerPoint'), value: teamStats.g1PP, max: 0.5, key: 'g1PP' as const },
    { label: t('analytics.penaltiesPerMatch'), value: teamStats.penPM, max: 2, key: 'penPM' as const },
    { label: t('analytics.avgComms'), value: teamStats.avgComm, max: 5, key: 'avgComm' as const, suffix: '/5' },
  ]

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('analytics.teamPerf')}</h3>
      <div className="space-y-3">
        {bars.map((b) => (
          <ProgressBar
            key={b.key}
            label={b.label}
            value={b.value}
            max={b.max}
            color={getBenchmarkColor(b.key, b.value)}
            suffix={b.suffix}
          />
        ))}
      </div>
    </div>
  )
}
