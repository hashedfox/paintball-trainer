import { nanoid } from 'nanoid'
import type { Player, Position } from '../types/player'
import type { PointData } from '../types/point'

const ROSTER_DATA: [string, Position][] = [
  ['Rob', 'snake1'],
  ['Riley', 'snake2'],
  ['Rene', 'centre'],
  ['Adam', 'doritto1'],
  ['Alex', 'doritto2'],
]

export function createDefaultRoster(): Player[] {
  return ROSTER_DATA.map(([name, position]) => ({
    id: nanoid(),
    name,
    position,
  }))
}

export const DEFAULT_TEAM_NAME = 'Lumberjacks'
export const DEFAULT_OPPONENT_NAME = 'Dynasty'

// Generate 7 dummy points with randomized but realistic stats
export function createDummyPoints(roster: Player[]): PointData[] {
  const results: ('win' | 'loss')[] = ['win', 'win', 'loss', 'win', 'loss', 'win', 'loss']
  return results.map((result, i) => {
    const isWin = result === 'win'
    return {
      id: nanoid(),
      pointNumber: i + 1,
      isDummyData: true,
      teamStats: {
        result,
        upDownBodies: isWin ? Math.floor(Math.random() * 3) + 1 : -(Math.floor(Math.random() * 3) + 1),
        homeAway: i % 2 === 0 ? 'home' as const : 'away' as const,
        playUsed: ['Stack Left', 'Stack Right', 'Spread', 'Snake Push', 'D-Side Heavy', 'Mirror', 'Centre Control'][i],
        otbBodyCount: Math.floor(Math.random() * 3),
        totalKills: Math.floor(Math.random() * 4) + 2,
        penalties: Math.random() > 0.7 ? 1 : 0,
        pointTimeToWin: isWin ? Math.floor(Math.random() * 90) + 30 : 0,
      },
      playerStats: roster.map((player) => ({
        playerId: player.id,
        position: player.position,
        survived: Math.random() > (isWin ? 0.3 : 0.6),
        otbSurvived: Math.random() > 0.2,
        bunkerDiedAt: Math.random() > 0.5 ? ['S1', 'S2', 'D1', 'D2', 'C', '50'][Math.floor(Math.random() * 6)] : '',
        breakoutKills: Math.random() > 0.6 ? 1 : 0,
        totalKills: Math.floor(Math.random() * 3),
        bunkerKillsMadeAt: Math.random() > 0.5 ? ['S2', 'D1', 'C', '50', 'Snake'][Math.floor(Math.random() * 5)] : '',
        penalties: Math.random() > 0.85 ? 1 : 0,
        trades: Math.random() > 0.7 ? 1 : 0,
        commsRating: Math.floor(Math.random() * 3) + 2, // 2-4
      })),
    }
  })
}
