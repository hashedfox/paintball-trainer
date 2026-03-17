import { nanoid } from 'nanoid'
import type { AppState } from './context'
import type { Action } from './actions'
import { createEmptyPlayerStats } from '../types/player'
import { createEmptyTeamStats, type PointData } from '../types/point'
import { getLevelFromXp } from '../types/challenges'

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

    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.section as AppState['activeSection'] }

    // Onboarding
    case 'SET_ONBOARDING':
      return { ...state, onboarding: { ...state.onboarding, ...action.data } }

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        onboarding: { ...state.onboarding, completed: true },
        profile: {
          ...state.profile,
          name: state.onboarding.playerName || state.profile.name,
          position: state.onboarding.primaryPosition || state.profile.position,
        },
      }

    // Challenges
    case 'UPDATE_CHALLENGE_PROGRESS':
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          activeChallenges: state.challengesState.activeChallenges.map((c) =>
            c.id === action.challengeId ? { ...c, progress: Math.min(action.progress, c.requirement) } : c
          ),
        },
      }

    case 'COMPLETE_CHALLENGE': {
      const challenge = state.challengesState.activeChallenges.find((c) => c.id === action.challengeId)
      if (!challenge || challenge.completed) return state
      const newXp = state.challengesState.xp + challenge.xpReward
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          activeChallenges: state.challengesState.activeChallenges.map((c) =>
            c.id === action.challengeId ? { ...c, completed: true, progress: c.requirement } : c
          ),
          completedChallenges: [...state.challengesState.completedChallenges, action.challengeId],
          xp: newXp,
          level: getLevelFromXp(newXp),
          coins: state.challengesState.coins + challenge.coinReward,
        },
      }
    }

    case 'ADD_XP': {
      const newXp = state.challengesState.xp + action.amount
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          xp: newXp,
          level: getLevelFromXp(newXp),
        },
      }
    }

    case 'ADD_COINS':
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          coins: state.challengesState.coins + action.amount,
        },
      }

    case 'PURCHASE_ITEM':
      if (state.challengesState.coins < action.cost) return state
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          coins: state.challengesState.coins - action.cost,
          ownedItems: [...state.challengesState.ownedItems, action.itemId],
        },
        personaState: {
          ...state.personaState,
          inventory: [...state.personaState.inventory, action.itemId],
        },
      }

    case 'RECORD_LOGIN': {
      const today = new Date().toISOString().split('T')[0]
      if (state.challengesState.lastLoginDate === today) return state
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const isConsecutive = state.challengesState.lastLoginDate === yesterday
      const newStreak = isConsecutive ? state.challengesState.loginStreak + 1 : 1
      const loginXp = 10 * newStreak
      const newXp = state.challengesState.xp + loginXp
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          lastLoginDate: today,
          loginStreak: newStreak,
          xp: newXp,
          level: getLevelFromXp(newXp),
          coins: state.challengesState.coins + 5 * newStreak,
        },
      }
    }

    case 'REFRESH_DAILY_CHALLENGES':
      return {
        ...state,
        challengesState: {
          ...state.challengesState,
          activeChallenges: [
            ...action.challenges,
            ...state.challengesState.activeChallenges.filter((c) => c.type !== 'daily'),
          ],
        },
      }

    // Persona
    case 'EQUIP_ITEM':
      return {
        ...state,
        personaState: {
          ...state.personaState,
          equipped: { ...state.personaState.equipped, [action.slot]: action.itemId },
        },
      }

    case 'UNEQUIP_ITEM': {
      const newEquipped = { ...state.personaState.equipped }
      delete newEquipped[action.slot as keyof typeof newEquipped]
      return {
        ...state,
        personaState: { ...state.personaState, equipped: newEquipped },
      }
    }

    case 'ADD_TO_INVENTORY':
      return {
        ...state,
        personaState: {
          ...state.personaState,
          inventory: [...state.personaState.inventory, action.itemId],
        },
      }

    case 'SET_PERSONA_COLOR':
      return {
        ...state,
        personaState: { ...state.personaState, activeColor: action.color },
      }

    case 'SET_PERSONA_NUMBER':
      return {
        ...state,
        personaState: { ...state.personaState, teamNumber: action.number },
      }

    default:
      return state
  }
}
