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
        <h2 className="text-xl font-extrabold text-white">Pro Teams</h2>
        <p className="text-xs text-[#94A3B8]">Top NXL teams — rosters, strengths, and how you compare.</p>
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-extrabold" style={{ background: `${t.color}20`, color: t.color }}>
                {t.tier}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="text-[10px] text-[#94A3B8] truncate">{t.description.slice(0, 60)}...</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: t.color }}>{t.winPct}%</div>
                <div className="text-[9px] text-[#64748B]">Win Rate</div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="text-center">
                <div className="text-xs font-bold text-[#2DD4A8]">{t.survivalPct}%</div>
                <div className="text-[8px] text-[#64748B]">SUR</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-[#4A7BF7]">{t.otbPct}%</div>
                <div className="text-[8px] text-[#64748B]">OTB</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-[#D4A843]">{t.killsPP}</div>
                <div className="text-[8px] text-[#64748B]">K/Pt</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-[#7C5BF0]">{t.avgComm}</div>
                <div className="text-[8px] text-[#64748B]">COM</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Team Detail */}
      {team && (
        <div className="card-gaming p-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-extrabold" style={{ background: `${team.color}20`, color: team.color }}>
              {team.tier}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">{team.name}</h3>
              <p className="text-xs text-[#94A3B8]">{team.description}</p>
            </div>
          </div>

          {/* Facts */}
          <div className="space-y-1.5 mb-4">
            {team.facts.map((fact, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-[#9B7CF7] text-xs mt-0.5">-</span>
                <span className="text-xs text-[#94A3B8]">{fact}</span>
              </div>
            ))}
          </div>

          {/* Roster */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Roster</h4>
            <div className="flex flex-wrap gap-2">
              {team.roster.map((player) => (
                <span key={player} className="px-3 py-1 bg-[#111827] rounded-full text-[11px] text-white border border-white/[0.08]">
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
                <div className="w-3 h-1 rounded bg-[#7C5BF0]" />
                <span className="text-[10px] text-[#94A3B8]">You</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded" style={{ background: team.color }} />
                <span className="text-[10px] text-[#94A3B8]">{team.name}</span>
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
              className="flex items-center gap-3 p-3 panel-inner rounded-lg hover:bg-[#222842] transition-colors"
            >
              <svg className="w-5 h-5 text-[#EF4444]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="text-xs text-white">Search {team.name} on YouTube</span>
            </a>
          </div>

          <p className="text-[9px] text-[#64748B] mt-4 italic">
            Pro stat numbers are coaching community estimates — the NXL does not publish official per-point stats.
          </p>
        </div>
      )}
    </div>
  )
}
