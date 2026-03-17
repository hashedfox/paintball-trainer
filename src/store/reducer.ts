import { nanoid } from 'nanoid'
import type { AppState } from './context'
import type { Action } from './actions'
import { createEmptyPlayerStats } from '../types/player'
import { createEmptyTeamStats, type PointData } from '../types/point'

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TEAM_NAME':
      return { ...state, teamName: action.name }

    case 'SET_OPPONENT_NAME':
      return { ...state, opponentName: action.name }

    case 'ADD_PLAYER':
      return { ...state, roster: [...state.roster, action.player] }

    case 'REMOVE_PLAYER':
      return { ...state, roster: state.roster.filter((p) => p.id !== action.playerId) }

    case 'UPDATE_PLAYER_NAME':
      return {
        ...state,
        roster: state.roster.map((p) => (p.id === action.playerId ? { ...p, name: action.name } : p)),
      }

    case 'UPDATE_PLAYER_POSITION':
      return {
        ...state,
        roster: state.roster.map((p) => (p.id === action.playerId ? { ...p, position: action.position } : p)),
      }

    case 'ADD_POINT': {
      const newPoint = {
        id: nanoid(),
        pointNumber: state.points.length + 1,
        teamStats: createEmptyTeamStats(),
        playerStats: state.roster.map((p) => createEmptyPlayerStats(p.id, p.position)),
        isDummyData: false,
      }
      return {
        ...state,
        points: [...state.points, newPoint],
        activePointIndex: state.points.length,
      }
    }

    case 'REMOVE_POINT': {
      const filtered = state.points
        .filter((p) => p.id !== action.pointId)
        .map((p, i) => ({ ...p, pointNumber: i + 1 }))
      return {
        ...state,
        points: filtered,
        activePointIndex: Math.min(state.activePointIndex, Math.max(0, filtered.length - 1)),
      }
    }

    case 'SET_ACTIVE_POINT':
      return { ...state, activePointIndex: action.index }

    case 'UPDATE_TEAM_STAT': {
      // If this is the first real result entry and we have dummy data, clear it
      if (
        action.field === 'result' &&
        action.value !== null &&
        state.points.some((p) => p.isDummyData)
      ) {
        const teamStats = createEmptyTeamStats()
        teamStats.result = action.value as 'win' | 'loss'
        const newPoint = {
          id: nanoid(),
          pointNumber: 1,
          teamStats,
          playerStats: state.roster.map((p) => createEmptyPlayerStats(p.id, p.position)),
          isDummyData: false,
        }
        return {
          ...state,
          points: [newPoint] as PointData[],
          activePointIndex: 0,
        }
      }

      return {
        ...state,
        points: state.points.map((p) =>
          p.id === action.pointId ? { ...p, teamStats: { ...p.teamStats, [action.field]: action.value } } : p
        ),
      }
    }

    case 'UPDATE_PLAYER_STAT':
      return {
        ...state,
        points: state.points.map((p) =>
          p.id === action.pointId
            ? {
                ...p,
                playerStats: p.playerStats.map((ps) =>
                  ps.playerId === action.playerId ? { ...ps, [action.field]: action.value } : ps
                ),
              }
            : p
        ),
      }

    case 'CLEAR_DUMMY_DATA':
      return {
        ...state,
        points: state.points.filter((p) => !p.isDummyData),
      }

    case 'SET_LANGUAGE':
      return { ...state, language: action.lang }

    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, [action.field]: action.value } }

    default:
      return state
  }
}
