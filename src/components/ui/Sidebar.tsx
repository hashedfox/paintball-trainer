import type { SectionId } from '../../store/context'

interface SidebarProps {
  activeSection: SectionId
  onNavigate: (section: SectionId) => void
  level: number
  xp: number
  coins: number
  streak: number
}

const NAV_ITEMS: { id: SectionId; label: string; icon: string; group?: string }[] = [
  // Core loop
  { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', group: 'core' },
  { id: 'session-logger', label: 'Log Session', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', group: 'core' },
  { id: 'session-report', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', group: 'core' },

  // Training
  { id: 'drills', label: 'Drills', icon: 'M13 10V3L4 14h7v7l9-11h-7z', group: 'train' },
  { id: 'layout-planner', label: 'Playbook', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', group: 'train' },
  { id: 'guides', label: 'Guides', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', group: 'train' },

  // Progress
  { id: 'achievements', label: 'Achievements', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', group: 'progress' },
  { id: 'challenges', label: 'Challenges', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z', group: 'progress' },
  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', group: 'progress' },

  // Community
  { id: 'pro-teams', label: 'Pro Teams', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', group: 'community' },
  { id: 'tier-list', label: 'Tier List', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', group: 'community' },
  { id: 'persona', label: 'Persona', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', group: 'community' },
]

const GROUP_LABELS: Record<string, string> = {
  core: 'GAME DAY',
  train: 'TRAINING',
  progress: 'PROGRESS',
  community: 'COMMUNITY',
}

export function Sidebar({ activeSection, onNavigate, level, xp, coins, streak }: SidebarProps) {
  // Group items
  const groups = ['core', 'train', 'progress', 'community']

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop w-[220px] min-h-full bg-pb-darker border-r border-pb-border flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-pb-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pb-green to-pb-green-dim flex items-center justify-center">
              <span className="text-sm font-black text-[#0D1117]">PPI</span>
            </div>
            <div>
              <h1 className="text-[14px] font-extrabold text-white tracking-tight leading-none font-display">PAINTBALL</h1>
              <span className="text-[9px] text-pb-text-muted uppercase tracking-[0.15em]">Performance Index</span>
            </div>
          </div>
        </div>

        {/* Player stats bar */}
        <div className="px-4 py-3 border-b border-pb-border">
          <div className="flex items-center justify-between mb-2">
            <span className="level-badge text-[12px] px-3 py-1">LVL {level}</span>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-pb-amber text-xs font-bold">
                <span className="flame-active inline-block">🔥</span>
                {streak}
              </span>
            )}
          </div>
          <div className="xp-bar-track mt-1">
            <div className="xp-bar-fill" style={{ width: `${Math.min((xp % 100), 100)}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-pb-text-muted">{xp} XP</span>
            <span className="coin-badge">{coins}</span>
          </div>
        </div>

        {/* Nav items grouped */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {groups.map((group) => (
            <div key={group} className="mb-1">
              <div className="px-4 pt-3 pb-1">
                <span className="text-[9px] font-bold text-pb-text-muted tracking-[0.15em]">{GROUP_LABELS[group]}</span>
              </div>
              {NAV_ITEMS.filter(item => item.group === group).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-[9px] text-[12px] transition-all ${
                    activeSection === item.id
                      ? 'text-white bg-pb-green/10 border-r-2 border-pb-green'
                      : 'text-pb-text-dim hover:text-pb-text hover:bg-white/[0.03]'
                  }`}
                >
                  <svg className="w-[16px] h-[16px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-pb-border">
          <p className="text-[9px] text-pb-text-muted text-center">PPI v3.0 — Built for Players</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="nav-mobile fixed bottom-0 left-0 right-0 bg-pb-darker/95 backdrop-blur-md border-t border-pb-border z-50">
        <div className="flex overflow-x-auto">
          {NAV_ITEMS.slice(0, 7).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex-1 min-w-[52px] flex flex-col items-center py-2 px-1 transition-all ${
                activeSection === item.id ? 'text-pb-green nav-active' : 'text-pb-text-muted'
              }`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[7px] mt-0.5 truncate font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
