export type Position = 'snake1' | 'snake2' | 'centre' | 'doritto1' | 'doritto2' | 'back-center' | 'mid-insert' | 'flex'

export const POSITIONS: Position[] = ['snake1', 'snake2', 'centre', 'doritto1', 'doritto2', 'back-center', 'mid-insert', 'flex']

export const POSITION_LABELS: Record<Position, string> = {
  snake1: 'Snake 1',
  snake2: 'Snake 2',
  centre: 'Centre',
  doritto1: 'Doritto 1',
  doritto2: 'Doritto 2',
  'back-center': 'Back Center',
  'mid-insert': 'Mid / Insert',
  flex: 'Flex',
}

export const POSITION_DESCRIPTIONS: Record<Position, string> = {
  snake1: 'Primary snake — aggressive front player, crawls, bumps, and closes eliminations',
  snake2: 'Support snake — backs up snake 1, mirror gunfights, secondary aggression',
  centre: 'Centre / Mid — quarterback, reads the field, directs traffic and fills gaps',
  doritto1: 'Primary dorito — aggressive front player, mirror battles, angle fighting',
  doritto2: 'Support dorito — secondary aggression, cross-field info, dorito control',
  'back-center': 'Back center — traffic control, break shooting, lane holding, game management',
  'mid-insert': 'Mid / Insert — fills gaps, versatile role, sprint-heavy, rotational',
  flex: 'Flex — adapts to any position based on team needs',
}

/** Positional role grouping for PPI weighting */
export type PositionRole = 'snake' | 'dorito' | 'back-center' | 'mid-insert' | 'flex'

export function getPositionRole(position: Position): PositionRole {
  switch (position) {
    case 'snake1':
    case 'snake2':
      return 'snake'
    case 'doritto1':
    case 'doritto2':
      return 'dorito'
    case 'back-center':
      return 'back-center'
    case 'mid-insert':
    case 'centre':
      return 'mid-insert'
    case 'flex':
      return 'flex'
  }
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
