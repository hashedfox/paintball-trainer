/** PPI (Paintball Performance Index) — 7-axis radar chart scoring system */

import type { PositionRole } from './player'

export type PPIAxis = 'snapShooting' | 'movement' | 'fieldIQ' | 'communication' | 'gunSkills' | 'fitness' | 'mentalGame'

export const PPI_AXES: PPIAxis[] = ['snapShooting', 'movement', 'fieldIQ', 'communication', 'gunSkills', 'fitness', 'mentalGame']

/** The original 6 core axes (for backward compatibility) */
export const PPI_CORE_AXES: PPIAxis[] = ['snapShooting', 'movement', 'fieldIQ', 'communication', 'gunSkills', 'fitness']

export const PPI_LABELS: Record<PPIAxis, string> = {
  snapShooting: 'Snap Shooting',
  movement: 'Movement',
  fieldIQ: 'Field IQ',
  communication: 'Communication',
  gunSkills: 'Gun Skills',
  fitness: 'Fitness',
  mentalGame: 'Mental Game',
}

export const PPI_ICONS: Record<PPIAxis, string> = {
  snapShooting: 'crosshair',
  movement: 'running',
  fieldIQ: 'brain',
  communication: 'speech',
  gunSkills: 'target',
  fitness: 'heartrate',
  mentalGame: 'mind',
}

export const PPI_DESCRIPTIONS: Record<PPIAxis, string> = {
  snapShooting: 'Speed and accuracy of shooting from behind a bunker',
  movement: 'Breakout speed, slide technique, bunker-to-bunker transitions',
  fieldIQ: 'Reading the layout, knowing when to push vs hold, lane control',
  communication: 'Calling out positions, coordinating pushes, feeding info',
  gunSkills: 'Marker accuracy, lane shooting, off-hand proficiency',
  fitness: 'Sprint speed, endurance, recovery between games',
  mentalGame: 'Composure under pressure, decision quality, confidence, mental reset',
}

export interface PPIScores {
  snapShooting: number  // 0-100
  movement: number
  fieldIQ: number
  communication: number
  gunSkills: number
  fitness: number
  mentalGame: number
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
    mentalGame: 0,
  }
}

// ─── Position-Based PPI Weights ──────────────────────────────────────────────

/** Weight multiplier per axis per position role (higher = more critical for that role) */
export type PPIWeightLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export const POSITION_WEIGHT_VALUES: Record<PPIWeightLevel, number> = {
  CRITICAL: 1.5,
  HIGH: 1.2,
  MEDIUM: 1.0,
  LOW: 0.7,
}

export const POSITION_PPI_WEIGHTS: Record<PositionRole, Record<PPIAxis, PPIWeightLevel>> = {
  snake: {
    snapShooting: 'HIGH',
    movement: 'CRITICAL',
    fieldIQ: 'HIGH',
    communication: 'MEDIUM',
    gunSkills: 'MEDIUM',
    fitness: 'CRITICAL',
    mentalGame: 'HIGH',
  },
  dorito: {
    snapShooting: 'HIGH',
    movement: 'HIGH',
    fieldIQ: 'MEDIUM',
    communication: 'MEDIUM',
    gunSkills: 'HIGH',
    fitness: 'HIGH',
    mentalGame: 'HIGH',
  },
  'back-center': {
    snapShooting: 'MEDIUM',
    movement: 'LOW',
    fieldIQ: 'CRITICAL',
    communication: 'CRITICAL',
    gunSkills: 'CRITICAL',
    fitness: 'MEDIUM',
    mentalGame: 'HIGH',
  },
  'mid-insert': {
    snapShooting: 'HIGH',
    movement: 'HIGH',
    fieldIQ: 'CRITICAL',
    communication: 'HIGH',
    gunSkills: 'HIGH',
    fitness: 'CRITICAL',
    mentalGame: 'HIGH',
  },
  flex: {
    snapShooting: 'HIGH',
    movement: 'HIGH',
    fieldIQ: 'HIGH',
    communication: 'HIGH',
    gunSkills: 'HIGH',
    fitness: 'HIGH',
    mentalGame: 'HIGH',
  },
}

/** Get the ordered axes for a position (most critical at index 0 / 12 o'clock) */
export function getPositionAxisOrder(role: PositionRole): PPIAxis[] {
  const weights = POSITION_PPI_WEIGHTS[role]
  return [...PPI_AXES].sort((a, b) => {
    const wa = POSITION_WEIGHT_VALUES[weights[a]]
    const wb = POSITION_WEIGHT_VALUES[weights[b]]
    return wb - wa
  })
}

/** Get the ideal PPI shape for a position at a given division level */
export function getIdealShape(role: PositionRole, division: string): PPIScores {
  const divisionBase: Record<string, number> = {
    'D5': 30, 'D4': 45, 'D3': 60, 'D2': 72, 'D1': 82, 'Semi-Pro': 88, 'Pro': 95,
  }
  const base = divisionBase[division] || 45
  const weights = POSITION_PPI_WEIGHTS[role]

  const result = createDefaultPPI()
  for (const axis of PPI_AXES) {
    const weightLevel = weights[axis]
    const multiplier = weightLevel === 'CRITICAL' ? 1.1
      : weightLevel === 'HIGH' ? 1.0
      : weightLevel === 'MEDIUM' ? 0.85
      : 0.7
    result[axis] = Math.min(100, Math.round(base * multiplier))
  }
  return result
}

/** Compute position-weighted composite score */
export function getWeightedCompositeScore(scores: PPIScores, role: PositionRole): number {
  const weights = POSITION_PPI_WEIGHTS[role]
  let totalWeight = 0
  let totalScore = 0
  for (const axis of PPI_AXES) {
    const w = POSITION_WEIGHT_VALUES[weights[axis]]
    totalWeight += w
    totalScore += scores[axis] * w
  }
  return Math.round(totalScore / totalWeight)
}

// ─── Original functions (updated for 7 axes) ────────────────────────────────

export function createEstimatedPPI(division: string, experience: number, role?: PositionRole): PPIScores {
  const divisionBase: Record<string, number> = {
    'D5': 15, 'D4': 30, 'D3': 45, 'D2': 60, 'D1': 72, 'Semi-Pro': 83, 'Pro': 91,
  }
  const base = divisionBase[division] || 25
  const expBonus = Math.min(experience * 2, 15)
  const jitter = () => Math.floor(Math.random() * 12) - 6 // -6 to +6

  const scores: PPIScores = {
    snapShooting: Math.max(5, Math.min(100, base + expBonus + jitter())),
    movement: Math.max(5, Math.min(100, base + expBonus + jitter())),
    fieldIQ: Math.max(5, Math.min(100, base + expBonus + jitter())),
    communication: Math.max(5, Math.min(100, base + expBonus + jitter())),
    gunSkills: Math.max(5, Math.min(100, base + expBonus + jitter())),
    fitness: Math.max(5, Math.min(100, base + expBonus + jitter())),
    mentalGame: Math.max(5, Math.min(100, base + expBonus + jitter())),
  }

  // If position role provided, bias scores toward critical axes
  if (role) {
    const weights = POSITION_PPI_WEIGHTS[role]
    for (const axis of PPI_AXES) {
      if (weights[axis] === 'CRITICAL') {
        scores[axis] = Math.min(100, scores[axis] + 5)
      } else if (weights[axis] === 'LOW') {
        scores[axis] = Math.max(5, scores[axis] - 3)
      }
    }
  }

  return scores
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

/** Get the weakest axis weighted by position importance */
export function getPositionWeakestAxis(scores: PPIScores, role: PositionRole): PPIAxis {
  const ideal = getIdealShape(role, getDivisionFromPPI(getCompositeScore(scores)))
  let maxGap = -Infinity
  let axis: PPIAxis = 'snapShooting'
  for (const key of PPI_AXES) {
    const gap = ideal[key] - scores[key]
    if (gap > maxGap) {
      maxGap = gap
      axis = key
    }
  }
  return axis
}

// ─── Mental Game Score Computation ───────────────────────────────────────────

export type EmotionState = 'frustrated' | 'neutral' | 'locked-in'

export const EMOTION_LABELS: Record<EmotionState, string> = {
  frustrated: 'Frustrated',
  neutral: 'Neutral',
  'locked-in': 'Locked In',
}

export const EMOTION_VALUES: Record<EmotionState, number> = {
  frustrated: 25,
  neutral: 55,
  'locked-in': 90,
}

/** Compute mental game score from emotion tracking data */
export function computeMentalGameScore(emotions: EmotionState[], clutchWins: number, clutchTotal: number): number {
  if (emotions.length === 0) return 50

  // Average emotion value
  const emotionAvg = emotions.reduce((sum, e) => sum + EMOTION_VALUES[e], 0) / emotions.length

  // Emotion consistency (low variance = more stable mental game)
  const variance = emotions.reduce((sum, e) => sum + Math.pow(EMOTION_VALUES[e] - emotionAvg, 2), 0) / emotions.length
  const consistencyBonus = Math.max(0, 10 - (variance / 100))

  // Clutch conversion rate bonus
  const clutchBonus = clutchTotal > 0 ? (clutchWins / clutchTotal) * 15 : 0

  return Math.min(100, Math.max(0, Math.round(emotionAvg * 0.7 + consistencyBonus + clutchBonus)))
}

// ─── Division Percentile Benchmarking ────────────────────────────────────────

/** Simulated division percentile data (in production, this would come from a backend) */
export function getDivisionPercentile(score: number, division: string, _axis: PPIAxis): number {
  const divisionMedians: Record<string, number> = {
    'D5': 20, 'D4': 38, 'D3': 52, 'D2': 65, 'D1': 78, 'Semi-Pro': 87, 'Pro': 94,
  }
  const median = divisionMedians[division] || 38
  // Simple bell-curve approximation
  const diff = score - median
  const percentile = 50 + (diff / median) * 50
  return Math.min(99, Math.max(1, Math.round(percentile)))
}

/** Get the next division threshold score */
export function getNextDivisionThreshold(division: string): { division: string; score: number } | null {
  const thresholds: { division: string; score: number }[] = [
    { division: 'D4', score: 31 },
    { division: 'D3', score: 46 },
    { division: 'D2', score: 61 },
    { division: 'D1', score: 73 },
    { division: 'Semi-Pro', score: 83 },
    { division: 'Pro', score: 91 },
  ]
  const idx = thresholds.findIndex(t => t.division === division)
  if (idx >= 0 && idx < thresholds.length - 1) {
    return thresholds[idx + 1]
  }
  if (idx === -1) return thresholds[0]
  return null
}
