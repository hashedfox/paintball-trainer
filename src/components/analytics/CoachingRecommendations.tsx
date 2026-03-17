import { useMemo } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { detectWeaknesses } from '../../lib/coaching'
import { TRAINING_RESOURCES } from '../../constants/training-resources'
import type { TeamAggregate } from '../../store/selectors'

interface Props {
  teamStats: TeamAggregate
}

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#22c55e',
}

const AREA_LABELS: Record<string, string> = {
  survival: 'Survival',
  otb: 'OTB Survival',
  kills: 'Kill Rate',
  discipline: 'Discipline',
  comms: 'Communication',
  g1: 'Breakout Kills',
}

export function CoachingRecommendations({ teamStats }: Props) {
  const t = useTranslation()
  const weaknesses = useMemo(() => detectWeaknesses(teamStats), [teamStats])

  if (weaknesses.length === 0) return null

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('analytics.coaching')}</h3>
      <div className="space-y-3">
        {weaknesses.map((w, i) => (
          <div key={i} className="p-3 rounded-lg bg-slate-800/50 border-l-2" style={{ borderColor: SEVERITY_COLORS[w.severity] }}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{ backgroundColor: SEVERITY_COLORS[w.severity] + '30', color: SEVERITY_COLORS[w.severity] }}
              >
                {t(`severity.${w.severity}`)}
              </span>
              <span className="text-xs font-bold text-white">{AREA_LABELS[w.area] || w.area}</span>
            </div>
            <div className="text-xs text-slate-400">
              Current: <span className="text-white font-mono">{typeof w.currentValue === 'number' && !Number.isInteger(w.currentValue) ? w.currentValue.toFixed(1) : w.currentValue}</span>
              {' → '}Target: <span className="text-green-400 font-mono">{w.targetValue}</span>
            </div>
            {w.drillIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {w.drillIds.map((id) => {
                  const res = TRAINING_RESOURCES.find((r) => r.id === id)
                  if (!res) return null
                  return (
                    <a
                      key={id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-slate-700 text-pb-amber px-2 py-0.5 rounded-full hover:bg-slate-600"
                    >
                      {res.title}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
