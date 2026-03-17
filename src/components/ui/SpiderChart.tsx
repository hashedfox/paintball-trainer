import { polygonPoints, axisEndpoint, labelPosition } from '../../lib/spider'

interface Dataset {
  values: number[] // 0-1 normalized
  fill: string
  stroke: string
  label: string
}

interface Props {
  axes: string[]
  datasets: Dataset[]
  size?: number
}

export function SpiderChart({ axes, datasets, size = 240 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 30

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={polygonPoints(Array(axes.length).fill(scale), cx, cy, r)}
            fill="none"
            stroke="#334155"
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
              stroke="#334155"
              strokeWidth={0.5}
            />
          )
        })}

        {/* Data polygons */}
        {datasets.map((ds, di) => (
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

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {datasets.map((ds, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ds.stroke }} />
            {ds.label}
          </div>
        ))}
      </div>
    </div>
  )
}
