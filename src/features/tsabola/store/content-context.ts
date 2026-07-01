import { createContext } from 'react'

import type { SectionVisibility, SiteContent, ThemeConfig } from '../types'

export type ContentContextValue = {
  content: SiteContent
  theme: ThemeConfig
  visibility: SectionVisibility
}

export const ContentContext = createContext<ContentContextValue | null>(null)
