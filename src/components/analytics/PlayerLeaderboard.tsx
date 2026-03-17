import { useState, useMemo } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { SpiderChart } from '../ui/SpiderChart'
import { normalizePlayerForSpider, normalizeProForSpider, SPIDER_AXES } from '../../lib/analytics'
import { PRO_TEAMS } from '../../constants/pro-teams'
import type { PlayerAggregate } from '../../store/selectors'

interface Props {
  playerStats: PlayerAggregate[]
}

export function PlayerLeaderboard({ playerStats }: Props) {
  const t = useTranslation()
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...playerStats].sort((a, b) => b.survivalPct - a.survivalPct),
    [playerStats]
  )

  const dynasty = PRO_TEAMS[0]

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('analytics.leaderboard')}</h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-pb-border">
              <th className="text-left py-2 pr-2">Player</th>
              <th className="text-right px-1">SUR%</th>
              <th className="text-right px-1">OTB%</th>
              <th className="text-right px-1">K/PT</th>
              <th className="text-right px-1">G1</th>
              <th className="text-right px-1">COM</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr
                key={p.playerId}
                onClick={() => setSelectedPlayer(selectedPlayer === p.playerId ? null : p.playerId)}
                className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                  selectedPlayer === p.playerId ? 'bg-pb-amber/10' : ''
                }`}
              >
                <td className="py-2 pr-2 text-white font-medium">{p.name}</td>
                <td className="text-right px-1 font-mono">{p.survivalPct}%</td>
                <td className="text-right px-1 font-mono">{p.otbPct}%</td>
                <td className="text-right px-1 font-mono">{p.killsPerPoint}</td>
                <td className="text-right px-1 font-mono">{p.breakoutKills}</td>
                <td className="text-right px-1 font-mono">{p.avgComms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-600 mt-2 text-center italic">{t('analytics.tapPlayer')}</p>

      {/* Player spider chart */}
      {selectedPlayer && (() => {
        const player = sorted.find((p) => p.playerId === selectedPlayer)
        if (!player) return null
        return (
          <div className="mt-4 pt-4 border-t border-pb-border">
            <h4 className="text-xs font-bold text-white mb-2">{player.name} — Skill Map</h4>
            <SpiderChart
              axes={SPIDER_AXES}
              datasets={[
                {
                  values: normalizePlayerForSpider(player),
                  fill: 'rgba(245, 158, 11, 0.2)',
                  stroke: '#f59e0b',
                  label: player.name,
                },
                {
                  values: normalizeProForSpider(dynasty.benchmarks),
                  fill: 'rgba(234, 179, 8, 0.05)',
                  stroke: 'rgba(234, 179, 8, 0.3)',
                  label: dynasty.name,
                },
              ]}
              size={200}
            />
            <div className="grid grid-cols-3 gap-2 mt-3">
              <StatBadge label="SUR" value={`${player.survivalPct}%`} />
              <StatBadge label="OTB" value={`${player.otbPct}%`} />
              <StatBadge label="K/PT" value={`${player.killsPerPoint}`} />
              <StatBadge label="G1" value={`${player.breakoutKills}`} />
              <StatBadge label="PEN" value={`${player.penalties}`} />
              <StatBadge label="COM" value={`${player.avgComms}`} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-700/50 rounded-lg px-2 py-1.5 text-center">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs text-white font-mono font-bold">{value}</div>
    </div>
  )
}
