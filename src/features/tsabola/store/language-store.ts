import { create } from 'zustand'

interface LanguageStore {
  lang: 'ka' | 'en'
  setLang: (lang: 'ka' | 'en') => void
}

export const useLanguageStore = create<LanguageStore>()((set) => ({
  lang: 'ka',
  setLang: (lang) => set({ lang }),
}))
