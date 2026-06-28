import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageStore {
  lang: 'ka' | 'en'
  setLang: (lang: 'ka' | 'en') => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'ka',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'tsabola-lang' }
  )
)
