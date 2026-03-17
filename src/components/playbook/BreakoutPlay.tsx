import { useState } from 'react'
import { POSITION_LABELS, type Position } from '../../types/player'
import type { BreakoutPlay as PlayType } from '../../types/playbook'

interface Props {
  play: PlayType
}

export function BreakoutPlay({ play }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-sm text-white font-medium">{play.name}</span>
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.08] pt-3 space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed">{play.description}</p>
          <div className="space-y-1">
            {(Object.entries(play.positions) as [Position, string][]).map(([pos, bunker]) => (
              <div key={pos} className="flex items-center gap-2 text-xs">
                <span className="text-[#D4A843] font-bold w-16">{POSITION_LABELS[pos]}</span>
                <span className="text-white font-mono">{bunker}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
