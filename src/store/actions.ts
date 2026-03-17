import type { Player, PlayerPointStats, Position } from '../types/player'
import type { TeamPointStats } from '../types/point'
import type { OnboardingData } from '../types/onboarding'
import type { Challenge } from '../types/challenges'

export type Action =
  | { type: 'SET_TEAM_NAME'; name: string }
  | { type: 'SET_OPPONENT_NAME'; name: string }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'UPDATE_PLAYER_NAME'; playerId: string; name: string }
  | { type: 'UPDATE_PLAYER_POSITION'; playerId: string; position: Position }
  | { type: 'ADD_POINT' }
  | { type: 'REMOVE_POINT'; pointId: string }
  | { type: 'SET_ACTIVE_POINT'; index: number }
  | { type: 'UPDATE_TEAM_STAT'; pointId: string; field: keyof TeamPointStats; value: TeamPointStats[keyof TeamPointStats] }
  | { type: 'UPDATE_PLAYER_STAT'; pointId: string; playerId: string; field: keyof PlayerPointStats; value: PlayerPointStats[keyof PlayerPointStats] }
  | { type: 'CLEAR_DUMMY_DATA' }
  | { type: 'SET_LANGUAGE'; lang: 'en' | 'pt' | 'es' }
  | { type: 'SET_PROFILE'; field: string; value: string }
  // Onboarding
  | { type: 'SET_ONBOARDING'; data: Partial<OnboardingData> }
  | { type: 'COMPLETE_ONBOARDING' }
  // Challenges & Gamification
  | { type: 'UPDATE_CHALLENGE_PROGRESS'; challengeId: string; progress: number }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'PURCHASE_ITEM'; itemId: string; cost: number }
  | { type: 'RECORD_LOGIN' }
  | { type: 'REFRESH_DAILY_CHALLENGES'; challenges: Challenge[] }
  // Persona
  | { type: 'EQUIP_ITEM'; slot: string; itemId: string }
  | { type: 'UNEQUIP_ITEM'; slot: string }
  | { type: 'ADD_TO_INVENTORY'; itemId: string }
  | { type: 'SET_PERSONA_COLOR'; color: string }
  | { type: 'SET_PERSONA_NUMBER'; number: string }
  // Navigation
  | { type: 'SET_ACTIVE_SECTION'; section: string }
