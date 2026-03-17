import { useMemo } from 'react'
import type { AppState } from './context'
import type { PointData } from '../types/point'

export interface PlayerAggregate {
  playerId: string
  name: string
  pointsPlayed: number
  survivalPct: number
  otbPct: number
  totalKills: number
  killsPerPoint: number
  breakoutKills: number
  g1PerPoint: number
  penalties: number
  trades: number
  avgComms: number
}

export interface TeamAggregate {
  wins: number
  losses: number
  totalPoints: number
  winPct: number
  survivalPct: number
  otbPct: number
  killsPP: number
  g1PP: number
  penPM: number
  avgComm: number
}

export function computeTeamStats(points: PointData[]): TeamAggregate {
  const realPoints = points.filter((p) => !p.isDummyData || p.teamStats.result !== null)
  if (realPoints.length === 0) {
    return { wins: 0, losses: 0, totalPoints: 0, winPct: 0, survivalPct: 0, otbPct: 0, killsPP: 0, g1PP: 0, penPM: 0, avgComm: 0 }
  }

  const wins = realPoints.filter((p) => p.teamStats.result === 'win').length
  const losses = realPoints.filter((p) => p.teamStats.result === 'loss').length
  const tp = realPoints.length

  let totalSlots = 0
  let survived = 0
  let otbSurvived = 0
  let kills = 0
  let g1 = 0
  let pens = 0
  let comms = 0

  for (const point of realPoints) {
    for (const ps of point.playerStats) {
      totalSlots++
      if (ps.survived) survived++
      if (ps.otbSurvived) otbSurvived++
      kills += ps.totalKills
      g1 += ps.breakoutKills
      pens += ps.penalties
      comms += ps.commsRating
    }
  }

  return {
    wins,
    losses,
    totalPoints: tp,
    winPct: tp > 0 ? Math.round((wins / tp) * 100) : 0,
    survivalPct: totalSlots > 0 ? Math.round((survived / totalSlots) * 100) : 0,
    otbPct: totalSlots > 0 ? Math.round((otbSurvived / totalSlots) * 100) : 0,
    killsPP: totalSlots > 0 ? Math.round((kills / totalSlots) * 100) / 100 : 0,
    g1PP: totalSlots > 0 ? Math.round((g1 / totalSlots) * 100) / 100 : 0,
    penPM: tp > 0 ? Math.round((pens / tp) * 100) / 100 : 0,
    avgComm: totalSlots > 0 ? Math.round((comms / totalSlots) * 10) / 10 : 0,
  }
}

export function computePlayerStats(points: PointData[], roster: AppState['roster']): PlayerAggregate[] {
  return roster.map((player) => {
    let pts = 0
    let sur = 0
    let otb = 0
    let kills = 0
    let g1 = 0
    let pens = 0
    let trades = 0
    let comms = 0

    for (const point of points) {
      const ps = point.playerStats.find((s) => s.playerId === player.id)
      if (!ps) continue
      pts++
      if (ps.survived) sur++
      if (ps.otbSurvived) otb++
      kills += ps.totalKills
      g1 += ps.breakoutKills
      pens += ps.penalties
      trades += ps.trades
      comms += ps.commsRating
    }

    return {
      playerId: player.id,
      name: player.name,
      pointsPlayed: pts,
      survivalPct: pts > 0 ? Math.round((sur / pts) * 100) : 0,
      otbPct: pts > 0 ? Math.round((otb / pts) * 100) : 0,
      totalKills: kills,
      killsPerPoint: pts > 0 ? Math.round((kills / pts) * 100) / 100 : 0,
      breakoutKills: g1,
      g1PerPoint: pts > 0 ? Math.round((g1 / pts) * 100) / 100 : 0,
      penalties: pens,
      trades,
      avgComms: pts > 0 ? Math.round((comms / pts) * 10) / 10 : 0,
    }
  })
}

export function useTeamStats(state: AppState) {
  return useMemo(() => computeTeamStats(state.points), [state.points])
}

export function usePlayerStats(state: AppState) {
  return useMemo(() => computePlayerStats(state.points, state.roster), [state.points, state.roster])
}
