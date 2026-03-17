/** Recovery & Load Management — Readiness tracking */

export interface ReadinessEntry {
  date: string
  score: number  // 1-10
  timestamp: number
}

export interface TrainingLoadEntry {
  date: string
  physical: number    // minutes
  technical: number   // minutes
  mental: number      // minutes
  rest: boolean       // was this a rest day?
}

export interface TournamentEvent {
  id: string
  name: string
  date: string       // YYYY-MM-DD
  league: string
}

export function getReadinessLabel(score: number): string {
  if (score >= 9) return 'Explosive'
  if (score >= 7) return 'Ready'
  if (score >= 5) return 'Moderate'
  if (score >= 3) return 'Fatigued'
  return 'Wrecked'
}

export function getReadinessColor(score: number): string {
  if (score >= 8) return '#2DD4A8'
  if (score >= 6) return '#4A7BF7'
  if (score >= 4) return '#D4A843'
  return '#EF4444'
}

export function shouldSuggestRecovery(readinessHistory: ReadinessEntry[], recentTrainingMinutes: number): boolean {
  if (readinessHistory.length < 2) return false
  const recent = readinessHistory.slice(-3)
  const avgReadiness = recent.reduce((sum, r) => sum + r.score, 0) / recent.length
  return avgReadiness < 5 && recentTrainingMinutes > 120
}

export function getDaysUntilEvent(eventDate: string): number {
  const now = new Date()
  const event = new Date(eventDate)
  const diff = event.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isInTaperWindow(eventDate: string): boolean {
  return getDaysUntilEvent(eventDate) <= 14 && getDaysUntilEvent(eventDate) > 0
}

/** Recommended training balance by division */
export function getRecommendedBalance(division: string): { physical: number; technical: number; mental: number; rest: number } {
  switch (division) {
    case 'D5':
    case 'D4':
      return { physical: 25, technical: 45, mental: 10, rest: 20 }
    case 'D3':
      return { physical: 30, technical: 40, mental: 15, rest: 15 }
    case 'D2':
    case 'D1':
      return { physical: 25, technical: 35, mental: 25, rest: 15 }
    default:
      return { physical: 25, technical: 30, mental: 30, rest: 15 }
  }
}
