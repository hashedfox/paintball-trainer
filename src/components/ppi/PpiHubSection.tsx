import { useState } from 'react'
import { useAppState } from '../../store/context'
import { computeTeamStats, computePlayerStats } from '../../store/selectors'
import { computeGpi, GRADE_COLORS } from '../../lib/gpi'
import { PRO_TEAMS } from '../../constants/pro-teams'
import { SpiderChart } from '../ui/SpiderChart'
import { PointsTab } from '../points/PointsTab'
import { SetupTab } from '../setup/SetupTab'

type PpiView = 'dashboard' | 'track' | 'setup'

export function PpiHubSection() {
  const state = useAppState()
  const [view, setView] = useState<PpiView>('dashboard')
  const [compareTeam, setCompareTeam] = useState('dynasty')

  const teamStats = computeTeamStats(state.points)
  const playerStats = computePlayerStats(state.points, state.roster)
  const gpi = computeGpi(teamStats)

  const proTeam = PRO_TEAMS.find(t => t.id === compareTeam) || PRO_TEAMS[0]

  const spiderLabels = ['Survival', 'OTB', 'Kills/Pt', 'Discipline', 'Comms', 'Win Rate']
  const spiderValues = [
    gpi.breakdown.survival,
    gpi.breakdown.otb,
    gpi.breakdown.killsPerPoint,
    gpi.breakdown.discipline,
    gpi.breakdown.comms,
    gpi.breakdown.winRate,
  ]
  const proSpider = [
    proTeam.survivalPct,
    proTeam.otbPct,
    Math.min(proTeam.killsPP / 2 * 100, 100),
    Math.max(0, 100 - proTeam.penPM * 25),
    (proTeam.avgComm / 5) * 100,
    proTeam.winPct,
  ]

  if (view === 'track') {
    return (
      <div className="animate-fade-in">
        <div className="p-4 border-b border-pb-border">
          <button type="button" onClick={() => setView('dashboard')} className="text-pb-neon text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
        </div>
        <PointsTab />
      </div>
    )
  }

  if (view === 'setup') {
    return (
      <div className="animate-fade-in">
        <div className="p-4 border-b border-pb-border">
          <button type="button" onClick={() => setView('dashboard')} className="text-pb-neon text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>
        </div>
        <SetupTab />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">PPI Hub</h2>
          <p className="text-xs text-pb-text-dim">Paintballer Performance Index — Your complete analytics dashboard</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setView('setup')} className="px-3 py-1.5 bg-pb-surface border border-pb-border rounded-lg text-xs text-pb-text-dim hover:text-white transition-colors">
            Setup
          </button>
          <button type="button" onClick={() => setView('track')} className="px-3 py-1.5 bg-pb-neon text-pb-darker rounded-lg text-xs font-bold hover:bg-pb-neon-dim transition-colors">
            + Track Point
          </button>
        </div>
      </div>

      {/* GPI Overview Card */}
      <div className="card-gaming p-6 relative overflow-hidden glow-green">
        <div className="absolute inset-0 bg-gradient-to-r from-pb-neon/3 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-6">
            {/* Big score */}
            <div className="text-center">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={GRADE_COLORS[gpi.grade]}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${gpi.overall * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{gpi.overall}</span>
                  <span className="text-xs font-bold" style={{ color: GRADE_COLORS[gpi.grade] }}>Grade {gpi.grade}</span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="bg-pb-surface rounded-lg p-2.5">
                <div className="text-lg font-bold text-pb-green">{teamStats.wins}</div>
                <div className="text-[9px] text-pb-text-muted">Wins</div>
              </div>
              <div className="bg-pb-surface rounded-lg p-2.5">
                <div className="text-lg font-bold text-pb-red">{teamStats.losses}</div>
                <div className="text-[9px] text-pb-text-muted">Losses</div>
              </div>
              <div className="bg-pb-surface rounded-lg p-2.5">
                <div className="text-lg font-bold text-pb-blue">{teamStats.killsPP}</div>
                <div className="text-[9px] text-pb-text-muted">Kills/Pt</div>
              </div>
              <div className="bg-pb-surface rounded-lg p-2.5">
                <div className="text-lg font-bold text-pb-amber">{teamStats.survivalPct}%</div>
                <div className="text-[9px] text-pb-text-muted">Survival</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">PPI Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(gpi.breakdown).map(([key, value]) => {
            const labels: Record<string, string> = {
              survival: 'Survival Rate',
              otb: 'Off-the-Break',
              killsPerPoint: 'Kills / Point',
              discipline: 'Discipline',
              comms: 'Communication',
              winRate: 'Win Rate',
            }
            const weights: Record<string, number> = {
              survival: 25, otb: 20, killsPerPoint: 20, discipline: 15, comms: 10, winRate: 10,
            }
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-pb-text-dim">{labels[key] || key}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-pb-text-muted">{weights[key]}% weight</span>
                    <span className="text-sm font-bold text-white">{value}</span>
                  </div>
                </div>
                <div className="h-2 bg-pb-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${value}%`,
                      background: value >= 75 ? '#22c55e' : value >= 50 ? '#3b82f6' : value >= 25 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spider Chart with Pro Comparison */}
      <div className="card-gaming p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">vs Pro Teams</h3>
          <select
            value={compareTeam}
            onChange={(e) => setCompareTeam(e.target.value)}
            className="bg-pb-surface border border-pb-border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pb-neon"
          >
            {PRO_TEAMS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center">
          <SpiderChart
            labels={spiderLabels}
            values={spiderValues}
            compareValues={proSpider}
            color="#00ff88"
            compareColor={proTeam.color}
            size={260}
          />
        </div>
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded bg-pb-neon" />
            <span className="text-[10px] text-pb-text-dim">Your Team</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded" style={{ background: proTeam.color }} />
            <span className="text-[10px] text-pb-text-dim">{proTeam.name}</span>
          </div>
        </div>
        <p className="text-[9px] text-pb-text-muted mt-2 text-center italic">
          Pro stats are coaching community estimates — the NXL does not publish official per-point stats.
        </p>
      </div>

      {/* Player Leaderboard */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Player Leaderboard</h3>
        <div className="space-y-2">
          {playerStats
            .sort((a, b) => b.killsPerPoint - a.killsPerPoint)
            .map((p, i) => (
            <div key={p.playerId} className="flex items-center gap-3 p-3 bg-pb-surface rounded-lg">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-pb-gold/20 text-pb-gold' : i === 1 ? 'bg-pb-text-dim/20 text-pb-text-dim' : 'bg-pb-orange/20 text-pb-orange'
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{p.name}</span>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[10px] text-pb-text-muted">{p.killsPerPoint} K/Pt</span>
                  <span className="text-[10px] text-pb-text-muted">{p.survivalPct}% SUR</span>
                  <span className="text-[10px] text-pb-text-muted">{p.avgComms} COM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Plan */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Development Plan</h3>
        <div className="space-y-2">
          {gpi.breakdown.survival < 60 && (
            <div className="flex gap-3 p-3 bg-pb-red/5 border border-pb-red/20 rounded-lg">
              <span className="text-pb-red text-lg">1</span>
              <div>
                <span className="text-xs font-bold text-pb-red">Priority: Survival Rate ({gpi.breakdown.survival}%)</span>
                <p className="text-[11px] text-pb-text-dim mt-1">Practice breakout runs — time your sprints, read lanes, use tighter angles. Target: 65%+</p>
              </div>
            </div>
          )}
          {gpi.breakdown.otb < 70 && (
            <div className="flex gap-3 p-3 bg-pb-amber/5 border border-pb-amber/20 rounded-lg">
              <span className="text-pb-amber text-lg">2</span>
              <div>
                <span className="text-xs font-bold text-pb-amber">Improve: Off-the-Break ({gpi.breakdown.otb}%)</span>
                <p className="text-[11px] text-pb-text-dim mt-1">Dry-fire breakout drills at home. Visualize your exact run before each point. Target: 80%+</p>
              </div>
            </div>
          )}
          {gpi.breakdown.comms < 70 && (
            <div className="flex gap-3 p-3 bg-pb-blue/5 border border-pb-blue/20 rounded-lg">
              <span className="text-pb-blue text-lg">3</span>
              <div>
                <span className="text-xs font-bold text-pb-blue">Improve: Communication ({gpi.breakdown.comms}%)</span>
                <p className="text-[11px] text-pb-text-dim mt-1">Practice callout vocabulary daily. Count bodies every point and call them out. Target: 4.0+ avg.</p>
              </div>
            </div>
          )}
          {gpi.overall >= 60 && (
            <div className="flex gap-3 p-3 bg-pb-green/5 border border-pb-green/20 rounded-lg">
              <span className="text-pb-green text-lg">+</span>
              <div>
                <span className="text-xs font-bold text-pb-green">Maintain strengths</span>
                <p className="text-[11px] text-pb-text-dim mt-1">Your core metrics are solid. Focus on consistency and pushing toward Grade A performance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
