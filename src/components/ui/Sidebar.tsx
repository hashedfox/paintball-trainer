import type { SectionId } from '../../store/context'

interface SidebarProps {
  activeSection: SectionId
  onNavigate: (section: SectionId) => void
  level: number
  xp: number
  coins: number
}

const NAV_ITEMS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'highlights', label: 'Highlights', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'ppi', label: 'PPI Hub', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'challenges', label: 'Challenges', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'persona', label: 'Persona', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'pro-teams', label: 'Pro Teams', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'tier-list', label: 'Tier List', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { id: 'guides', label: 'Guides', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
]

export function Sidebar({ activeSection, onNavigate, level, xp, coins }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop w-[220px] min-h-full bg-pb-darker border-r border-pb-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-pb-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pb-neon to-pb-blue flex items-center justify-center">
              <span className="text-sm font-black text-pb-darker">P</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">PPI</h1>
              <span className="text-[10px] text-pb-text-muted uppercase tracking-widest">Paintball Index</span>
            </div>
          </div>
        </div>

        {/* Player stats bar */}
        <div className="px-4 py-3 border-b border-pb-border">
          <div className="flex items-center justify-between mb-1">
            <span className="level-badge">LVL {level}</span>
            <span className="coin-badge">{coins} C</span>
          </div>
          <div className="xp-bar-track mt-2">
            <div className="xp-bar-fill" style={{ width: `${Math.min((xp % 100) * 100 / 100, 100)}%` }} />
          </div>
          <span className="text-[10px] text-pb-text-muted mt-1 block">{xp} XP</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${
                activeSection === item.id
                  ? 'text-pb-neon bg-pb-neon/5 border-r-2 border-pb-neon'
                  : 'text-pb-text-dim hover:text-white hover:bg-white/3'
              }`}
            >
              <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-pb-border">
          <p className="text-[10px] text-pb-text-muted text-center">PPI v2.0 — Built for competitors</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="nav-mobile fixed bottom-0 left-0 right-0 bg-pb-darker/95 backdrop-blur-md border-t border-pb-border z-50">
        <div className="flex overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex-1 min-w-[60px] flex flex-col items-center py-2 px-1 transition-all ${
                activeSection === item.id ? 'text-pb-neon nav-active' : 'text-pb-text-muted'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[9px] mt-0.5 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
