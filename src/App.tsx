import { LanguageProvider } from './i18n/context'
import { AppStateProvider, useAppState, useDispatch, type SectionId } from './store/context'
import { Sidebar } from './components/ui/Sidebar'
import { HomeSection } from './components/home/HomeSection'
import { ProfileSection } from './components/profile/ProfileSection'
import { HighlightsSection } from './components/highlights/HighlightsSection'
import { PpiHubSection } from './components/ppi/PpiHubSection'
import { ChallengesSection } from './components/challenges/ChallengesSection'
import { PersonaSection } from './components/persona/PersonaSection'
import { ProTeamsSection } from './components/pro-teams/ProTeamsSection'
import { TierListSection } from './components/tier-list/TierListSection'
import { GuidesSection } from './components/guides/GuidesSection'

function AppContent() {
  const state = useAppState()
  const dispatch = useDispatch()

  const handleNavigate = (section: SectionId) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', section })
  }

  const renderSection = () => {
    switch (state.activeSection) {
      case 'home': return <HomeSection />
      case 'profile': return <ProfileSection />
      case 'highlights': return <HighlightsSection />
      case 'ppi': return <PpiHubSection />
      case 'challenges': return <ChallengesSection />
      case 'persona': return <PersonaSection />
      case 'pro-teams': return <ProTeamsSection />
      case 'tier-list': return <TierListSection />
      case 'guides': return <GuidesSection />
      default: return <HomeSection />
    }
  }

  return (
    <div className="flex h-full bg-pb-dark">
      {/* Sidebar (desktop) */}
      <Sidebar
        activeSection={state.activeSection}
        onNavigate={handleNavigate}
        level={state.challengesState.level}
        xp={state.challengesState.xp}
        coins={state.challengesState.coins}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-4">
        {renderSection()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AppStateProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AppStateProvider>
  )
}

export default App
