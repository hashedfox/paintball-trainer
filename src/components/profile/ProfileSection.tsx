import { useAppState, useDispatch } from '../../store/context'
import { computeTeamStats } from '../../store/selectors'
import { computeGpi, GRADE_COLORS } from '../../lib/gpi'
import { POSITION_LABELS } from '../../types/player'
import { SpiderChart } from '../ui/SpiderChart'
import { PPI_LABELS, PPI_AXES, getCompositeScore, getDivisionFromPPI, getSkillTier } from '../../types/ppi'
import { DIVISIONS } from '../../types/achievement'

const PRO_VIDEOS_BY_POSITION: Record<string, { title: string; channel: string; searchUrl: string }[]> = {
  snake1: [
    { title: 'How to Play Snake 1', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=paintball+snake+1+tips+NXL' },
    { title: 'Snake Crawling Techniques', channel: 'Lone Wolf Paintball', searchUrl: 'https://www.youtube.com/results?search_query=paintball+snake+crawling+technique' },
  ],
  snake2: [
    { title: 'Snake 2 Support Role', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=paintball+snake+2+support+role' },
    { title: 'Tape Side Lanes', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=paintball+tape+side+lane+control' },
  ],
  centre: [
    { title: 'Centre Player Command', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=paintball+centre+mid+player+NXL' },
    { title: 'Communication & Calling', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=paintball+communication+callouts+guide' },
  ],
  doritto1: [
    { title: 'Doritto Side Dominance', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=paintball+doritto+back+player+tips' },
    { title: 'Lane Control Mastery', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=paintball+lane+control+doritto' },
  ],
  doritto2: [
    { title: 'D2 Back Player Role', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=paintball+back+player+role+tips' },
    { title: 'Cross-Field Lanes', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=paintball+cross+field+shooting+lanes' },
  ],
}

const KEY_PROS: Record<string, string[]> = {
  snake1: ['Marcello Margott (Dynasty)', 'Alex Fraige (Dynasty)', 'Ryan Moorhead'],
  snake2: ['Tyler Harmon', 'Justin Rabackoff (ac Diesel)'],
  centre: ['Ryan Greenspan (Dynasty)', 'Kyle Spicka (ac Diesel)'],
  doritto1: ['Yosh Rau (Dynasty)', 'Colt Roberts'],
  doritto2: ['Bobby Aviles', 'Greg Siewers'],
}

export function ProfileSection() {
  const state = useAppState()
  const dispatch = useDispatch()
  const { onboarding, profile, challengesState, ppiScores, ppiEstimated, trainingStreak } = state

  const teamStats = computeTeamStats(state.points)
  const gpi = computeGpi(teamStats)

  const position = onboarding.primaryPosition || profile.position || 'centre'
  const playerName = onboarding.playerName || profile.name || 'Player'
  const videos = PRO_VIDEOS_BY_POSITION[position] || PRO_VIDEOS_BY_POSITION.centre
  const pros = KEY_PROS[position] || KEY_PROS.centre

  const composite = getCompositeScore(ppiScores)
  const division = getDivisionFromPPI(composite)
  const divInfo = DIVISIONS.find(d => d.name.includes(division) || d.shortName === division) || DIVISIONS[0]

  const ppiLabels = PPI_AXES.map(a => PPI_LABELS[a])
  const ppiValues = PPI_AXES.map(a => ppiScores[a])

  // 30-day-ago values from history
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const historicEntry = state.ppiHistory.find(h => h.date <= thirtyDaysAgo)
  const compareValues = historicEntry ? PPI_AXES.map(a => historicEntry.scores[a]) : undefined

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="card-gaming p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pb-green/8 to-transparent rounded-bl-full" />
        <div className="relative flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pb-purple to-pb-purple-dim flex items-center justify-center text-2xl font-black text-white font-display">
            {playerName[0]?.toUpperCase() || 'P'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-white font-display">{playerName}</h2>
            <p className="text-[12px] text-[#94A3B8]">{POSITION_LABELS[position as keyof typeof POSITION_LABELS] || position}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="level-badge">LVL {challengesState.level}</span>
              <span className="division-badge" style={{ background: `${divInfo.color}20`, color: divInfo.color, border: `1px solid ${divInfo.color}40` }}>
                {division}
              </span>
              {trainingStreak > 0 && (
                <span className="flex items-center gap-1 text-[#D4A843] text-xs font-bold">
                  <span className="flame-active inline-block">🔥</span>{trainingStreak}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit fields */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-[#64748B] uppercase tracking-wider font-bold">Name</label>
            <input
              type="text"
              value={onboarding.playerName}
              onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { playerName: e.target.value } })}
              className="w-full bg-[#111827] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#2DD4A8] mt-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-[#64748B] uppercase tracking-wider font-bold">Team</label>
            <input
              type="text"
              value={profile.team}
              onChange={(e) => dispatch({ type: 'SET_PROFILE', field: 'team', value: e.target.value })}
              className="w-full bg-[#111827] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#2DD4A8] mt-1"
            />
          </div>
        </div>
      </div>

      {/* PPI Spider Chart */}
      <div className="card-gaming p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="section-header">PPI RADAR</span>
            {ppiEstimated && <span className="ml-2 tag-pill tag-amber text-[9px]">Estimated</span>}
          </div>
          <div className="text-right">
            <span className="font-display text-3xl font-bold" style={{ color: divInfo.color }}>{composite}</span>
            <span className="text-[10px] text-[#64748B] ml-1">/ 100</span>
          </div>
        </div>

        <div className="flex justify-center">
          <SpiderChart
            labels={ppiLabels}
            values={ppiValues}
            compareValues={compareValues}
            color="#7C5BF0"
            compareColor="#7C5BF050"
            size={280}
            iconLabels={true}
          />
        </div>

        {/* PPI Axis Breakdown */}
        <div className="space-y-2 mt-4">
          {PPI_AXES.map((axis) => {
            const value = ppiScores[axis]
            const tier = getSkillTier(value)
            const tierColor = value >= 70 ? '#2DD4A8' : value >= 40 ? '#4A7BF7' : value >= 20 ? '#D4A843' : '#EF4444'
            return (
              <button
                key={axis}
                type="button"
                onClick={() => dispatch({ type: 'SET_ACTIVE_SECTION', section: 'drills' })}
                className="w-full flex items-center gap-3 p-3 panel-inner rounded-lg hover:bg-[#2A3050] transition-colors text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">{PPI_LABELS[axis]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold" style={{ color: tierColor }}>{tier}</span>
                      <span className="font-stat text-sm font-bold text-white">{value}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-[4px] bg-[#0A0E1A] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: tierColor }} />
                  </div>
                </div>
                <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )
          })}
        </div>
      </div>

      {/* Season Stats */}
      <div className="card-gaming p-5">
        <span className="section-header mb-3 block">Season Stats</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card"><div className="stat-card-value text-[#2DD4A8]">{teamStats.totalPoints}</div><div className="stat-card-label">Points</div></div>
          <div className="stat-card"><div className="stat-card-value text-[#4A7BF7]">{teamStats.winPct}%</div><div className="stat-card-label">Win Rate</div></div>
          <div className="stat-card"><div className="stat-card-value text-[#D4A843]">{teamStats.killsPP}</div><div className="stat-card-label">Kills/Pt</div></div>
        </div>
      </div>

      {/* Pro Videos */}
      <div className="card-gaming p-5">
        <span className="section-header mb-3 block">Recommended Videos</span>
        <div className="space-y-2">
          {videos.map((video, i) => (
            <a key={i} href={video.searchUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 panel-inner rounded-lg hover:bg-[#2A3050] transition-colors"
            >
              <div className="w-10 h-10 bg-[#EF4444]/15 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#EF4444]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-white">{video.title}</span>
                <span className="text-[9px] text-[#64748B] block">{video.channel}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Key Pros */}
      <div className="card-gaming p-5">
        <span className="section-header mb-3 block">Pros to Follow</span>
        <div className="space-y-2">
          {pros.map((pro, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 panel-inner rounded-lg">
              <div className="w-7 h-7 rounded-full bg-[#7C5BF0]/20 flex items-center justify-center text-[10px] font-bold text-[#7C5BF0]">{i + 1}</div>
              <span className="text-[12px] text-white">{pro}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <button type="button" onClick={() => {
        const text = `PPI: ${composite} | ${division} | ${playerName} | ${POSITION_LABELS[position as keyof typeof POSITION_LABELS]} | Win Rate: ${teamStats.winPct}%`
        navigator.clipboard.writeText(text)
      }} className="w-full card-gaming p-3 text-center text-[12px] font-semibold text-[#2DD4A8] hover:bg-[#2DD4A8]/5 transition-colors">
        Share Profile
      </button>
    </div>
  )
}
