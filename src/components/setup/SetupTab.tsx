import { useTranslation } from '../../i18n/useTranslation'
import { useAppState, useDispatch } from '../../store/context'
import { LanguageSelector } from '../ui/LanguageSelector'
import { RosterManager } from './RosterManager'
import { KpiReference } from './KpiReference'

export function SetupTab() {
  const t = useTranslation()
  const { teamName, opponentName } = useAppState()
  const dispatch = useDispatch()

  return (
    <div className="p-4 space-y-6">
      {/* Language */}
      <section>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{t('setup.language')}</h2>
        <LanguageSelector />
      </section>

      {/* Team Names */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{t('setup.teamName')}</h2>
        <input
          type="text"
          value={teamName}
          onChange={(e) => dispatch({ type: 'SET_TEAM_NAME', name: e.target.value })}
          className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white border border-pb-border focus:border-pb-amber outline-none"
        />
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{t('setup.opponent')}</h2>
        <input
          type="text"
          value={opponentName}
          onChange={(e) => dispatch({ type: 'SET_OPPONENT_NAME', name: e.target.value })}
          className="w-full bg-slate-700 rounded-lg px-3 py-2 text-white border border-pb-border focus:border-pb-amber outline-none"
        />
      </section>

      {/* Roster */}
      <RosterManager />

      {/* KPI Guide */}
      <KpiReference />
    </div>
  )
}
