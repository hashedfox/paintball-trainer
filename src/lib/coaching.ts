import type { CoachingRecommendation } from '../types/analytics'
import type { TeamAggregate } from '../store/selectors'

export function detectWeaknesses(stats: TeamAggregate): CoachingRecommendation[] {
  const recs: CoachingRecommendation[] = []

  if (stats.survivalPct < 40) {
    recs.push({
      area: 'survival',
      severity: 'critical',
      currentValue: stats.survivalPct,
      targetValue: 55,
      messageKey: 'coaching.survival.critical',
      drillIds: ['bki-snap', 'virtue-breakout'],
    })
  } else if (stats.survivalPct < 55) {
    recs.push({
      area: 'survival',
      severity: 'high',
      currentValue: stats.survivalPct,
      targetValue: 60,
      messageKey: 'coaching.survival.high',
      drillIds: ['bki-snap'],
    })
  }

  if (stats.otbPct < 60) {
    recs.push({
      area: 'otb',
      severity: 'critical',
      currentValue: stats.otbPct,
      targetValue: 80,
      messageKey: 'coaching.otb.critical',
      drillIds: ['virtue-breakout', 'bki-adrill'],
    })
  } else if (stats.otbPct < 75) {
    recs.push({
      area: 'otb',
      severity: 'high',
      currentValue: stats.otbPct,
      targetValue: 85,
      messageKey: 'coaching.otb.high',
      drillIds: ['virtue-breakout'],
    })
  }

  if (stats.killsPP < 0.4) {
    recs.push({
      area: 'kills',
      severity: 'high',
      currentValue: stats.killsPP,
      targetValue: 0.8,
      messageKey: 'coaching.kills.high',
      drillIds: ['bki-snap', 'bk-3row'],
    })
  }

  if (stats.penPM > 1.5) {
    recs.push({
      area: 'discipline',
      severity: 'critical',
      currentValue: stats.penPM,
      targetValue: 0.5,
      messageKey: 'coaching.discipline.critical',
      drillIds: ['bki-penalty'],
    })
  } else if (stats.penPM > 0.8) {
    recs.push({
      area: 'discipline',
      severity: 'medium',
      currentValue: stats.penPM,
      targetValue: 0.5,
      messageKey: 'coaching.discipline.medium',
      drillIds: ['bki-penalty'],
    })
  }

  if (stats.avgComm < 2.5) {
    recs.push({
      area: 'comms',
      severity: 'high',
      currentValue: stats.avgComm,
      targetValue: 3.5,
      messageKey: 'coaching.comms.high',
      drillIds: ['bki-comms'],
    })
  } else if (stats.avgComm < 3.2) {
    recs.push({
      area: 'comms',
      severity: 'medium',
      currentValue: stats.avgComm,
      targetValue: 4.0,
      messageKey: 'coaching.comms.medium',
      drillIds: ['bki-comms'],
    })
  }

  if (stats.g1PP < 0.1) {
    recs.push({
      area: 'g1',
      severity: 'high',
      currentValue: stats.g1PP,
      targetValue: 0.25,
      messageKey: 'coaching.g1.high',
      drillIds: ['bk-3row', 'bki-adrill'],
    })
  }

  return recs.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })
}
