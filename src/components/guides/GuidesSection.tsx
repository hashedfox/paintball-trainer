import { useState, useMemo } from 'react'
import { getGuides, type GuideCategory } from '../../types/guides'
import { POSITION_LABELS, type Position } from '../../types/player'

const CATEGORY_LABELS: Record<GuideCategory, string> = {
  fundamentals: 'Fundamentals',
  position: 'Position Guides',
  plays: 'Plays & Strategy',
  'field-layout': 'Field Layouts',
  mental: 'Mental Game',
  fitness: 'Fitness',
  equipment: 'Equipment',
}

const CATEGORY_COLORS: Record<GuideCategory, string> = {
  fundamentals: '#22c55e',
  position: '#3b82f6',
  plays: '#a855f7',
  'field-layout': '#f59e0b',
  mental: '#ec4899',
  fitness: '#f97316',
  equipment: '#06b6d4',
}

const DIFFICULTY_COLORS = {
  beginner: '#22c55e',
  intermediate: '#3b82f6',
  advanced: '#a855f7',
}

export function GuidesSection() {
  const guides = getGuides()
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<'all' | GuideCategory>('all')
  const [filterPosition, setFilterPosition] = useState<'all' | Position>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return guides.filter(g => {
      const matchesCat = filterCategory === 'all' || g.category === filterCategory
      const matchesPos = filterPosition === 'all' || (g.positions && g.positions.includes(filterPosition))
      const matchesSearch = search === '' ||
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.tags.some(t => t.includes(search.toLowerCase())) ||
        g.summary.toLowerCase().includes(search.toLowerCase())
      return matchesCat && matchesPos && matchesSearch
    })
  }, [guides, filterCategory, filterPosition, search])

  const guide = guides.find(g => g.id === selectedGuide)

  if (guide) {
    return (
      <div className="p-4 md:p-6 space-y-5 animate-fade-in">
        <button
          type="button"
          onClick={() => setSelectedGuide(null)}
          className="text-pb-primary-bright text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All Guides
        </button>

        <div className="card-gaming p-6">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
              style={{ color: CATEGORY_COLORS[guide.category], background: `${CATEGORY_COLORS[guide.category]}15` }}
            >
              {CATEGORY_LABELS[guide.category]}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
              style={{ color: DIFFICULTY_COLORS[guide.difficulty], background: `${DIFFICULTY_COLORS[guide.difficulty]}15` }}
            >
              {guide.difficulty}
            </span>
            <span className="text-[9px] text-pb-text-muted">{guide.estimatedMinutes} min read</span>
          </div>

          <h2 className="text-xl font-extrabold text-white mb-2">{guide.title}</h2>
          <p className="text-sm text-pb-text-dim mb-6">{guide.summary}</p>

          {guide.positions && (
            <div className="flex gap-2 mb-6">
              {guide.positions.map(p => (
                <span key={p} className="px-2 py-0.5 bg-pb-blue/10 text-pb-blue rounded-full text-[9px] font-medium">
                  {POSITION_LABELS[p]}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {guide.sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-white mb-2">{section.heading}</h3>
                <p className="text-xs text-pb-text-dim leading-relaxed">{section.content}</p>
                {section.tips && (
                  <div className="mt-3 space-y-1.5">
                    {section.tips.map((tip, j) => (
                      <div key={j} className="flex gap-2 items-start p-2 bg-pb-primary/10 rounded-lg border border-pb-primary/10">
                        <span className="text-pb-primary-bright text-[10px] font-bold mt-0.5">TIP</span>
                        <span className="text-[11px] text-pb-text-dim">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {guide.videoUrl && (
            <a
              href={guide.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-3 p-3 bg-pb-surface rounded-lg hover:bg-pb-card-hover transition-colors"
            >
              <svg className="w-5 h-5 text-pb-red" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span className="text-xs text-white">Watch related videos on YouTube</span>
            </a>
          )}

          {/* Tags */}
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {guide.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-pb-surface text-pb-text-muted rounded-full text-[9px]">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-white">Guides</h2>
        <p className="text-xs text-pb-text-dim">Deep dives into every aspect of competitive paintball.</p>
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
          placeholder="Search guides..."
          className="w-full bg-pb-surface border border-pb-border rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-pb-text-muted focus:outline-none focus:border-pb-primary"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
            filterCategory === 'all' ? 'bg-pb-primary text-pb-darker' : 'bg-pb-surface text-pb-text-dim border border-pb-border'
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_LABELS) as GuideCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              filterCategory === cat ? 'text-pb-darker' : 'bg-pb-surface text-pb-text-dim border border-pb-border'
            }`}
            style={filterCategory === cat ? { background: CATEGORY_COLORS[cat] } : {}}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Position filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterPosition('all')}
          className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
            filterPosition === 'all' ? 'bg-pb-blue text-white' : 'bg-pb-surface text-pb-text-dim border border-pb-border'
          }`}
        >
          All Positions
        </button>
        {Object.entries(POSITION_LABELS).map(([pos, label]) => (
          <button
            key={pos}
            type="button"
            onClick={() => setFilterPosition(pos as Position)}
            className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              filterPosition === pos ? 'bg-pb-blue text-white' : 'bg-pb-surface text-pb-text-dim border border-pb-border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Guide cards */}
      <div className="space-y-3">
        {filtered.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSelectedGuide(g.id)}
            className="w-full card-gaming p-4 text-left hover:border-pb-border-light transition-all group"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${CATEGORY_COLORS[g.category]}15` }}
              >
                <div className="w-4 h-4 rounded" style={{ background: CATEGORY_COLORS[g.category] }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white group-hover:text-pb-primary-bright transition-colors">{g.title}</h4>
                <p className="text-[10px] text-pb-text-dim mt-1 line-clamp-2">{g.summary}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-[8px] font-bold capitalize"
                    style={{ color: DIFFICULTY_COLORS[g.difficulty], background: `${DIFFICULTY_COLORS[g.difficulty]}15` }}
                  >
                    {g.difficulty}
                  </span>
                  <span className="text-[9px] text-pb-text-muted">{g.estimatedMinutes} min</span>
                  {g.positions && g.positions.map(p => (
                    <span key={p} className="text-[8px] text-pb-blue">{POSITION_LABELS[p]}</span>
                  ))}
                </div>
              </div>
              <svg className="w-4 h-4 text-pb-text-muted group-hover:text-pb-primary-bright transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-pb-text-muted text-sm">No guides match your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
