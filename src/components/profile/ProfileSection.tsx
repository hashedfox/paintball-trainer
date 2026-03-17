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
    gpi.breakdown.survival,
    gpi.breakdown.otb,
    gpi.breakdown.killsPerPoint,
    gpi.breakdown.discipline,
    gpi.breakdown.comms,
    gpi.breakdown.winRate,
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Profile Card */}
      <div className="card-gaming p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pb-neon/10 to-transparent rounded-bl-full" />
        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pb-neon to-pb-blue flex items-center justify-center text-2xl font-black text-pb-darker">
            {playerName[0]?.toUpperCase() || 'P'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">{playerName}</h2>
            <p className="text-sm text-pb-text-dim">{POSITION_LABELS[position as keyof typeof POSITION_LABELS] || position}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="level-badge">LVL {challengesState.level}</span>
              <span className="text-xs text-pb-text-muted">{onboarding.competition || 'No league set'}</span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-pb-text-muted uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={onboarding.playerName}
              onChange={(e) => dispatch({ type: 'SET_ONBOARDING', data: { playerName: e.target.value } })}
              className="w-full bg-pb-surface border border-pb-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pb-neon mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] text-pb-text-muted uppercase tracking-wider">Team</label>
            <input
              type="text"
              value={profile.team}
              onChange={(e) => dispatch({ type: 'SET_PROFILE', field: 'team', value: e.target.value })}
              className="w-full bg-pb-surface border border-pb-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pb-neon mt-1"
            />
          </div>
        </div>
      </div>

      {/* PPI Score */}
      <div className="card-gaming p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your PPI Score</h3>
          <span className="text-3xl font-black" style={{ color: GRADE_COLORS[gpi.grade] }}>{gpi.grade}</span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {/* Circular gauge */}
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={GRADE_COLORS[gpi.grade]}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${gpi.overall * 2.64} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-white">{gpi.overall}</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 space-y-2">
            {Object.entries(gpi.breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-pb-text-dim w-16 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex-1 h-1.5 bg-pb-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${value}%`, background: value >= 75 ? '#22c55e' : value >= 50 ? '#3b82f6' : value >= 25 ? '#f59e0b' : '#ef4444' }}
                  />
                </div>
                <span className="text-[10px] text-white font-mono w-6 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spider chart */}
        <SpiderChart labels={spiderLabels} values={spiderValues} color="#00ff88" size={200} />
      </div>

      {/* Strategic Tips */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Position Tips</h3>
        <div className="space-y-2">
          {gpi.breakdown.survival < 50 && (
            <div className="bg-pb-red/10 border border-pb-red/20 rounded-lg p-3">
              <span className="text-xs text-pb-red font-bold">Low Survival Rate</span>
              <p className="text-[11px] text-pb-text-dim mt-1">Focus on tighter breakout runs and reading lanes before moving.</p>
            </div>
          )}
          {gpi.breakdown.comms < 60 && (
            <div className="bg-pb-amber/10 border border-pb-amber/20 rounded-lg p-3">
              <span className="text-xs text-pb-amber font-bold">Communication Needs Work</span>
              <p className="text-[11px] text-pb-text-dim mt-1">Practice callouts during practice. As a {POSITION_LABELS[position as keyof typeof POSITION_LABELS]}, your calls are critical.</p>
            </div>
          )}
          {gpi.overall >= 60 && (
            <div className="bg-pb-green/10 border border-pb-green/20 rounded-lg p-3">
              <span className="text-xs text-pb-green font-bold">Strong Foundation</span>
              <p className="text-[11px] text-pb-text-dim mt-1">Your fundamentals are solid. Focus on consistency and advanced positioning.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pro Videos for Position */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Recommended Videos</h3>
        <div className="space-y-2">
          {videos.map((video, i) => (
            <a
              key={i}
              href={video.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-pb-surface rounded-lg border border-pb-border hover:border-pb-border-light transition-colors"
            >
              <div className="w-10 h-10 bg-pb-red/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-pb-red" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-medium text-white">{video.title}</span>
                <span className="text-[10px] text-pb-text-muted block">{video.channel}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Key Pros to Follow */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Pros to Follow</h3>
        <p className="text-xs text-pb-text-dim mb-2">Top {POSITION_LABELS[position as keyof typeof POSITION_LABELS]} players to study:</p>
        <div className="space-y-2">
          {pros.map((pro, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-pb-surface rounded-lg">
              <div className="w-8 h-8 rounded-full bg-pb-neon/20 flex items-center justify-center text-xs font-bold text-pb-neon">
                {i + 1}
              </div>
              <span className="text-sm text-white">{pro}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Season Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-pb-surface rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-pb-neon">{teamStats.totalPoints}</div>
            <div className="text-[10px] text-pb-text-muted">Points Played</div>
          </div>
          <div className="bg-pb-surface rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-pb-green">{teamStats.winPct}%</div>
            <div className="text-[10px] text-pb-text-muted">Win Rate</div>
          </div>
          <div className="bg-pb-surface rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-pb-blue">{teamStats.killsPP}</div>
            <div className="text-[10px] text-pb-text-muted">Kills/Point</div>
          </div>
        </div>
      </div>

      {/* Share */}
      <button
        type="button"
        onClick={() => {
          const text = `PPI Score: ${gpi.overall} (${gpi.grade}) | ${playerName} | ${POSITION_LABELS[position as keyof typeof POSITION_LABELS]} | Win Rate: ${teamStats.winPct}%`
          navigator.clipboard.writeText(text)
        }}
        className="w-full card-gaming p-3 text-center text-sm font-medium text-pb-neon hover:bg-pb-neon/5 transition-colors"
      >
        Share Profile
      </button>
    </div>
  )
}
