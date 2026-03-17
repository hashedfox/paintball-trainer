import { useState } from 'react'

interface FieldLayout {
  id: string
  name: string
  tier: 'S' | 'A' | 'B' | 'C'
  competition: string
  year: number
  description: string
  snakeAdvantage: 'strong' | 'neutral' | 'weak'
  dorittoAdvantage: 'strong' | 'neutral' | 'weak'
  centrePlay: 'aggressive' | 'control' | 'defensive'
  notableFeature: string
  bunkerCount: number
}

const FIELD_LAYOUTS: FieldLayout[] = [
  {
    id: 'nxl-wc-2024',
    name: 'NXL World Cup 2024',
    tier: 'S',
    competition: 'NXL',
    year: 2024,
    description: 'Classic symmetrical layout with strong 50 bunkers. Favors aggressive mid-game pushes and cross-field lanes.',
    snakeAdvantage: 'strong',
    dorittoAdvantage: 'neutral',
    centrePlay: 'aggressive',
    notableFeature: 'Wide snake wire allows deep crawls',
    bunkerCount: 42,
  },
  {
    id: 'nxl-chi-2024',
    name: 'NXL Windy City 2024',
    tier: 'A',
    competition: 'NXL',
    year: 2024,
    description: 'Compact layout with tight lanes and close bunker spacing. Rewards precise snap shooting.',
    snakeAdvantage: 'neutral',
    dorittoAdvantage: 'strong',
    centrePlay: 'control',
    notableFeature: 'Tight D-side creates gunfight alleys',
    bunkerCount: 38,
  },
  {
    id: 'nxl-dal-2024',
    name: 'NXL Dallas Open 2024',
    tier: 'A',
    competition: 'NXL',
    year: 2024,
    description: 'Spread layout emphasizing breakout execution and OTB elimination trades.',
    snakeAdvantage: 'strong',
    dorittoAdvantage: 'weak',
    centrePlay: 'aggressive',
    notableFeature: 'Long runs to primaries make OTB critical',
    bunkerCount: 40,
  },
  {
    id: 'msxl-opener-2024',
    name: 'MSXL Season Opener 2024',
    tier: 'B',
    competition: 'MSXL',
    year: 2024,
    description: 'Balanced layout suitable for divisional play. Good mix of angles and bunker variety.',
    snakeAdvantage: 'neutral',
    dorittoAdvantage: 'neutral',
    centrePlay: 'control',
    notableFeature: 'Centre temple creates a natural choke point',
    bunkerCount: 36,
  },
  {
    id: 'nxl-vegas-2025',
    name: 'NXL Las Vegas 2025',
    tier: 'S',
    competition: 'NXL',
    year: 2025,
    description: 'High-action layout with multiple cross-over points. Designed for fast rotations.',
    snakeAdvantage: 'neutral',
    dorittoAdvantage: 'strong',
    centrePlay: 'aggressive',
    notableFeature: 'Cross-field dorito bunkers enable flanking',
    bunkerCount: 44,
  },
  {
    id: 'wcppl-spring-2024',
    name: 'WCPPL Spring Classic 2024',
    tier: 'B',
    competition: 'WCPPL',
    year: 2024,
    description: 'West coast favorite with long snake wire and short D-side. Forces asymmetric strategies.',
    snakeAdvantage: 'strong',
    dorittoAdvantage: 'weak',
    centrePlay: 'defensive',
    notableFeature: 'Asymmetric snake favors aggressive crawlers',
    bunkerCount: 34,
  },
  {
    id: 'nxl-wc-2025',
    name: 'NXL World Cup 2025',
    tier: 'S',
    competition: 'NXL',
    year: 2025,
    description: 'The biggest event of the year. Complex layout rewarding team coordination and communication.',
    snakeAdvantage: 'neutral',
    dorittoAdvantage: 'neutral',
    centrePlay: 'control',
    notableFeature: 'Central fortress bunker for commanding mid presence',
    bunkerCount: 46,
  },
  {
    id: 'icpl-eu-2024',
    name: 'ICPL European Open 2024',
    tier: 'A',
    competition: 'ICPL',
    year: 2024,
    description: 'European-style layout with wider spacing. Emphasizes movement speed and breakout lanes.',
    snakeAdvantage: 'neutral',
    dorittoAdvantage: 'neutral',
    centrePlay: 'aggressive',
    notableFeature: 'Wide open transitions punish slow movers',
    bunkerCount: 40,
  },
]

const TIER_COLORS: Record<string, string> = { S: '#eab308', A: '#22c55e', B: '#3b82f6', C: '#f59e0b' }

export function TierListSection() {
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')

  const layout = FIELD_LAYOUTS.find(l => l.id === selectedLayout)

  const filtered = FIELD_LAYOUTS.filter(l =>
    (filterTier === 'all' || l.tier === filterTier) &&
    (filterYear === 'all' || l.year.toString() === filterYear)
  ).sort((a, b) => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3 }
    return tierOrder[a.tier] - tierOrder[b.tier]
  })

  const advantageColor = (v: string) =>
    v === 'strong' ? 'text-pb-green' : v === 'weak' ? 'text-pb-red' : 'text-pb-text-dim'

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-white">Field Tier List</h2>
        <p className="text-xs text-pb-text-dim">Recent competition field layouts ranked and analyzed.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1">
          {['all', 'S', 'A', 'B'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setFilterTier(tier)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                filterTier === tier
                  ? 'text-pb-darker'
                  : 'bg-pb-surface text-pb-text-dim border border-pb-border'
              }`}
              style={filterTier === tier ? { background: tier === 'all' ? '#00ff88' : TIER_COLORS[tier] } : {}}
            >
              {tier === 'all' ? 'All Tiers' : `Tier ${tier}`}
            </button>
          ))}
        </div>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-pb-surface border border-pb-border rounded-lg px-3 py-1 text-[10px] text-white focus:outline-none focus:border-pb-primary"
        >
          <option value="all">All Years</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* Layout cards */}
      <div className="space-y-3">
        {filtered.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelectedLayout(selectedLayout === l.id ? null : l.id)}
            className={`w-full card-gaming p-4 text-left transition-all ${
              selectedLayout === l.id ? 'glow-blue' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                style={{ background: `${TIER_COLORS[l.tier]}15`, color: TIER_COLORS[l.tier] }}
              >
                {l.tier}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{l.name}</h4>
                  <span className="text-[9px] px-2 py-0.5 bg-pb-surface rounded-full text-pb-text-muted">{l.competition}</span>
                </div>
                <p className="text-[10px] text-pb-text-dim mt-1">{l.description}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-[9px]">
                    Snake: <span className={`font-bold ${advantageColor(l.snakeAdvantage)}`}>{l.snakeAdvantage}</span>
                  </span>
                  <span className="text-[9px]">
                    Doritto: <span className={`font-bold ${advantageColor(l.dorittoAdvantage)}`}>{l.dorittoAdvantage}</span>
                  </span>
                  <span className="text-[9px]">
                    Centre: <span className="font-bold text-pb-blue">{l.centrePlay}</span>
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded layout detail */}
      {layout && (
        <div className="card-gaming p-5 animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-3">{layout.name} — Analysis</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="panel-inner rounded-lg p-3">
              <span className="text-[9px] text-pb-text-muted uppercase tracking-wider">Bunkers</span>
              <div className="text-lg font-bold text-white">{layout.bunkerCount}</div>
            </div>
            <div className="panel-inner rounded-lg p-3">
              <span className="text-[9px] text-pb-text-muted uppercase tracking-wider">Year</span>
              <div className="text-lg font-bold text-white">{layout.year}</div>
            </div>
          </div>

          <div className="panel-inner rounded-lg p-3 mb-4">
            <span className="text-[9px] text-pb-text-muted uppercase tracking-wider">Notable Feature</span>
            <p className="text-xs text-pb-primary-bright mt-1">{layout.notableFeature}</p>
          </div>

          {/* Position breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Position Analysis</h4>
            <div className="flex items-center justify-between p-2 panel-inner rounded-lg">
              <span className="text-[10px] text-pb-text-dim">Snake Side</span>
              <span className={`text-[10px] font-bold ${advantageColor(layout.snakeAdvantage)}`}>{layout.snakeAdvantage}</span>
            </div>
            <div className="flex items-center justify-between p-2 panel-inner rounded-lg">
              <span className="text-[10px] text-pb-text-dim">Doritto Side</span>
              <span className={`text-[10px] font-bold ${advantageColor(layout.dorittoAdvantage)}`}>{layout.dorittoAdvantage}</span>
            </div>
            <div className="flex items-center justify-between p-2 panel-inner rounded-lg">
              <span className="text-[10px] text-pb-text-dim">Centre Play Style</span>
              <span className="text-[10px] font-bold text-pb-blue">{layout.centrePlay}</span>
            </div>
          </div>

          <div className="mt-4">
            <a
              href="https://www.gunzup.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-pb-primary-bright hover:text-pb-primary-dim transition-colors"
            >
              View more field designs on GunzUp.com →
            </a>
          </div>
        </div>
      )}

      {/* External link */}
      <div className="card-gaming p-4">
        <a
          href="https://www.gunzup.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-pb-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-pb-primary-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white">GunzUp.com</span>
            <p className="text-[10px] text-pb-text-dim">Browse field layout designs and create your own</p>
          </div>
        </a>
      </div>
    </div>
  )
}
