interface Props {
  number: number
  result: 'win' | 'loss' | null
  active: boolean
  onClick: () => void
}

export function PointPill({ number, result, active, onClick }: Props) {
  const bg = result === 'win'
    ? 'bg-green-600'
    : result === 'loss'
    ? 'bg-red-600'
    : 'bg-slate-600'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${bg} ${
        active ? 'ring-2 ring-[#D4A843] scale-110' : 'opacity-70 hover:opacity-100'
      }`}
    >
      PT {number}
    </button>
  )
}
