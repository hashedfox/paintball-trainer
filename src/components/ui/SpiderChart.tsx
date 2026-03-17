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
  iconLabels?: never
}

// Simple single/comparison interface (Mobalytics GPI style)
interface SimpleProps {
  labels: string[]
  values: number[] // 0-100
  color?: string
  compareValues?: number[] // 0-100
  compareColor?: string
  size?: number
  iconLabels?: boolean // show icon-style labels around chart
  axes?: never
  datasets?: never
}

type Props = MultiDatasetProps | SimpleProps

// SVG icon paths for GPI-style labels
const STAT_ICONS: Record<string, string> = {
  Survival:   'M12 21C6.5 21 2 16.5 2 11V3l4 2 4-2 4 2 4-2v8c0 5.5-4.5 10-10 10z',
  OTB:        'M13 10V3L4 14h7v7l9-11h-7z',
  'Kills/Pt': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  Discipline: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  Comms:      'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  'Win Rate': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  Fighting:   'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5',
  Versatility:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  Aggression: 'M13 10V3L4 14h7v7l9-11h-7z',
}

export function SpiderChart(props: Props) {
  const size = props.size || 280
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 44

  let axes: string[]
  let datasets: Dataset[]
  let showIcons = false

  if ('axes' in props && props.axes) {
    axes = props.axes
    datasets = props.datasets
  } else {
    const simpleProps = props as SimpleProps
    axes = simpleProps.labels
    showIcons = simpleProps.iconLabels ?? true
    const color = simpleProps.color || '#5b4dc7'
    datasets = [{
      values: simpleProps.values.map(v => v / 100),
      fill: `${color}20`,
      stroke: color,
      label: 'You',
    }]
    if (simpleProps.compareValues) {
      const cc = simpleProps.compareColor || '#e05d6f'
      datasets.push({
        values: simpleProps.compareValues.map(v => v / 100),
        fill: `${cc}12`,
        stroke: cc,
        label: 'Compare',
      })
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings with subtle fills */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <polygon
            key={scale}
            points={polygonPoints(Array(axes.length).fill(scale), cx, cy, r)}
            fill={i === 3 ? 'none' : 'none'}
            stroke="#2a2850"
            strokeWidth={scale === 1 ? 1 : 0.5}
            opacity={scale === 1 ? 0.8 : 0.4}
          />
        ))}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const end = axisEndpoint(i, axes.length, cx, cy, r)
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={end.x} y2={end.y}
              stroke="#2a2850"
              strokeWidth={0.5}
              opacity={0.5}
            />
          )
        })}

        {/* Data polygons — comparison behind */}
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
                cx={end.x} cy={end.y}
                r={3}
                fill={ds.stroke}
                stroke="#0f0e24"
                strokeWidth={1}
              />
            )
          })
        )}

        {/* Labels with optional icon */}
        {axes.map((label, i) => {
          const pos = labelPosition(i, axes.length, cx, cy, r + (showIcons ? 4 : 0))
          const iconPath = STAT_ICONS[label]

          if (showIcons && iconPath) {
            const iconSize = 14
            const iconX = pos.anchor === 'start' ? pos.x : pos.anchor === 'end' ? pos.x - iconSize : pos.x - iconSize / 2
            const iconY = pos.y - iconSize - 4
            return (
              <g key={i}>
                {/* Icon circle background */}
                <circle
                  cx={iconX + iconSize / 2}
                  cy={iconY + iconSize / 2}
                  r={12}
                  fill="#1d1b3a"
                  stroke="#2a2850"
                  strokeWidth={1}
                />
                {/* Icon */}
                <svg
                  x={iconX} y={iconY}
                  width={iconSize} height={iconSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9896b8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={iconPath} />
                </svg>
                {/* Label text */}
                <text
                  x={iconX + iconSize / 2}
                  y={iconY + iconSize + 14}
                  textAnchor="middle"
                  fill="#9896b8"
                  fontSize={9}
                  fontWeight="700"
                  letterSpacing="0.03em"
                >
                  {label.toUpperCase()}
                </text>
              </g>
            )
          }

          return (
            <text
              key={i}
              x={pos.x} y={pos.y}
              textAnchor={pos.anchor}
              dominantBaseline="middle"
              fill="#9896b8"
              fontSize={10}
              fontWeight="700"
              letterSpacing="0.03em"
            >
              {label.toUpperCase()}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
