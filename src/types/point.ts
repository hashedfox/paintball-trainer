import type { PlayerPointStats } from './player'

export interface TeamPointStats {
  result: 'win' | 'loss' | null
  upDownBodies: number
  homeAway: 'home' | 'away'
  playUsed: string
  otbBodyCount: number
  totalKills: number
  penalties: number
  pointTimeToWin: number // seconds
}

export interface PointData {
  id: string
  pointNumber: number
  teamStats: TeamPointStats
  playerStats: PlayerPointStats[]
  isDummyData: boolean
}

export function createEmptyTeamStats(): TeamPointStats {
  return {
    result: null,
    upDownBodies: 0,
    homeAway: 'home',
    playUsed: '',
    otbBodyCount: 0,
    totalKills: 0,
    penalties: 0,
    pointTimeToWin: 0,
  }
}
