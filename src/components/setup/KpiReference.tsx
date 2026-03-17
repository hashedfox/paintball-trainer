import { useTranslation } from '../../i18n/useTranslation'
import { PLAYER_KPIS, TEAM_KPIS } from '../../constants/kpi-knowledge'
import { InfoBubble } from '../ui/InfoBubble'

export function KpiReference() {
  const t = useTranslation()

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{t('setup.kpiGuide')}</h2>

      <div className="space-y-2">
        <h3 className="text-xs text-slate-500 uppercase">Player Stats</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PLAYER_KPIS).map(([key, kpi]) => (
            <div key={key} className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-slate-300">
              <span>{kpi.emoji}</span>
              <span className="font-mono">{key.toUpperCase()}</span>
              <InfoBubble kpi={kpi} />
            </div>
          ))}
        </div>

        <h3 className="text-xs text-slate-500 uppercase mt-3">Team Stats</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TEAM_KPIS).map(([key, kpi]) => (
            <div key={key} className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-slate-300">
              <span>{kpi.emoji}</span>
              <span className="font-mono">{key.toUpperCase()}</span>
              <InfoBubble kpi={kpi} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
