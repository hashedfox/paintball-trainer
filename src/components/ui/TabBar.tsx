// Legacy TabBar — replaced by Sidebar navigation in v2
// Kept for reference

import { useTranslation } from '../../i18n/useTranslation'

type TabId = 'setup' | 'points' | 'analytics' | 'playbook' | 'profile'

const TABS: { id: TabId; icon: string; labelKey: string }[] = [
  { id: 'setup', icon: '⚙', labelKey: 'tab.setup' },
  { id: 'points', icon: '◉', labelKey: 'tab.points' },
  { id: 'analytics', icon: '📊', labelKey: 'tab.analytics' },
  { id: 'playbook', icon: '◆', labelKey: 'tab.playbook' },
  { id: 'profile', icon: '◇', labelKey: 'tab.profile' },
]

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TabBar({ activeTab, onTabChange }: Props) {
  const t = useTranslation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pb-card border-t border-pb-border flex z-50">
      {TABS.map(({ id, icon, labelKey }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
            activeTab === id ? 'text-pb-amber' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg mb-0.5">{icon}</span>
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}
