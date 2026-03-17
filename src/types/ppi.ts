/** PPI (Paintball Performance Index) — 6-axis radar chart scoring system */

export type PPIAxis = 'snapShooting' | 'movement' | 'fieldIQ' | 'communication' | 'gunSkills' | 'fitness'

export const PPI_AXES: PPIAxis[] = ['snapShooting', 'movement', 'fieldIQ', 'communication', 'gunSkills', 'fitness']

export const PPI_LABELS: Record<PPIAxis, string> = {
  snapShooting: 'Snap Shooting',
  movement: 'Movement',
  fieldIQ: 'Field IQ',
  communication: 'Communication',
  gunSkills: 'Gun Skills',
  fitness: 'Fitness',
}

export const PPI_ICONS: Record<PPIAxis, string> = {
  snapShooting: 'crosshair',
  movement: 'running',
  fieldIQ: 'brain',
  communication: 'speech',
  gunSkills: 'target',
  fitness: 'heartrate',
}

export const PPI_DESCRIPTIONS: Record<PPIAxis, string> = {
  snapShooting: 'Speed and accuracy of shooting from behind a bunker',
  movement: 'Breakout speed, slide technique, bunker-to-bunker transitions',
  fieldIQ: 'Reading the layout, knowing when to push vs hold, lane control',
  communication: 'Calling out positions, coordinating pushes, feeding info',
  gunSkills: 'Marker accuracy, lane shooting, off-hand proficiency',
  fitness: 'Sprint speed, endurance, recovery between games',
}

export interface PPIScores {
  snapShooting: number  // 0-100
  movement: number
  fieldIQ: number
  communication: number
  gunSkills: number
  fitness: number
}

export interface PPIHistory {
  date: string
  scores: PPIScores
}

export function createDefaultPPI(): PPIScores {
  return {
    snapShooting: 0,
    movement: 0,
    fieldIQ: 0,
    communication: 0,
    gunSkills: 0,
    fitness: 0,
  }
}

export function createEstimatedPPI(division: string, experience: number): PPIScores {
  // Generate estimated PPI based on division + years of experience
  const divisionBase: Record<string, number> = {
    'D5': 15, 'D4': 30, 'D3': 45, 'D2': 60, 'D1': 72, 'Semi-Pro': 83, 'Pro': 91,
  }
  const base = divisionBase[division] || 25
  const expBonus = Math.min(experience * 2, 15)
  const jitter = () => Math.floor(Math.random() * 12) - 6 // -6 to +6

  return {
    snapShooting: Math.max(5, Math.min(100, base + expBonus + jitter())),
    movement: Math.max(5, Math.min(100, base + expBonus + jitter())),
    fieldIQ: Math.max(5, Math.min(100, base + expBonus + jitter())),
    communication: Math.max(5, Math.min(100, base + expBonus + jitter())),
    gunSkills: Math.max(5, Math.min(100, base + expBonus + jitter())),
    fitness: Math.max(5, Math.min(100, base + expBonus + jitter())),
  }
}

export function getCompositeScore(scores: PPIScores): number {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function getDivisionFromPPI(composite: number): string {
  if (composite >= 91) return 'Pro'
  if (composite >= 83) return 'Semi-Pro'
  if (composite >= 73) return 'D1'
  if (composite >= 61) return 'D2'
  if (composite >= 46) return 'D3'
  if (composite >= 31) return 'D4'
  return 'D5'
}

export function getSkillTier(score: number): string {
  if (score >= 86) return 'Elite'
  if (score >= 70) return 'Advanced'
  if (score >= 40) return 'Intermediate'
  return 'Beginner'
}

export function getWeakestAxis(scores: PPIScores): PPIAxis {
  let min = Infinity
  let axis: PPIAxis = 'snapShooting'
  for (const key of PPI_AXES) {
    if (scores[key] < min) {
      min = scores[key]
      axis = key
    }
  }
  return axis
}
