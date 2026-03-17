import { useTranslation } from '../../i18n/useTranslation'
import { TRAINING_RESOURCES } from '../../constants/training-resources'
import type { TeamAggregate } from '../../store/selectors'

interface Props {
  teamStats: TeamAggregate
}

export function TrainingResources({ teamStats: _teamStats }: Props) {
  const t = useTranslation()

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('analytics.videos')}</h3>
      <div className="space-y-2">
        {TRAINING_RESOURCES.map((res) => (
          <a
            key={res.id}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#D4A843]">{res.source}</span>
            </div>
            <p className="text-sm text-white font-medium">{res.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{res.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
