import { createContext, useContext, type ReactNode } from 'react'
import { useAppState } from '../store/context'

type Lang = 'en' | 'pt' | 'es'
const LangCtx = createContext<Lang>('en')

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { language } = useAppState()
  return <LangCtx.Provider value={language}>{children}</LangCtx.Provider>
}

export function useLang(): Lang {
  return useContext(LangCtx)
}
