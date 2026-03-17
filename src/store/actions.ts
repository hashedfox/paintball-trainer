import type { Player, PlayerPointStats, Position } from '../types/player'
import type { TeamPointStats } from '../types/point'

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
