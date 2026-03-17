import { useTranslation } from '../../i18n/useTranslation'
import { useDispatch } from '../../store/context'
import { InfoBubble } from '../ui/InfoBubble'
import { TEAM_KPIS } from '../../constants/kpi-knowledge'
import type { PointData } from '../../types/point'

interface Props {
  point: PointData
}

export function TeamSummaryPanel({ point }: Props) {
  const t = useTranslation()
  const dispatch = useDispatch()
  const ts = point.teamStats
  const pid = point.id

  const update = (field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_TEAM_STAT', pointId: pid, field: field as any, value: value as any })
  }

  return (
    <div className="bg-[#1A1F35] rounded-xl border border-white/[0.08] p-4 space-y-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        {t('points.teamStats')}
        <InfoBubble kpi={TEAM_KPIS.result} />
      </h3>

      {/* Result */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update('result', ts.result === 'win' ? null : 'win')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
            ts.result === 'win' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {t('points.win')}
        </button>
        <button
          type="button"
          onClick={() => update('result', ts.result === 'loss' ? null : 'loss')}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
            ts.result === 'loss' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {t('points.loss')}
        </button>
      </div>

      {/* Side */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update('homeAway', 'home')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
            ts.homeAway === 'home' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {t('points.home')}
        </button>
        <button
          type="button"
          onClick={() => update('homeAway', 'away')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
            ts.homeAway === 'away' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
          }`}
        >
          {t('points.away')}
        </button>
      </div>

      {/* Numeric fields */}
      <div className="grid grid-cols-2 gap-3">
        <NumField label={t('stat.upDownBodies')} value={ts.upDownBodies} onChange={(v) => update('upDownBodies', v)} kpi={TEAM_KPIS.upDownBodies} />
        <NumField label={t('stat.otbCount')} value={ts.otbBodyCount} onChange={(v) => update('otbBodyCount', v)} kpi={TEAM_KPIS.otbCount} min={0} />
        <NumField label={t('stat.teamKills')} value={ts.totalKills} onChange={(v) => update('totalKills', v)} min={0} />
        <NumField label={t('stat.teamPenalties')} value={ts.penalties} onChange={(v) => update('penalties', v)} min={0} />
      </div>

      {/* Play used */}
      <div>
        <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
          {t('points.play')}
          <InfoBubble kpi={TEAM_KPIS.playUsed} />
        </label>
        <input
          type="text"
          value={ts.playUsed}
          onChange={(e) => update('playUsed', e.target.value)}
          placeholder="e.g. Stack Left"
          className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white border border-white/[0.08] focus:border-[#D4A843] outline-none"
        />
      </div>

      {/* Point time */}
      <NumField label={t('stat.pointTime')} value={ts.pointTimeToWin} onChange={(v) => update('pointTimeToWin', v)} min={0} suffix="s" />
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
  kpi,
  min,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  kpi?: any
  min?: number
  suffix?: string
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
        {label}
        {kpi && <InfoBubble kpi={kpi} />}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-slate-700 rounded-lg px-3 py-1.5 text-sm text-white border border-white/[0.08] focus:border-[#D4A843] outline-none"
        />
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  )
}
