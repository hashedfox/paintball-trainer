import { useLang } from './context'
import { en } from './en'
import { pt } from './pt'
import { es } from './es'

const dicts = { en, pt, es } as const

export function useTranslation() {
  const lang = useLang()
  return (key: string): string => {
    const dict = dicts[lang] as Record<string, string>
    return dict[key] ?? (dicts.en as Record<string, string>)[key] ?? key
  }
}
