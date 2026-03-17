import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../../i18n/context'
import { useTranslation } from '../../i18n/useTranslation'
import type { KpiInfo } from '../../constants/kpi-knowledge'
import { getKpiField } from '../../constants/kpi-knowledge'

interface Props {
  kpi: KpiInfo
}

export function InfoBubble({ kpi }: Props) {
  const [open, setOpen] = useState(false)
  const lang = useLang()
  const t = useTranslation()

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-600 text-[10px] text-slate-300 hover:bg-[#D4A843] hover:text-black cursor-pointer ml-1 shrink-0"
      >
        ?
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 flex items-end justify-center"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            onClick={close}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" />
            {/* Modal */}
            <div
              className="relative w-full max-w-lg mx-4 mb-4 bg-[#1A1F35] rounded-2xl border border-white/[0.08] overflow-hidden animate-slide-up"
              style={{ zIndex: 10000, maxHeight: '80vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                <span className="text-lg">
                  {kpi.emoji} {getKpiField(kpi, 'name', lang)}
                </span>
                <button
                  type="button"
                  onClick={close}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-700 text-white text-lg hover:bg-red-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {/* Content */}
              <div className="px-4 py-3 space-y-3 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <Section title={t('info.what')} text={getKpiField(kpi, 'what', lang)} />
                <Section title={t('info.why')} text={getKpiField(kpi, 'why', lang)} />
                <Section title={t('info.good')} text={getKpiField(kpi, 'good', lang)} />
                <Section title={t('info.tip')} text={getKpiField(kpi, 'tip', lang)} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-[#D4A843] uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </div>
  )
}
