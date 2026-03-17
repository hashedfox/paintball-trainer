import { useAppState, useDispatch } from '../../store/context'

const LANGS = [
  { code: 'en' as const, flag: '🇬🇧', label: 'English' },
  { code: 'pt' as const, flag: '🇧🇷', label: 'Português' },
  { code: 'es' as const, flag: '🇦🇷', label: 'Español' },
]

export function LanguageSelector() {
  const { language } = useAppState()
  const dispatch = useDispatch()

  return (
    <div className="flex gap-2">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => dispatch({ type: 'SET_LANGUAGE', lang: code })}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
            language === code
              ? 'bg-[#D4A843] text-black font-bold'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <span className="text-lg">{flag}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
