import type { LetterGrade } from '../../types/analytics'
import { GRADE_COLORS } from '../../lib/gpi'

interface Props {
  value: number // 0-100
  grade: LetterGrade
  size?: number
}

export function CircularGauge({ value, grade, size = 140 }: Props) {
  const strokeWidth = 10
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const progress = (value / 100) * circumference
  const color = GRADE_COLORS[grade]

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#334155"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{value}</span>
        <span className="text-sm font-bold" style={{ color }}>{grade}</span>
      </div>
    </div>
  )
}
