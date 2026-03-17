import type { PointData } from '../../types/point'
import { PointPill } from '../ui/PointPill'

interface Props {
  points: PointData[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function PointSelector({ points, activeIndex, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {points.map((point, i) => (
        <PointPill
          key={point.id}
          number={point.pointNumber}
          result={point.teamStats.result}
          active={i === activeIndex}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  )
}
