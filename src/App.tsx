import { useState } from 'react'
import { LanguageProvider } from './i18n/context'
import { AppStateProvider } from './store/context'
import { TabBar } from './components/ui/TabBar'
import { SetupTab } from './components/setup/SetupTab'
import { PointsTab } from './components/points/PointsTab'
import { AnalyticsTab } from './components/analytics/AnalyticsTab'
import { PlaybookTab } from './components/playbook/PlaybookTab'
import { ProfileTab } from './components/profile/ProfileTab'

export type TabId = 'setup' | 'points' | 'analytics' | 'playbook' | 'profile'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('analytics')

  return (
    <AppStateProvider>
      <LanguageProvider>
        <div className="flex flex-col h-full bg-pb-dark">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-pb-border bg-pb-card">
            <h1 className="text-lg font-bold text-white tracking-tight">
              PPI <span className="text-pb-amber">Paintball</span>
            </h1>
            <span className="text-xs text-slate-400">Player Index</span>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto pb-20">
            {activeTab === 'setup' && <SetupTab />}
            {activeTab === 'points' && <PointsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'playbook' && <PlaybookTab />}
            {activeTab === 'profile' && <ProfileTab />}
          </main>

          {/* Tab Bar */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </LanguageProvider>
    </AppStateProvider>
  )
}

export default App
