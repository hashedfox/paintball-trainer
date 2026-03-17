import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { PRO_TEAMS } from '../../constants/pro-teams'
import type { TeamAggregate } from '../../store/selectors'

interface Props {
  teamStats: TeamAggregate
}

export function ProComparison({ teamStats }: Props) {
  const t = useTranslation()
  const [proIdx, setProIdx] = useState(0)
  const pro = PRO_TEAMS[proIdx]

  const comparisons = [
    { label: t('analytics.winRate'), yours: teamStats.winPct, theirs: pro.winPct, suffix: '%' },
    { label: t('analytics.survivalRate'), yours: teamStats.survivalPct, theirs: pro.survivalPct, suffix: '%' },
    { label: t('analytics.otbRate'), yours: teamStats.otbPct, theirs: pro.otbPct, suffix: '%' },
    { label: t('analytics.killsPerPoint'), yours: teamStats.killsPP, theirs: pro.killsPP },
    { label: t('analytics.g1PerPoint'), yours: teamStats.g1PP, theirs: pro.g1PP },
    { label: t('analytics.penaltiesPerMatch'), yours: teamStats.penPM, theirs: pro.penPM, inverted: true },
    { label: t('analytics.avgComms'), yours: teamStats.avgComm, theirs: pro.avgComm, suffix: '/5' },
  ]

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{t('analytics.proComparison')}</h3>
        <select
          value={proIdx}
          onChange={(e) => setProIdx(Number(e.target.value))}
          className="bg-slate-700 text-xs text-slate-200 rounded px-2 py-1 outline-none"
        >
          {PRO_TEAMS.map((team, i) => (
            <option key={team.id} value={i}>{team.name}</option>
          ))}
        </select>
      </div>

      {/* Team description */}
      <div className="mb-3 p-3 rounded-lg bg-slate-800/50 border-l-2" style={{ borderColor: pro.color }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: pro.color + '30', color: pro.color }}>
            {pro.tier}
          </span>
          <span className="text-sm font-bold text-white">{pro.name}</span>
        </div>
        <p className="text-xs text-slate-400">{pro.description}</p>
        {pro.roster.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Roster: {pro.roster.join(', ')}
          </p>
        )}
      </div>

      {/* Comparison rows */}
      <div className="space-y-2">
        {comparisons.map((c) => {
          const diff = c.inverted ? c.theirs - c.yours : c.yours - c.theirs
          const isGood = diff >= 0
          return (
            <div key={c.label} className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex-1 truncate">{c.label}</span>
              <span className="font-mono text-white w-12 text-right">
                {typeof c.yours === 'number' && !Number.isInteger(c.yours) ? c.yours.toFixed(1) : c.yours}
                {c.suffix || ''}
              </span>
              <span className={`w-4 text-center ${isGood ? 'text-green-400' : 'text-red-400'}`}>
                {isGood ? '↑' : '↓'}
              </span>
              <span className="font-mono text-slate-500 w-12 text-right">
                {typeof c.theirs === 'number' && !Number.isInteger(c.theirs) ? c.theirs.toFixed(1) : c.theirs}
                {c.suffix || ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
