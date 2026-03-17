export type Position = 'snake1' | 'snake2' | 'centre' | 'doritto1' | 'doritto2'

export const POSITIONS: Position[] = ['snake1', 'snake2', 'centre', 'doritto1', 'doritto2']

export const POSITION_LABELS: Record<Position, string> = {
  snake1: 'Snake 1',
  snake2: 'Snake 2',
  centre: 'Centre',
  doritto1: 'Doritto 1',
  doritto2: 'Doritto 2',
}

export interface Player {
  id: string
  name: string
  position: Position
}

export interface PlayerPointStats {
  playerId: string
  position: Position
  survived: boolean        // SUR
  otbSurvived: boolean     // OTBS
  bunkerDiedAt: string     // BD
  breakoutKills: number    // G1
  totalKills: number       // KILL
  bunkerKillsMadeAt: string // BK
  penalties: number        // PEN
  trades: number           // TRD
  commsRating: number      // COM (1-5)
}

export function createEmptyPlayerStats(playerId: string, position: Position): PlayerPointStats {
  return {
    playerId,
    position,
    survived: false,
    otbSurvived: false,
    bunkerDiedAt: '',
    breakoutKills: 0,
    totalKills: 0,
    bunkerKillsMadeAt: '',
    penalties: 0,
    trades: 0,
    commsRating: 3,
  }
}
