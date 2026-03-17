import { useState, useMemo } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { SpiderChart } from '../ui/SpiderChart'
import { normalizeTeamForSpider, normalizeProForSpider, SPIDER_AXES } from '../../lib/analytics'
import { PRO_TEAMS } from '../../constants/pro-teams'
import type { TeamAggregate } from '../../store/selectors'

interface Props {
  teamStats: TeamAggregate
}

export function TeamSpiderChart({ teamStats }: Props) {
  const t = useTranslation()
  const [proIdx, setProIdx] = useState(0)
  const pro = PRO_TEAMS[proIdx]

  const datasets = useMemo(() => [
    {
      values: normalizeTeamForSpider(teamStats),
      fill: 'rgba(245, 158, 11, 0.2)',
      stroke: '#f59e0b',
      label: t('analytics.yourTeam'),
    },
    {
      values: normalizeProForSpider(pro.benchmarks),
      fill: `${pro.color}20`,
      stroke: pro.color,
      label: pro.name,
    },
  ], [teamStats, pro, t])

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{t('analytics.spiderChart')}</h3>
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
      <SpiderChart axes={SPIDER_AXES} datasets={datasets} />
    </div>
  )
}
