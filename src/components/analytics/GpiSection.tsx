import { useMemo } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { computeGpi } from '../../lib/gpi'
import { CircularGauge } from '../ui/CircularGauge'
import type { TeamAggregate } from '../../store/selectors'

interface Props {
  teamStats: TeamAggregate
}

export function GpiSection({ teamStats }: Props) {
  const t = useTranslation()
  const gpi = useMemo(() => computeGpi(teamStats), [teamStats])

  const breakdown = [
    { label: t('analytics.survivalRate'), value: gpi.breakdown.survival, weight: '25%' },
    { label: t('analytics.otbRate'), value: gpi.breakdown.otb, weight: '20%' },
    { label: t('analytics.killsPerPoint'), value: gpi.breakdown.killsPerPoint, weight: '20%' },
    { label: t('analytics.discipline'), value: gpi.breakdown.discipline, weight: '15%' },
    { label: t('analytics.avgComms'), value: gpi.breakdown.comms, weight: '10%' },
    { label: t('analytics.winRate'), value: gpi.breakdown.winRate, weight: '10%' },
  ]

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-4">{t('analytics.gpi')}</h3>
      <div className="flex items-center gap-6">
        <CircularGauge value={gpi.overall} grade={gpi.grade} />
        <div className="flex-1 space-y-1.5">
          <div className="text-xs text-slate-400 mb-2">
            {t(`gpi.${gpi.grade}`)}
          </div>
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex-1 truncate">{b.label}</span>
              <span className="text-slate-600 w-8 text-right">{b.weight}</span>
              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-pb-amber"
                  style={{ width: `${b.value}%` }}
                />
              </div>
              <span className="text-white font-mono w-8 text-right">{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
