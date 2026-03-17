interface Props {
  label: string
  value: number
  max: number
  color: string
  suffix?: string
}

export function ProgressBar({ label, value, max, color, suffix = '' }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  const displayValue = Number.isInteger(value) ? value : value.toFixed(1)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono" style={{ color }}>
          {displayValue}{suffix}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
