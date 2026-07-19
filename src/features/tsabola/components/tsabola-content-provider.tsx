'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { LANG_COOKIE_NAME } from '@/shared/const/cookie.const'

import { useLang } from '../hooks/use-lang'
import { ContentContext } from '../store/content-context'
import { LanguageContext } from '../store/language-context'

import type { SectionVisibility, SiteContent, ThemeConfig } from '../types'
import type { ReactNode } from 'react'

type Props = {
  initialContent: SiteContent
  initialTheme: ThemeConfig
  initialVisibility: SectionVisibility
  initialLang: 'ka' | 'en'
  children: ReactNode
}

export function TsabolaContentProvider({
  initialContent,
  initialTheme,
  initialVisibility,
  initialLang,
  children,
}: Props) {
  const contentContextValue = useMemo(
    () => ({ content: initialContent, theme: initialTheme, visibility: initialVisibility }),
    [initialContent, initialTheme, initialVisibility]
  )

  const [lang, setLangState] = useState<'ka' | 'en'>(initialLang)
  const setLang = useCallback((next: 'ka' | 'en') => {
    setLangState(next)
    document.cookie = `${LANG_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`
  }, [])
  const languageContextValue = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return (
    <ContentContext.Provider value={contentContextValue}>
      <LanguageContext.Provider value={languageContextValue}>
        <TsabolaThemeSync>{children}</TsabolaThemeSync>
      </LanguageContext.Provider>
    </ContentContext.Provider>
  )
}

function TsabolaThemeSync({ children }: { children: ReactNode }) {
  const { lang, theme } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Must match the real Tailwind theme tokens (--color-wine etc.) for the
  // JS-set inline override to actually beat the compiled default.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-wine', theme.colorWine)
    root.style.setProperty('--color-charcoal', theme.colorCharcoal)
    root.style.setProperty('--color-cream', theme.colorCream)
    root.style.setProperty('--font-heading', `var(${theme.headingFont ?? '--font-space-grotesk'})`)
    root.style.setProperty('--font-body', `var(${theme.bodyFont ?? '--font-sans'})`)
  }, [theme])

  return <>{children}</>
}
