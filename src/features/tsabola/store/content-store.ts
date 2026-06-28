import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../content/site-content'

import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

interface ContentStore {
  content: SiteContent
  theme: ThemeConfig
  visibility: SectionVisibility
  setContent: (c: SiteContent) => void
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
  setTheme: (t: ThemeConfig) => void
  setVisibility: (v: SectionVisibility) => void
  resetToDefaults: () => void
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      content: DEFAULT_CONTENT,
      theme: DEFAULT_THEME,
      visibility: DEFAULT_VISIBILITY,
      setContent: (content) => set({ content }),
      updateSection: (key, value) =>
        set((state) => ({ content: { ...state.content, [key]: value } })),
      setTheme: (theme) => set({ theme }),
      setVisibility: (visibility) => set({ visibility }),
      resetToDefaults: () =>
        set({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY }),
    }),
    { name: 'tsabola-content' }
  )
)
