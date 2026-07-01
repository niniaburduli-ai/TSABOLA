import { createContext } from 'react'

export type LanguageContextValue = {
  lang: 'ka' | 'en'
  setLang: (lang: 'ka' | 'en') => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
