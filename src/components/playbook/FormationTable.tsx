import { useTranslation } from '../../i18n/useTranslation'
import { POSITION_LABELS, type Position } from '../../types/player'
import type { Formation } from '../../types/playbook'

interface Props {
  formations: Formation[]
}

export function FormationTable({ formations }: Props) {
  const t = useTranslation()

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('playbook.formations')}</h3>
      {formations.map((f, fi) => (
        <div key={fi}>
          {formations.length > 1 && (
            <h4 className="text-xs text-pb-amber font-bold mb-2">{f.name}</h4>
          )}
          <div className="space-y-1.5">
            {(Object.entries(f.positions) as [Position, { bunker: string; role: string }][]).map(([pos, info]) => (
              <div key={pos} className="flex items-center gap-2 text-xs">
                <span className="text-pb-amber font-bold w-16 shrink-0">{POSITION_LABELS[pos]}</span>
                <span className="text-white font-mono w-12 shrink-0">{info.bunker}</span>
                <span className="text-slate-400 flex-1">{info.role}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
