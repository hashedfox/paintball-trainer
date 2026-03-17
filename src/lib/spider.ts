// Generate SVG polygon points for a radar/spider chart
// Values should be normalized 0-1

export function polygonPoints(values: number[], cx: number, cy: number, r: number): string {
  const n = values.length
  return values
    .map((v, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const x = cx + r * v * Math.cos(angle)
      const y = cy + r * v * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')
}

export function axisEndpoint(index: number, total: number, cx: number, cy: number, r: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

export function labelPosition(index: number, total: number, cx: number, cy: number, r: number): {
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
} {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const x = cx + (r + 14) * Math.cos(angle)
  const y = cy + (r + 14) * Math.sin(angle)

  let anchor: 'start' | 'middle' | 'end' = 'middle'
  if (Math.cos(angle) > 0.1) anchor = 'start'
  else if (Math.cos(angle) < -0.1) anchor = 'end'

  return { x, y, anchor }
}
