import { useContentStore } from '../store/content-store'
import { useLanguageStore } from '../store/language-store'

import type { L } from '../types'

export function r(field: L, lang: 'ka' | 'en'): string {
  return field[lang]
}

export function useLang() {
  const { lang, setLang } = useLanguageStore()
  const { content, theme, visibility } = useContentStore()
  return {
    t: content,
    theme,
    visibility,
    lang,
    setLang,
    r: (field: L) => r(field, lang),
  }
}
