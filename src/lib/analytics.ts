import type { SpiderValues } from '../types/analytics'
import type { TeamAggregate, PlayerAggregate } from '../store/selectors'

// Normalize team stats to 0-1 for spider chart
export function normalizeTeamForSpider(stats: TeamAggregate): number[] {
  return [
    stats.survivalPct / 100,                              // SUR%
    stats.otbPct / 100,                                   // OTB%
    Math.min(stats.killsPP / 1.5, 1),                    // K/PP (1.5 = max)
    Math.min(stats.g1PP / 0.5, 1),                       // G1 (0.5 = max)
    stats.avgComm / 5,                                    // COM (5 = max)
    Math.max(0, 1 - stats.penPM / 3),                    // Discipline (inverted)
  ]
}

export function normalizeProForSpider(benchmarks: SpiderValues): number[] {
  return [
    benchmarks.survivalPct / 100,
    benchmarks.otbPct / 100,
    Math.min(benchmarks.killsPerPoint / 1.5, 1),
    Math.min(benchmarks.breakoutKills / 0.5, 1),
    benchmarks.commsAvg / 5,
    benchmarks.disciplineScore / 100,
  ]
}

export function normalizePlayerForSpider(player: PlayerAggregate): number[] {
  return [
    player.survivalPct / 100,
    player.otbPct / 100,
    Math.min(player.killsPerPoint / 1.5, 1),
    Math.min(player.g1PerPoint / 0.5, 1),
    player.avgComms / 5,
    Math.max(0, 1 - player.penalties / (player.pointsPlayed || 1) / 3),
  ]
}

export const SPIDER_AXES = ['SUR%', 'OTB%', 'K/PP', 'G1', 'COM', 'DISC']
