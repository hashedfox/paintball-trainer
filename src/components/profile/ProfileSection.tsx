import { useAppState, useDispatch } from '../../store/context'
import { computeTeamStats } from '../../store/selectors'
import { computeGpi, GRADE_COLORS } from '../../lib/gpi'
import { POSITION_LABELS } from '../../types/player'
import { SpiderChart } from '../ui/SpiderChart'

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
  const { onboarding, profile, challengesState } = state

  const teamStats = computeTeamStats(state.points)
  const gpi = computeGpi(teamStats)

  const position = onboarding.primaryPosition || profile.position || 'centre'
  const playerName = onboarding.playerName || profile.name || 'Player'
  const videos = PRO_VIDEOS_BY_POSITION[position] || PRO_VIDEOS_BY_POSITION.centre
  const pros = KEY_PROS[position] || KEY_PROS.centre

  const spiderLabels = ['Survival', 'OTB', 'Kills/Pt', 'Discipline', 'Comms', 'Win Rate']
  const spiderValues = [
    gpi.breakdown.survival, gpi.breakdown.otb, gpi.breakdown.killsPerPoint,
    gpi.breakdown.discipline, gpi.breakdown.comms, gpi.breakdown.winRate,
  ]

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="card-gaming p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-pb-primary/10 to-transparent rounded-bl-full" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-pb-primary flex items-center justify-center text-xl font-black text-white">
            {playerName[0]?.toUpperCase() || 'P'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-white">{playerName}</h2>
            <p className="text-[12px] text-pb-text-dim">{POSITION_LABELS[position as keyof typeof POSITION_LABELS] || position}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="level-badge">LVL {challengesState.level}</span>
              <span className="text-[10px] text-pb-text-muted">{onboarding.competition || 'No league set'}</span>
            </div>
          </div>
        </div>

        {/* Edit fields */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-pb-text-muted uppercase tracking-wider font-bold">Name</label>
            <input
              type="text"
              value={onboarding.playerName}
              onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { playerName: e.target.value } })}
              className="w-full bg-pb-surface border border-pb-border rounded-md px-3 py-2 text-[12px] text-white focus:outline-none focus:border-pb-primary mt-1"
            />
          </div>
          <div>
            <label className="text-[9px] text-pb-text-muted uppercase tracking-wider font-bold">Team</label>
            <input
              type="text"
              value={profile.team}
              onChange={(e) => dispatch({ type: 'SET_PROFILE', field: 'team', value: e.target.value })}
              className="w-full bg-pb-surface border border-pb-border rounded-md px-3 py-2 text-[12px] text-white focus:outline-none focus:border-pb-primary mt-1"
            />
          </div>
        </div>
      </div>

      {/* PPI Score with spider */}
      <div className="card-gaming p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="section-header">Your PPI Score</span>
          <span className="text-2xl font-black" style={{ color: GRADE_COLORS[gpi.grade] }}>{gpi.grade}</span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#16152e" strokeWidth="7" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={GRADE_COLORS[gpi.grade]} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${gpi.overall * 2.64} 264`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{gpi.overall}</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {Object.entries(gpi.breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[9px] text-pb-text-dim w-14 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex-1 h-[5px] bg-pb-surface rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: value >= 75 ? '#49b4a0' : value >= 50 ? '#5b8def' : value >= 25 ? '#e8914f' : '#e05d6f' }} />
                </div>
                <span className="text-[9px] text-white font-mono w-5 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <SpiderChart labels={spiderLabels} values={spiderValues} color="#5b4dc7" size={220} />
      </div>

      {/* Strategic Tips */}
      <div className="card-gaming p-5">
        <span className="section-header mb-3 block">Position Tips</span>
        <div className="space-y-2">
          {gpi.breakdown.survival < 50 && (
            <div className="panel-inner p-3 border-l-2 border-pb-red">
              <span className="text-[11px] text-pb-red font-bold">Low Survival Rate</span>
              <p className="text-[10px] text-pb-text-dim mt-1">Focus on tighter breakout runs and reading lanes before moving.</p>
            </div>
          )}
          {gpi.breakdown.comms < 60 && (
            <div className="panel-inner p-3 border-l-2 border-pb-orange">
              <span className="text-[11px] text-pb-orange font-bold">Communication Needs Work</span>
              <p className="text-[10px] text-pb-text-dim mt-1">Practice callouts during practice. As a {POSITION_LABELS[position as keyof typeof POSITION_LABELS]}, your calls are critical.</p>
            </div>
          )}
          {gpi.overall >= 60 && (
            <div className="panel-inner p-3 border-l-2 border-pb-green">
              <span className="text-[11px] text-pb-green font-bold">Strong Foundation</span>
              <p className="text-[10px] text-pb-text-dim mt-1">Your fundamentals are solid. Focus on consistency and advanced positioning.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pro Videos */}
      <div className="card-gaming p-5">
        <span className="section-header mb-3 block">Recommended Videos</span>
        <div className="space-y-2">
          {videos.map((video, i) => (
            <a key={i} href={video.searchUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 panel-inner rounded-md hover:bg-pb-card-hover transition-colors"
            >
              <div className="w-9 h-9 bg-pb-red/15 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-pb-red" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-white">{video.title}</span>
                <span className="text-[9px] text-pb-text-muted block">{video.channel}</span>
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
            <div key={i} className="flex items-center gap-3 p-2 panel-inner rounded-md">
              <div className="w-7 h-7 rounded-full bg-pb-primary/20 flex items-center justify-center text-[10px] font-bold text-pb-primary-bright">{i + 1}</div>
              <span className="text-[12px] text-white">{pro}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Season Stats */}
      <div className="card-gaming p-5">
        <span className="section-header mb-3 block">Season Stats</span>
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card"><div className="stat-card-value text-pb-primary-bright">{teamStats.totalPoints}</div><div className="stat-card-label">Points</div></div>
          <div className="stat-card"><div className="stat-card-value text-pb-green">{teamStats.winPct}%</div><div className="stat-card-label">Win Rate</div></div>
          <div className="stat-card"><div className="stat-card-value text-pb-blue">{teamStats.killsPP}</div><div className="stat-card-label">Kills/Pt</div></div>
        </div>
      </div>

      {/* Share */}
      <button type="button" onClick={() => {
        const text = `PPI Score: ${gpi.overall} (${gpi.grade}) | ${playerName} | ${POSITION_LABELS[position as keyof typeof POSITION_LABELS]} | Win Rate: ${teamStats.winPct}%`
        navigator.clipboard.writeText(text)
      }} className="w-full card-gaming p-3 text-center text-[12px] font-semibold text-pb-primary-bright hover:bg-pb-primary/5 transition-colors">
        Share Profile
      </button>
    </div>
  )
}
