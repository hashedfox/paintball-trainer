import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import type { SwotData } from '../../types/playbook'

interface Props {
  swot: SwotData
}

const QUADRANTS = [
  { key: 'strengths' as const, labelKey: 'playbook.strengths', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  { key: 'weaknesses' as const, labelKey: 'playbook.weaknesses', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { key: 'opportunities' as const, labelKey: 'playbook.opportunities', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { key: 'threats' as const, labelKey: 'playbook.threats', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
]

export function SwotAnalysis({ swot }: Props) {
  const t = useTranslation()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('playbook.swot')}</h3>
      <div className="grid grid-cols-2 gap-2">
        {QUADRANTS.map((q) => (
          <button
            key={q.key}
            type="button"
            onClick={() => setExpanded(expanded === q.key ? null : q.key)}
            className="rounded-lg p-3 text-left transition-all"
            style={{ backgroundColor: q.bg, borderLeft: `3px solid ${q.color}` }}
          >
            <span className="text-xs font-bold" style={{ color: q.color }}>
              {t(q.labelKey)}
            </span>
            {expanded === q.key && (
              <ul className="mt-2 space-y-1">
                {swot[q.key].map((item, i) => (
                  <li key={i} className="text-[11px] text-slate-300 leading-tight">• {item}</li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
