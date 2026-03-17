import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Player } from '../types/player'
import type { PointData } from '../types/point'
import type { Action } from './actions'
import { appReducer } from './reducer'
import { saveState, loadState } from './storage'
import { createDefaultRoster, createDummyPoints, DEFAULT_TEAM_NAME, DEFAULT_OPPONENT_NAME } from '../constants/defaults'

export interface ProfileData {
  name: string
  team: string
  position: string
  division: string
}

export interface AppState {
  teamName: string
  opponentName: string
  roster: Player[]
  points: PointData[]
  activePointIndex: number
  language: 'en' | 'pt' | 'es'
  profile: ProfileData
}

function createInitialState(): AppState {
  const saved = loadState()
  if (saved) return saved

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
    },
  }
}

const AppStateCtx = createContext<AppState | null>(null)
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, createInitialState)

  // Persist to localStorage on every state change
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
