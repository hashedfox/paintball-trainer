import { useState } from 'react'
import { useAppState } from '../../store/context'
import { computeTeamStats, computePlayerStats } from '../../store/selectors'
import { computeGpi, GRADE_COLORS } from '../../lib/gpi'
import { PRO_TEAMS } from '../../constants/pro-teams'
import { SpiderChart } from '../ui/SpiderChart'
import { PointsTab } from '../points/PointsTab'
import { SetupTab } from '../setup/SetupTab'

type PpiView = 'dashboard' | 'track' | 'setup'

const BREAKDOWN_META: Record<string, { label: string; weight: number; icon: string }> = {
  survival:       { label: 'Survival',       weight: 25, icon: 'M12 21C6.5 21 2 16.5 2 11V3l4 2 4-2 4 2 4-2v8c0 5.5-4.5 10-10 10z' },
  otb:            { label: 'Off-the-Break',  weight: 20, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  killsPerPoint:  { label: 'Kills / Point',  weight: 20, icon: 'M12 2L2 7l10 5 10-5-10-5z' },
  discipline:     { label: 'Discipline',     weight: 15, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  comms:          { label: 'Communication',  weight: 10, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  winRate:        { label: 'Win Rate',       weight: 10, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
}

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

  // Find weakest area for "Skill to Focus"
  const entries = Object.entries(gpi.breakdown) as [string, number][]
  const weakest = entries.reduce((min, e) => e[1] < min[1] ? e : min, entries[0])
  const weakMeta = BREAKDOWN_META[weakest[0]]

  if (view === 'track') {
    return (
      <div className="animate-fade-in">
        <div className="p-4 border-b border-white/[0.08]">
          <button type="button" onClick={() => setView('dashboard')} className="text-[#7C5BF0] text-sm font-semibold flex items-center gap-1">
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
        <div className="p-4 border-b border-white/[0.08]">
          <button type="button" onClick={() => setView('dashboard')} className="text-[#7C5BF0] text-sm font-semibold flex items-center gap-1">
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
      {/* Header with pill tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-extrabold text-white">PPI Overview</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setView('setup')} className="btn-secondary">Setup</button>
          <button type="button" onClick={() => setView('track')} className="btn-primary">+ Track Point</button>
        </div>
      </div>

      {/* Performance Overview bar (like Mobalytics top strip) */}
      <div className="card-gaming p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="section-header">Performance Overview</span>
          <span className="text-[10px] text-[#64748B]">{teamStats.totalPoints} points</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Overall gauge */}
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#2A3050" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={GRADE_COLORS[gpi.grade]}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${gpi.overall * 2.64} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white">{gpi.overall}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B]">Grade</span>
              <div className="text-xl font-black" style={{ color: GRADE_COLORS[gpi.grade] }}>{gpi.grade}</div>
            </div>
          </div>

          {/* Quick stat pills */}
          <div className="flex gap-2 flex-wrap flex-1">
            <div className="stat-card flex-1 min-w-[70px]">
              <div className="stat-card-value text-[#2DD4A8]">{teamStats.wins}W</div>
              <div className="stat-card-label">{teamStats.losses}L · {teamStats.winPct}%</div>
            </div>
            <div className="stat-card flex-1 min-w-[70px]">
              <div className="stat-card-value text-[#4A7BF7]">{teamStats.killsPP}</div>
              <div className="stat-card-label">Kills/Pt</div>
            </div>
            <div className="stat-card flex-1 min-w-[70px]">
              <div className="stat-card-value text-[#D4A843]">{teamStats.survivalPct}%</div>
              <div className="stat-card-label">Survival</div>
            </div>
            <div className="stat-card flex-1 min-w-[70px]">
              <div className="stat-card-value text-[#2DD4A8]">{teamStats.otbPct}%</div>
              <div className="stat-card-label">OTB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: Spider + Breakdown sidebar (Mobalytics layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Left: Spider Chart */}
        <div className="card-gaming p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="section-header">PPI Radar</span>
            <select
              value={compareTeam}
              onChange={(e) => setCompareTeam(e.target.value)}
              className="bg-[#111827] border border-white/[0.08] rounded-md px-3 py-1.5 text-[11px] text-[#F1F5F9] focus:outline-none focus:border-[#7C5BF0]"
            >
              {PRO_TEAMS.map((t) => (
                <option key={t.id} value={t.id}>vs {t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <SpiderChart
              labels={spiderLabels}
              values={spiderValues}
              compareValues={proSpider}
              color="#7C5BF0"
              compareColor={proTeam.color}
              size={300}
              iconLabels={true}
            />
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[3px] rounded bg-[#7C5BF0]" />
              <span className="text-[10px] text-[#94A3B8]">Your Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[3px] rounded" style={{ background: proTeam.color }} />
              <span className="text-[10px] text-[#94A3B8]">{proTeam.name}</span>
            </div>
          </div>
          <p className="text-[8px] text-[#64748B] mt-2 text-center italic">
            Pro benchmarks are coaching community estimates.
          </p>
        </div>

        {/* Right: Skill to Focus + Breakdown bars (Mobalytics style) */}
        <div className="space-y-4">
          {/* Skill to Focus card */}
          <div className="card-gaming p-4 border-l-2 border-[#7C5BF0] glow-purple">
            <span className="section-header">Skill to Focus</span>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-lg bg-[#7C5BF0]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#7C5BF0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={weakMeta.icon} />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">{weakMeta.label}</h4>
                <p className="text-[10px] text-[#64748B] mt-0.5">Focusing on this Skill will bring the most immediate improvements.</p>
              </div>
            </div>
            {/* You vs Pro comparison */}
            <div className="mt-3 flex items-center gap-4">
              <div>
                <span className="text-2xl font-black text-[#7C5BF0]">{weakest[1].toFixed(1)}</span>
                <span className="text-[10px] text-[#64748B] ml-1">vs</span>
                <span className="text-sm font-bold text-[#EF4444] ml-1">{(proSpider[entries.indexOf(weakest)] ?? 0).toFixed(1)}</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#7C5BF0] w-6">You</span>
                  <div className="compare-bar-track flex-1"><div className="compare-bar-you" style={{ width: `${weakest[1]}%` }} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#EF4444] w-6">{proTeam.name.split(' ').pop()}</span>
                  <div className="compare-bar-track flex-1"><div className="compare-bar-pro" style={{ width: `${proSpider[entries.indexOf(weakest)] ?? 0}%` }} /></div>
                </div>
              </div>
            </div>
          </div>

          {/* All breakdown bars */}
          {Object.entries(gpi.breakdown).map(([key, value]) => {
            const meta = BREAKDOWN_META[key]
            const proVal = proSpider[entries.findIndex(e => e[0] === key)] ?? 0
            const isWeak = key === weakest[0]
            return (
              <div key={key} className={`card-gaming p-3.5 ${isWeak ? 'border-l-2 border-[#F59E0B]' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={meta.icon} />
                  </svg>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">{meta.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#7C5BF0]">{value.toFixed(1)}</span>
                    <span className="text-[10px] text-[#64748B]">vs</span>
                    <span className="text-sm font-bold text-[#EF4444]">{proVal.toFixed(1)}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] text-[#7C5BF0] w-4">You</span>
                      <div className="compare-bar-track flex-1"><div className="compare-bar-you" style={{ width: `${value}%` }} /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill={proTeam.color} /></svg>
                      <div className="compare-bar-track flex-1"><div className="compare-bar-pro" style={{ width: `${proVal}%` }} /></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Player Leaderboard */}
      <div className="card-gaming p-5">
        <span className="section-header">Player Leaderboard</span>
        <div className="space-y-2 mt-3">
          {playerStats
            .sort((a, b) => b.killsPerPoint - a.killsPerPoint)
            .map((p, i) => (
            <div key={p.playerId} className="flex items-center gap-3 p-3 panel-inner rounded-lg">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i === 0 ? 'bg-[#D4A843]/20 text-[#D4A843]' : i === 1 ? 'bg-[#94A3B8]/20 text-[#94A3B8]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-semibold text-white">{p.name}</span>
                <div className="flex gap-3 mt-0.5">
                  <span className="tag-pill tag-blue">{p.killsPerPoint} K/Pt</span>
                  <span className="tag-pill tag-green">{p.survivalPct}% SUR</span>
                  <span className="tag-pill tag-teal">{p.avgComms} COM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Plan */}
      <div className="card-gaming p-5">
        <span className="section-header">Development Plan</span>
        <div className="space-y-2 mt-3">
          {gpi.breakdown.survival < 60 && (
            <div className="panel-inner p-3 border-l-2 border-[#EF4444]">
              <span className="text-[11px] font-bold text-[#EF4444]">Priority: Survival Rate ({gpi.breakdown.survival}%)</span>
              <p className="text-[10px] text-[#94A3B8] mt-1">Practice breakout runs — time your sprints, read lanes, use tighter angles. Target: 65%+</p>
            </div>
          )}
          {gpi.breakdown.otb < 70 && (
            <div className="panel-inner p-3 border-l-2 border-[#F59E0B]">
              <span className="text-[11px] font-bold text-[#F59E0B]">Improve: Off-the-Break ({gpi.breakdown.otb}%)</span>
              <p className="text-[10px] text-[#94A3B8] mt-1">Dry-fire breakout drills at home. Visualize your exact run before each point. Target: 80%+</p>
            </div>
          )}
          {gpi.breakdown.comms < 70 && (
            <div className="panel-inner p-3 border-l-2 border-[#4A7BF7]">
              <span className="text-[11px] font-bold text-[#4A7BF7]">Improve: Communication ({gpi.breakdown.comms}%)</span>
              <p className="text-[10px] text-[#94A3B8] mt-1">Practice callout vocabulary daily. Count bodies every point and call them out. Target: 4.0+ avg.</p>
            </div>
          )}
          {gpi.overall >= 60 && (
            <div className="panel-inner p-3 border-l-2 border-[#2DD4A8]">
              <span className="text-[11px] font-bold text-[#2DD4A8]">Maintain strengths</span>
              <p className="text-[10px] text-[#94A3B8] mt-1">Your core metrics are solid. Focus on consistency and pushing toward Grade A performance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
