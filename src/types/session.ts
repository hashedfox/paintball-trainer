/** Session & Point logging — built around the 2-tap rule */

import type { EmotionState } from './ppi'

export type SessionType = 'practice' | 'scrimmage' | 'tournament'
export type PointResult = 'win' | 'loss'
export type EliminationType = 'shot-out' | 'bunkered' | 'run-through' | 'trade' | 'survived'

export interface PointLog {
  id: string
  pointNumber: number
  result: PointResult
  eliminationBunker: string  // bunker ID where eliminated, or '' if survived
  eliminationType: EliminationType
  voiceNoteUrl?: string
  voiceNoteText?: string
  focusRating?: number  // 1-5 self-rate on today's focus area
  emotion?: EmotionState  // post-point emotion tracker
  timestamp: number
}

/** Session quality self-assessment (filled at end of session) */
export interface SessionQuality {
  overallRating: number  // 1-5 stars
  focusExecution: 'yes' | 'somewhat' | 'no'
  lessonLearned: string  // optional free-text
}

export interface SessionData {
  id: string
  date: string
  type: SessionType
  layoutId: string
  points: PointLog[]
  focusArea: string  // PPI axis name
  isComplete: boolean
  notes: string
  videoUrls: string[]
  quality?: SessionQuality
  visualizationCompleted?: boolean  // pre-point visualization prompt
  // Computed after session
  totalPoints: number
  wins: number
  losses: number
  eliminations: number
  deaths: number
  survivalRate: number
}

export interface SessionSummary {
  id: string
  date: string
  type: SessionType
  totalPoints: number
  winRate: number
  eliminations: number
  deaths: number
  focusArea: string
  focusVerdict: 'improved' | 'flat' | 'declined'
  xpEarned: number
  qualityRating?: number  // 1-5 from SessionQuality
}

export function createNewSession(type: SessionType, layoutId: string, focusArea: string): SessionData {
  return {
    id: `session-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type,
    layoutId,
    points: [],
    focusArea,
    isComplete: false,
    notes: '',
    videoUrls: [],
    totalPoints: 0,
    wins: 0,
    losses: 0,
    eliminations: 0,
    deaths: 0,
    survivalRate: 0,
  }
}

export function computeSessionStats(session: SessionData): SessionData {
  const wins = session.points.filter(p => p.result === 'win').length
  const losses = session.points.filter(p => p.result === 'loss').length
  const deaths = session.points.filter(p => p.eliminationType !== 'survived').length
  const survived = session.points.filter(p => p.eliminationType === 'survived').length

  return {
    ...session,
    totalPoints: session.points.length,
    wins,
    losses,
    eliminations: 0, // derived from team data if available
    deaths,
    survivalRate: session.points.length > 0 ? survived / session.points.length : 0,
  }
}
