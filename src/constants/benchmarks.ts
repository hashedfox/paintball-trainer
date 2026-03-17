// Benchmark thresholds for color-coding performance bars
// green = above target, amber = approaching, red = below

export const BENCHMARKS = {
  survivalPct: { green: 60, amber: 40 },
  otbPct: { green: 80, amber: 60 },
  killsPP: { green: 0.8, amber: 0.5 },
  g1PP: { green: 0.3, amber: 0.15 },
  penPM: { green: 0.5, amber: 1.0 }, // inverted: lower is better
  avgComm: { green: 3.5, amber: 2.5 },
  winPct: { green: 55, amber: 40 },
} as const

export function getBenchmarkColor(key: keyof typeof BENCHMARKS, value: number): string {
  const b = BENCHMARKS[key]
  if (key === 'penPM') {
    // Lower is better for penalties
    if (value <= b.green) return '#22c55e'
    if (value <= b.amber) return '#f59e0b'
    return '#ef4444'
  }
  if (value >= b.green) return '#22c55e'
  if (value >= b.amber) return '#f59e0b'
  return '#ef4444'
}
