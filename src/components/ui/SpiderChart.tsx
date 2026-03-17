import { polygonPoints, axisEndpoint, labelPosition } from '../../lib/spider'

interface Dataset {
  values: number[] // 0-1 normalized
  fill: string
  stroke: string
  label: string
}

// Legacy multi-dataset interface
interface MultiDatasetProps {
  axes: string[]
  datasets: Dataset[]
  size?: number
  labels?: never
  values?: never
  color?: never
  compareValues?: never
  compareColor?: never
}

// Simple single/comparison interface
interface SimpleProps {
  labels: string[]
  values: number[] // 0-100
  color?: string
  compareValues?: number[] // 0-100
  compareColor?: string
  size?: number
  axes?: never
  datasets?: never
}

type Props = MultiDatasetProps | SimpleProps

export function SpiderChart(props: Props) {
  const size = props.size || 240
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 30

  // Normalize to simple interface
  let axes: string[]
  let datasets: Dataset[]

  if ('axes' in props && props.axes) {
    axes = props.axes
    datasets = props.datasets
  } else {
    const simpleProps = props as SimpleProps
    axes = simpleProps.labels
    const color = simpleProps.color || '#00ff88'
    datasets = [{
      values: simpleProps.values.map(v => v / 100),
      fill: `${color}15`,
      stroke: color,
      label: 'You',
    }]
    if (simpleProps.compareValues) {
      const cc = simpleProps.compareColor || '#3b82f6'
      datasets.push({
        values: simpleProps.compareValues.map(v => v / 100),
        fill: `${cc}10`,
        stroke: cc,
        label: 'Compare',
      })
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={polygonPoints(Array(axes.length).fill(scale), cx, cy, r)}
            fill="none"
            stroke="#1e293b"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const end = axisEndpoint(i, axes.length, cx, cy, r)
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          )
        })}

        {/* Data polygons — comparison first (behind) */}
        {[...datasets].reverse().map((ds, di) => (
          <polygon
            key={di}
            points={polygonPoints(ds.values, cx, cy, r)}
            fill={ds.fill}
            stroke={ds.stroke}
            strokeWidth={2}
          />
        ))}

        {/* Data points */}
        {datasets.map((ds, di) =>
          ds.values.map((v, i) => {
            const end = axisEndpoint(i, axes.length, cx, cy, r * v)
            return (
              <circle
                key={`${di}-${i}`}
                cx={end.x}
                cy={end.y}
                r={3}
                fill={ds.stroke}
              />
            )
          })
        )}

        {/* Labels */}
        {axes.map((label, i) => {
          const pos = labelPosition(i, axes.length, cx, cy, r)
          return (
            <text
              key={i}
              x={pos.x}
              y={pos.y}
              textAnchor={pos.anchor}
              dominantBaseline="middle"
              fill="#94a3b8"
              fontSize={10}
              fontWeight="bold"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
