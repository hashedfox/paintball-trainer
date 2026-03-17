import { useState } from 'react'
import { PRO_TEAMS } from '../../constants/pro-teams'
import { useAppState } from '../../store/context'
import { computeTeamStats } from '../../store/selectors'
import { computeGpi } from '../../lib/gpi'
import { SpiderChart } from '../ui/SpiderChart'

export function ProTeamsSection() {
  const state = useAppState()
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const teamStats = computeTeamStats(state.points)
  const gpi = computeGpi(teamStats)
  const team = PRO_TEAMS.find(t => t.id === selectedTeam)

  const userSpider = [
    gpi.breakdown.survival,
    gpi.breakdown.otb,
    gpi.breakdown.killsPerPoint,
    gpi.breakdown.discipline,
    gpi.breakdown.comms,
    gpi.breakdown.winRate,
  ]

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white">Pro Teams</h2>
        <p className="text-xs text-pb-text-dim">Top NXL teams — rosters, strengths, and how you compare.</p>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PRO_TEAMS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTeam(selectedTeam === t.id ? null : t.id)}
            className={`card-gaming p-4 text-left transition-all ${
              selectedTeam === t.id ? 'border-l-4' : ''
            }`}
            style={selectedTeam === t.id ? { borderLeftColor: t.color } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black" style={{ background: `${t.color}20`, color: t.color }}>
                {t.tier}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="text-[10px] text-pb-text-dim truncate">{t.description.slice(0, 60)}...</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: t.color }}>{t.winPct}%</div>
                <div className="text-[9px] text-pb-text-muted">Win Rate</div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="text-center">
                <div className="text-xs font-bold text-pb-green">{t.survivalPct}%</div>
                <div className="text-[8px] text-pb-text-muted">SUR</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-pb-blue">{t.otbPct}%</div>
                <div className="text-[8px] text-pb-text-muted">OTB</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-pb-amber">{t.killsPP}</div>
                <div className="text-[8px] text-pb-text-muted">K/Pt</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-pb-purple">{t.avgComm}</div>
                <div className="text-[8px] text-pb-text-muted">COM</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Team Detail */}
      {team && (
        <div className="card-gaming p-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black" style={{ background: `${team.color}20`, color: team.color }}>
              {team.tier}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{team.name}</h3>
              <p className="text-xs text-pb-text-dim">{team.description}</p>
            </div>
          </div>

          {/* Facts */}
          <div className="space-y-1.5 mb-4">
            {team.facts.map((fact, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-pb-neon text-xs mt-0.5">-</span>
                <span className="text-xs text-pb-text-dim">{fact}</span>
              </div>
            ))}
          </div>

          {/* Roster */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Roster</h4>
            <div className="flex flex-wrap gap-2">
              {team.roster.map((player) => (
                <span key={player} className="px-3 py-1 bg-pb-surface rounded-full text-[11px] text-white border border-pb-border">
                  {player}
                </span>
              ))}
            </div>
          </div>

          {/* Spider comparison */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Your Team vs {team.name}</h4>
            <div className="flex justify-center">
              <SpiderChart
                labels={['Survival', 'OTB', 'Kills/Pt', 'Discipline', 'Comms', 'Win Rate']}
                values={userSpider}
                compareValues={[
                  team.survivalPct,
                  team.otbPct,
                  Math.min(team.killsPP / 2 * 100, 100),
                  Math.max(0, 100 - team.penPM * 25),
                  (team.avgComm / 5) * 100,
                  team.winPct,
                ]}
                color="#00ff88"
                compareColor={team.color}
                size={240}
              />
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded bg-pb-neon" />
                <span className="text-[10px] text-pb-text-dim">You</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded" style={{ background: team.color }} />
                <span className="text-[10px] text-pb-text-dim">{team.name}</span>
              </div>
            </div>
          </div>

          {/* Recommended videos */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Related Videos</h4>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(team.name + ' paintball NXL')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-pb-surface rounded-lg hover:bg-pb-card-hover transition-colors"
            >
              <svg className="w-5 h-5 text-pb-red" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="text-xs text-white">Search {team.name} on YouTube</span>
            </a>
          </div>

          <p className="text-[9px] text-pb-text-muted mt-4 italic">
            Pro stat numbers are coaching community estimates — the NXL does not publish official per-point stats.
          </p>
        </div>
      )}
    </div>
  )
}
