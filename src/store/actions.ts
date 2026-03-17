import type { Player, PlayerPointStats, Position } from '../types/player'
import type { TeamPointStats } from '../types/point'
import type { OnboardingData } from '../types/onboarding'
import type { Challenge } from '../types/challenges'
import type { PPIScores, PPIAxis } from '../types/ppi'
import type { SessionData, PointLog } from '../types/session'
import type { DrillResult } from '../types/drill'
import type { Achievement } from '../types/achievement'
import type { BreakoutPlan, ScoutingNote } from '../types/layout'

export type Action =
  // Team management
  | { type: 'SET_TEAM_NAME'; name: string }
  | { type: 'SET_OPPONENT_NAME'; name: string }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'UPDATE_PLAYER_NAME'; playerId: string; name: string }
  | { type: 'UPDATE_PLAYER_POSITION'; playerId: string; position: Position }

  // Point tracking (legacy)
  | { type: 'ADD_POINT' }
  | { type: 'REMOVE_POINT'; pointId: string }
  | { type: 'SET_ACTIVE_POINT'; index: number }
  | { type: 'UPDATE_TEAM_STAT'; pointId: string; field: keyof TeamPointStats; value: TeamPointStats[keyof TeamPointStats] }
  | { type: 'UPDATE_PLAYER_STAT'; pointId: string; playerId: string; field: keyof PlayerPointStats; value: PlayerPointStats[keyof PlayerPointStats] }
  | { type: 'CLEAR_DUMMY_DATA' }

  // UI & Profile
  | { type: 'SET_LANGUAGE'; lang: 'en' | 'pt' | 'es' }
  | { type: 'SET_PROFILE'; field: string; value: string | number }
  | { type: 'SET_ACTIVE_SECTION'; section: string }

  // Onboarding
  | { type: 'SET_ONBOARDING'; data: Partial<OnboardingData> }
  | { type: 'COMPLETE_ONBOARDING' }

  // PPI system
  | { type: 'SET_PPI_SCORES'; scores: PPIScores }
  | { type: 'UPDATE_PPI_AXIS'; axis: PPIAxis; value: number }
  | { type: 'SET_PPI_ESTIMATED'; estimated: boolean }
  | { type: 'SNAPSHOT_PPI' }  // save current scores to history

  // Session logging
  | { type: 'START_SESSION'; session: SessionData }
  | { type: 'LOG_POINT'; sessionId: string; point: PointLog }
  | { type: 'END_SESSION'; sessionId: string }
  | { type: 'UPDATE_SESSION_NOTES'; sessionId: string; notes: string }

  // Drills
  | { type: 'COMPLETE_DRILL'; result: DrillResult }

  // Achievements
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'UPDATE_ACHIEVEMENT_PROGRESS'; achievementId: string; progress: number }

  // Layout planner
  | { type: 'SAVE_BREAKOUT_PLAN'; plan: BreakoutPlan }
  | { type: 'DELETE_BREAKOUT_PLAN'; planId: string }
  | { type: 'SAVE_SCOUTING_NOTE'; note: ScoutingNote }

  // Focus system
  | { type: 'SET_FOCUS_AXIS'; axis: string }
  | { type: 'DISMISS_FOCUS_CARD' }

  // Streak
  | { type: 'RECORD_ACTIVITY' }
  | { type: 'USE_STREAK_FREEZE' }

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
