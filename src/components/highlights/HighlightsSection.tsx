import { useState, useMemo } from 'react'

interface VideoEntry {
  id: string
  title: string
  channel: string
  searchUrl: string
  tags: string[]
  category: 'match' | 'highlights' | 'analysis' | 'tutorial'
  competition?: string
}

const VIDEO_LIBRARY: VideoEntry[] = [
  { id: 'v1', title: 'NXL World Cup 2024 Finals Highlights', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=NXL+World+Cup+2024+finals+paintball', tags: ['nxl', 'world-cup', 'finals'], category: 'highlights', competition: 'NXL' },
  { id: 'v2', title: 'Dynasty vs Damage — Full Match Breakdown', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=dynasty+vs+damage+paintball+match', tags: ['dynasty', 'damage', 'pro'], category: 'match', competition: 'NXL' },
  { id: 'v3', title: 'Best Bunkering Plays 2024', channel: 'PB Nation', searchUrl: 'https://www.youtube.com/results?search_query=best+bunkering+plays+paintball+2024', tags: ['bunkering', 'highlights'], category: 'highlights' },
  { id: 'v4', title: 'Houston Heat — Aggressive Lane Control', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=houston+heat+paintball+lane+control', tags: ['heat', 'lanes', 'pro'], category: 'analysis', competition: 'NXL' },
  { id: 'v5', title: 'How Dynasty Wins Points — Film Study', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=san+diego+dynasty+film+study+paintball', tags: ['dynasty', 'film-study', 'strategy'], category: 'analysis', competition: 'NXL' },
  { id: 'v6', title: 'Top 10 Eliminations — NXL 2024 Season', channel: 'NXL Official', searchUrl: 'https://www.youtube.com/results?search_query=NXL+top+10+eliminations+2024', tags: ['nxl', 'top-10', 'kills'], category: 'highlights', competition: 'NXL' },
  { id: 'v7', title: 'Edmonton Impact Physical Play Style', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=edmonton+impact+paintball+physical+play', tags: ['impact', 'physical', 'pro'], category: 'analysis', competition: 'NXL' },
  { id: 'v8', title: 'Snap Shooting Tutorial — Pro Techniques', channel: 'Lone Wolf', searchUrl: 'https://www.youtube.com/results?search_query=paintball+snap+shooting+tutorial+pro', tags: ['snap-shooting', 'tutorial', 'technique'], category: 'tutorial' },
  { id: 'v9', title: 'Breakout Strategies Explained', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=paintball+breakout+strategies+explained', tags: ['breakout', 'strategy', 'tutorial'], category: 'tutorial' },
  { id: 'v10', title: 'ac Diesel Rise — Season Recap', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=ac+diesel+paintball+season+recap', tags: ['diesel', 'pro', 'recap'], category: 'highlights', competition: 'NXL' },
  { id: 'v11', title: 'Tampa Bay Damage 2025 World Cup Run', channel: 'MLPB', searchUrl: 'https://www.youtube.com/results?search_query=tampa+bay+damage+2025+world+cup', tags: ['damage', 'world-cup', 'pro'], category: 'match', competition: 'NXL' },
  { id: 'v12', title: 'Communication Guide — Call Like a Pro', channel: 'BKI', searchUrl: 'https://www.youtube.com/results?search_query=paintball+communication+guide+callouts', tags: ['communication', 'callouts', 'tutorial'], category: 'tutorial' },
]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'match', label: 'Full Matches' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'tutorial', label: 'Tutorials' },
]

export function HighlightsSection() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    return VIDEO_LIBRARY.filter(v => {
      const matchesCategory = category === 'all' || v.category === category
      const matchesSearch = search === '' ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.tags.some(t => t.includes(search.toLowerCase())) ||
        v.channel.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-white mb-1">Game Highlights</h2>
        <p className="text-sm text-pb-text-dim">Pro match videos, highlights, and analysis from top competitions.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pb-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search videos, teams, topics..."
          className="w-full bg-pb-surface border border-pb-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-pb-text-muted focus:outline-none focus:border-pb-neon"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-pb-neon text-pb-darker'
                : 'bg-pb-surface text-pb-text-dim border border-pb-border hover:border-pb-border-light'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="space-y-3">
        {filtered.map((video) => (
          <a
            key={video.id}
            href={video.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-gaming p-4 flex gap-4 hover:border-pb-border-light transition-all group block"
          >
            {/* Thumbnail placeholder */}
            <div className="w-28 h-20 md:w-40 md:h-24 bg-pb-surface rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-pb-red/10 transition-colors">
              <svg className="w-8 h-8 text-pb-red/60 group-hover:text-pb-red transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white group-hover:text-pb-neon transition-colors line-clamp-2">{video.title}</h4>
              <p className="text-[11px] text-pb-text-muted mt-1">{video.channel}</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {video.competition && (
                  <span className="px-2 py-0.5 bg-pb-amber/10 text-pb-amber rounded-full text-[9px] font-medium">{video.competition}</span>
                )}
                <span className="px-2 py-0.5 bg-pb-blue/10 text-pb-blue rounded-full text-[9px] font-medium capitalize">{video.category}</span>
                {video.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-pb-surface text-pb-text-muted rounded-full text-[9px]">{tag}</span>
                ))}
              </div>
            </div>
          </a>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-pb-text-muted text-sm">No videos match your search.</p>
          </div>
        )}
      </div>

      {/* External links */}
      <div className="card-gaming p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">More Resources</h3>
        <div className="space-y-2">
          <a href="https://www.youtube.com/results?search_query=NXL+paintball+2024" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-pb-surface rounded-lg hover:bg-pb-card-hover transition-colors">
            <span className="text-pb-red">YouTube</span>
            <span className="text-xs text-pb-text-dim">NXL Official Matches</span>
          </a>
          <a href="https://www.pbleagues.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-pb-surface rounded-lg hover:bg-pb-card-hover transition-colors">
            <span className="text-pb-blue">PBLeagues</span>
            <span className="text-xs text-pb-text-dim">Live competition updates & scores</span>
          </a>
        </div>
      </div>
    </div>
  )
}
