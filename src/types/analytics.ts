export type LetterGrade = 'S' | 'A' | 'B' | 'C' | 'D'

export interface GpiResult {
  overall: number
  grade: LetterGrade
  breakdown: {
    survival: number
    otb: number
    killsPerPoint: number
    discipline: number
    comms: number
    winRate: number
  }
}

export interface SpiderValues {
  survivalPct: number
  otbPct: number
  killsPerPoint: number
  breakoutKills: number
  commsAvg: number
  disciplineScore: number
}

export interface CoachingRecommendation {
  area: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  currentValue: number
  targetValue: number
  messageKey: string
  drillIds: string[]
}

export interface ProTeamProfile {
  id: string
  name: string
  tier: string
  color: string
  description: string
  facts: string[]
  roster: string[]
  benchmarks: SpiderValues
  winPct: number
  // Estimated coaching community benchmarks
  survivalPct: number
  otbPct: number
  killsPP: number
  g1PP: number
  penPM: number
  avgComm: number
}
