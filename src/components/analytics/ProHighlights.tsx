import { useTranslation } from '../../i18n/useTranslation'
import { PRO_HIGHLIGHTS } from '../../constants/pro-highlights'

export function ProHighlights() {
  const t = useTranslation()

  return (
    <div className="bg-pb-card rounded-xl border border-pb-border p-4">
      <h3 className="text-sm font-bold text-white mb-3">{t('analytics.highlights')}</h3>
      <div className="space-y-2">
        {PRO_HIGHLIGHTS.map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{ backgroundColor: h.tagColor + '30', color: h.tagColor }}
              >
                {h.tag}
              </span>
            </div>
            <p className="text-sm text-white font-medium">{h.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{h.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
