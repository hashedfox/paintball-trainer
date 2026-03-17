import { polygonPoints, axisEndpoint, labelPosition } from '../../lib/spider'

interface Dataset {
  values: number[] // 0-1 normalized
  fill: string
  stroke: string
  label: string
  dashed?: boolean
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

// Simple single/comparison interface (PPI style)
interface SimpleProps {
  labels: string[]
  values: number[] // 0-100
  color?: string
  compareValues?: number[] // 0-100
  compareColor?: string
  size?: number
  iconLabels?: boolean
  axes?: never
  datasets?: never
}

type Props = MultiDatasetProps | SimpleProps

// SVG icon paths for PPI-style labels
const PPI_ICONS: Record<string, string> = {
  // Snap Shooting — crosshair
  'Snap Shooting': 'M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-5.07l-2.83 2.83M9.76 14.24l-2.83 2.83m0-10.14l2.83 2.83m4.48 4.48l2.83 2.83M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
  // Movement — running figure
  'Movement': 'M13 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm2 2l3 3m-3-3l-3 1-2 3-3 1m3-1l-1 4-2 2m-1-5l-2-1-3 3',
  // Field IQ — brain
  'Field IQ': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  // Communication — speech bubble
  'Communication': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  // Gun Skills — target
  'Gun Skills': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  // Fitness — heart-rate
  'Fitness': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  // Mental Game — meditation/mind icon
  'Mental Game': 'M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6L12 22l-3.7-7A7 7 0 0112 2zm0 3a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  // Legacy
  Survival: 'M12 21C6.5 21 2 16.5 2 11V3l4 2 4-2 4 2 4-2v8c0 5.5-4.5 10-10 10z',
  OTB: 'M13 10V3L4 14h7v7l9-11h-7z',
  'Kills/Pt': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  Discipline: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  Comms: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  'Win Rate': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
}

export function SpiderChart(props: Props) {
  const size = props.size || 300
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 50

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
    const color = simpleProps.color || '#7C5BF0'
    datasets = [{
      values: simpleProps.values.map(v => v / 100),
      fill: `${color}25`,
      stroke: color,
      label: 'Current',
    }]
    if (simpleProps.compareValues) {
      const cc = simpleProps.compareColor || '#7C5BF080'
      datasets.push({
        values: simpleProps.compareValues.map(v => v / 100),
        fill: 'none',
        stroke: cc,
        label: '30 days ago',
        dashed: true,
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
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth={scale === 1 ? 1 : 0.5}
            opacity={scale === 1 ? 0.6 : 0.3}
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
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth={0.5}
              opacity={0.4}
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
            strokeDasharray={ds.dashed ? '6 3' : 'none'}
            className={di === datasets.length - 1 ? 'animate-draw-polygon' : ''}
          />
        ))}

        {/* Data points */}
        {datasets.filter(ds => !ds.dashed).map((ds, di) =>
          ds.values.map((v, i) => {
            const end = axisEndpoint(i, axes.length, cx, cy, r * v)
            return (
              <circle
                key={`${di}-${i}`}
                cx={end.x} cy={end.y}
                r={3.5}
                fill={ds.stroke}
                stroke="#0A0E1A"
                strokeWidth={1.5}
              />
            )
          })
        )}

        {/* Labels with icons */}
        {axes.map((label, i) => {
          const pos = labelPosition(i, axes.length, cx, cy, r + 6)
          const iconPath = PPI_ICONS[label]

          if (showIcons && iconPath) {
            const iconSize = 14
            const iconX = pos.anchor === 'start' ? pos.x : pos.anchor === 'end' ? pos.x - iconSize : pos.x - iconSize / 2
            const iconY = pos.y - iconSize - 6

            return (
              <g key={i} className="cursor-pointer">
                {/* Icon circle background */}
                <circle
                  cx={iconX + iconSize / 2}
                  cy={iconY + iconSize / 2}
                  r={13}
                  fill="#1A1F35"
                  stroke="rgba(148, 163, 184, 0.08)"
                  strokeWidth={1}
                />
                {/* Icon */}
                <svg
                  x={iconX} y={iconY}
                  width={iconSize} height={iconSize}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={iconPath} />
                </svg>
                {/* Label text */}
                <text
                  x={iconX + iconSize / 2}
                  y={iconY + iconSize + 16}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize={9}
                  fontWeight="700"
                  letterSpacing="0.04em"
                  fontFamily="'Inter', sans-serif"
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
              fill="#94A3B8"
              fontSize={10}
              fontWeight="700"
              letterSpacing="0.04em"
              fontFamily="'Inter', sans-serif"
            >
              {label.toUpperCase()}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
