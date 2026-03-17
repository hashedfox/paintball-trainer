import { useState } from 'react'
import { useDispatch } from '../../store/context'
import { InfoBubble } from '../ui/InfoBubble'
import { PLAYER_KPIS } from '../../constants/kpi-knowledge'
import { POSITION_LABELS } from '../../types/player'
import type { Player, PlayerPointStats } from '../../types/player'

interface Props {
  player: Player
  stats: PlayerPointStats
  pointId: string
  defaultExpanded?: boolean
}

export function PlayerCard({ player, stats, pointId, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const dispatch = useDispatch()

  const update = (field: string, value: unknown) => {
    dispatch({
      type: 'UPDATE_PLAYER_STAT',
      pointId,
      playerId: player.id,
      field: field as any,
      value: value as any,
    })
  }

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border overflow-hidden">
      {/* Header — tap to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-pb-amber font-bold text-sm">{POSITION_LABELS[player.position]}</span>
          <span className="text-white font-medium">{player.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {stats.survived && <span className="text-green-400">SUR</span>}
          {stats.totalKills > 0 && <span className="text-red-400">{stats.totalKills}K</span>}
          <span className="text-slate-500">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Expanded stats */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-pb-border pt-3">
          {/* Boolean toggles */}
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              label="SUR"
              kpi={PLAYER_KPIS.sur}
              value={stats.survived}
              onChange={(v) => update('survived', v)}
            />
            <Toggle
              label="OTBS"
              kpi={PLAYER_KPIS.otbs}
              value={stats.otbSurvived}
              onChange={(v) => update('otbSurvived', v)}
            />
          </div>

          {/* Number fields */}
          <div className="grid grid-cols-3 gap-2">
            <NumInput label="G1" kpi={PLAYER_KPIS.g1} value={stats.breakoutKills} onChange={(v) => update('breakoutKills', v)} />
            <NumInput label="KILL" kpi={PLAYER_KPIS.kill} value={stats.totalKills} onChange={(v) => update('totalKills', v)} />
            <NumInput label="PEN" kpi={PLAYER_KPIS.pen} value={stats.penalties} onChange={(v) => update('penalties', v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="TRD" kpi={PLAYER_KPIS.trd} value={stats.trades} onChange={(v) => update('trades', v)} />
            <div>
              <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                COM <InfoBubble kpi={PLAYER_KPIS.com} />
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update('commsRating', n)}
                    className={`flex-1 py-1 rounded text-xs font-bold ${
                      n <= stats.commsRating ? 'bg-pb-amber text-black' : 'bg-slate-700 text-slate-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text fields */}
          <div className="grid grid-cols-2 gap-2">
            <TextInput label="BD" kpi={PLAYER_KPIS.bd} value={stats.bunkerDiedAt} onChange={(v) => update('bunkerDiedAt', v)} placeholder="e.g. D2" />
            <TextInput label="BK" kpi={PLAYER_KPIS.bk} value={stats.bunkerKillsMadeAt} onChange={(v) => update('bunkerKillsMadeAt', v)} placeholder="e.g. S2" />
          </div>
        </div>
      )}
    </div>
  )
}

function Toggle({ label, kpi, value, onChange }: { label: string; kpi: any; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
      <span className="text-xs text-slate-400 flex items-center gap-1">
        {label} <InfoBubble kpi={kpi} />
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors relative ${value ? 'bg-green-500' : 'bg-slate-600'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${value ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  )
}

function NumInput({ label, kpi, value, onChange }: { label: string; kpi: any; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
        {label} <InfoBubble kpi={kpi} />
      </label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full bg-slate-700 rounded-lg px-2 py-1.5 text-sm text-white border border-pb-border focus:border-pb-amber outline-none"
      />
    </div>
  )
}

function TextInput({ label, kpi, value, onChange, placeholder }: { label: string; kpi: any; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
        {label} <InfoBubble kpi={kpi} />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700 rounded-lg px-2 py-1.5 text-sm text-white border border-pb-border focus:border-pb-amber outline-none"
      />
    </div>
  )
}
