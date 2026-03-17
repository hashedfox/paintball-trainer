import type { GpiResult, LetterGrade } from '../types/analytics'
import type { TeamAggregate } from '../store/selectors'

const WEIGHTS = {
  survival: 0.25,
  otb: 0.20,
  killsPerPoint: 0.20,
  discipline: 0.15,
  comms: 0.10,
  winRate: 0.10,
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

function getGrade(score: number): LetterGrade {
  if (score >= 90) return 'S'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 45) return 'C'
  return 'D'
}

export function computeGpi(stats: TeamAggregate): GpiResult {
  const survival = clamp(stats.survivalPct)
  const otb = clamp(stats.otbPct)
  const killsPerPoint = clamp(Math.min(stats.killsPP / 2.0, 1) * 100) // 2.0 kills/pt = 100
  const discipline = clamp(Math.max(0, 100 - stats.penPM * 25)) // each penalty costs 25 points
  const comms = clamp((stats.avgComm / 5) * 100) // 5 = perfect
  const winRate = clamp(stats.winPct)

  const overall = Math.round(
    survival * WEIGHTS.survival +
    otb * WEIGHTS.otb +
    killsPerPoint * WEIGHTS.killsPerPoint +
    discipline * WEIGHTS.discipline +
    comms * WEIGHTS.comms +
    winRate * WEIGHTS.winRate
  )

  return {
    overall,
    grade: getGrade(overall),
    breakdown: {
      survival: Math.round(survival),
      otb: Math.round(otb),
      killsPerPoint: Math.round(killsPerPoint),
      discipline: Math.round(discipline),
      comms: Math.round(comms),
      winRate: Math.round(winRate),
    },
  }
}

export const GRADE_COLORS: Record<LetterGrade, string> = {
  S: '#E3B341',
  A: '#39D353',
  B: '#58A6FF',
  C: '#F0883E',
  D: '#F85149',
}
