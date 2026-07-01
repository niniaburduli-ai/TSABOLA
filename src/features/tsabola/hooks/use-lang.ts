import { useContext } from 'react'

import { ContentContext } from '../store/content-context'
import { useContentStore } from '../store/content-store'
import { LanguageContext } from '../store/language-context'
import { useLanguageStore } from '../store/language-store'

import type { L } from '../types'

export function r(field: L | string, lang: 'ka' | 'en'): string {
  return typeof field === 'string' ? field : field[lang]
}

export function useLang() {
  const languageContextValue = useContext(LanguageContext)
  const languageStoreValue = useLanguageStore()
  const { lang, setLang } = languageContextValue ?? languageStoreValue
  const contextValue = useContext(ContentContext)
  const storeValue = useContentStore()
  const { content, theme, visibility } = contextValue ?? storeValue
  return {
    t: content,
    theme,
    visibility,
    lang,
    setLang,
    r: (field: L | string) => r(field, lang),
  }
}
