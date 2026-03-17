import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Player } from '../types/player'
import type { PointData } from '../types/point'
import type { OnboardingData } from '../types/onboarding'
import type { ChallengesState } from '../types/challenges'
import type { PersonaState } from '../types/persona'
import type { PPIScores, PPIHistory } from '../types/ppi'
import type { SessionData, SessionSummary } from '../types/session'
import type { DrillResult } from '../types/drill'
import type { Achievement } from '../types/achievement'
import type { BreakoutPlan, ScoutingNote } from '../types/layout'
import type { Action } from './actions'
import { appReducer } from './reducer'
import { saveState, loadState } from './storage'
import { createDefaultRoster, createDummyPoints, DEFAULT_TEAM_NAME, DEFAULT_OPPONENT_NAME } from '../constants/defaults'
import { createDefaultOnboarding } from '../types/onboarding'
import { createDefaultChallengesState } from '../types/challenges'
import { createDefaultPersona } from '../types/persona'
import { createDefaultPPI } from '../types/ppi'
import { DEFAULT_ACHIEVEMENTS } from '../types/achievement'

export interface ProfileData {
  name: string
  team: string
  position: string
  division: string
  gameFormat: string
  yearsPlaying: number
}

export type SectionId =
  | 'home'
  | 'profile'
  | 'session-logger'
  | 'session-report'
  | 'layout-planner'
  | 'drills'
  | 'achievements'
  | 'challenges'
  | 'persona'
  | 'pro-teams'
  | 'tier-list'
  | 'guides'
  | 'highlights'
  | 'ppi'

export interface AppState {
  // Team data
  teamName: string
  opponentName: string
  roster: Player[]
  points: PointData[]
  activePointIndex: number

  // User profile
  language: 'en' | 'pt' | 'es'
  profile: ProfileData
  activeSection: SectionId
  onboarding: OnboardingData

  // PPI system
  ppiScores: PPIScores
  ppiHistory: PPIHistory[]
  ppiEstimated: boolean  // true until first real calibration

  // Session logging
  sessions: SessionData[]
  activeSessionId: string | null
  sessionSummaries: SessionSummary[]

  // Drills
  drillResults: DrillResult[]
  completedDrillIds: string[]

  // Achievements
  achievements: Achievement[]

  // Layout planner
  breakoutPlans: BreakoutPlan[]
  scoutingNotes: ScoutingNote[]

  // Gamification (existing)
  challengesState: ChallengesState
  personaState: PersonaState

  // Focus system
  todaysFocusAxis: string
  focusCardDismissed: boolean

  // Streaks
  trainingStreak: number
  lastActivityDate: string
  streakFreezeAvailable: boolean
}

function createInitialState(): AppState {
  const saved = loadState()
  if (saved) {
    // Ensure new fields exist on loaded state
    return {
      ...createFreshState(),
      ...saved,
      // Ensure these always exist even if old save doesn't have them
      ppiScores: saved.ppiScores || createDefaultPPI(),
      ppiHistory: saved.ppiHistory || [],
      ppiEstimated: saved.ppiEstimated ?? true,
      sessions: saved.sessions || [],
      activeSessionId: saved.activeSessionId || null,
      sessionSummaries: saved.sessionSummaries || [],
      drillResults: saved.drillResults || [],
      completedDrillIds: saved.completedDrillIds || [],
      achievements: saved.achievements || DEFAULT_ACHIEVEMENTS,
      breakoutPlans: saved.breakoutPlans || [],
      scoutingNotes: saved.scoutingNotes || [],
      todaysFocusAxis: saved.todaysFocusAxis || 'snapShooting',
      focusCardDismissed: saved.focusCardDismissed || false,
      trainingStreak: saved.trainingStreak || 0,
      lastActivityDate: saved.lastActivityDate || '',
      streakFreezeAvailable: saved.streakFreezeAvailable ?? true,
    }
  }
  return createFreshState()
}

function createFreshState(): AppState {
  const roster = createDefaultRoster()
  const points = createDummyPoints(roster)

  return {
    teamName: DEFAULT_TEAM_NAME,
    opponentName: DEFAULT_OPPONENT_NAME,
    roster,
    points,
    activePointIndex: 0,
    language: 'en',
    profile: {
      name: '',
      team: '',
      position: 'centre',
      division: 'D4',
      gameFormat: 'Speedball',
      yearsPlaying: 1,
    },
    activeSection: 'home',
    onboarding: createDefaultOnboarding(),
    ppiScores: createDefaultPPI(),
    ppiHistory: [],
    ppiEstimated: true,
    sessions: [],
    activeSessionId: null,
    sessionSummaries: [],
    drillResults: [],
    completedDrillIds: [],
    achievements: DEFAULT_ACHIEVEMENTS,
    breakoutPlans: [],
    scoutingNotes: [],
    challengesState: createDefaultChallengesState(),
    personaState: createDefaultPersona(),
    todaysFocusAxis: 'snapShooting',
    focusCardDismissed: false,
    trainingStreak: 0,
    lastActivityDate: '',
    streakFreezeAvailable: true,
  }
}

const AppStateCtx = createContext<AppState | null>(null)
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, createInitialState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <AppStateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>
        {children}
      </DispatchCtx.Provider>
    </AppStateCtx.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateCtx)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

export function useDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchCtx)
  if (!ctx) throw new Error('useDispatch must be used within AppStateProvider')
  return ctx
}
