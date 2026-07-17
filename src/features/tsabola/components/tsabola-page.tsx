'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'
import { LANG_COOKIE_NAME } from '@/shared/const/cookie.const'

import { TsabolaAbout } from './tsabola-about'
import { TsabolaContact } from './tsabola-contact'
import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGallery } from './tsabola-gallery'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaHero } from './tsabola-hero'
import { TsabolaNews } from './tsabola-news'
import { TsabolaWineCatalog } from './tsabola-wine-catalog'
import { useLang } from '../hooks/use-lang'
import { ContentContext } from '../store/content-context'
import { LanguageContext } from '../store/language-context'

import type { SectionVisibility, SiteContent, ThemeConfig } from '../types'

type Props = {
  initialGalleryImages: GalleryImage[]
  initialContent: SiteContent
  initialTheme: ThemeConfig
  initialVisibility: SectionVisibility
  initialLang: 'ka' | 'en'
}

export function TsabolaPage({
  initialGalleryImages,
  initialContent,
  initialTheme,
  initialVisibility,
  initialLang,
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
        <TsabolaPageBody initialGalleryImages={initialGalleryImages} />
      </LanguageContext.Provider>
    </ContentContext.Provider>
  )
}

function TsabolaPageBody({ initialGalleryImages }: { initialGalleryImages: GalleryImage[] }) {
  const { lang, theme, visibility } = useLang()

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Apply theme CSS vars — must match the real Tailwind theme tokens (--color-wine etc.)
  // for the JS-set inline override to actually beat the compiled default.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-wine', theme.colorWine)
    root.style.setProperty('--color-charcoal', theme.colorCharcoal)
    root.style.setProperty('--color-cream', theme.colorCream)
    root.style.setProperty('--font-heading', `var(${theme.headingFont ?? '--font-space-grotesk'})`)
    root.style.setProperty('--font-body', `var(${theme.bodyFont ?? '--font-sans'})`)
  }, [theme])

  return (
    <div className={`flex flex-col min-h-screen heading-${theme.headingSize ?? 'lg'} body-${theme.bodySize ?? 'md'}`}>
      <TsabolaHeader />
      <main>
        {visibility.hero && <TsabolaHero />}
        {visibility.about && <TsabolaAbout />}
        {visibility.wines && <TsabolaWineCatalog />}
        {visibility.news && <TsabolaNews />}
        {visibility.gallery && <TsabolaGallery initialImages={initialGalleryImages} />}
        {visibility.contact && <TsabolaContact />}
      </main>
      <TsabolaFooter />
    </div>
  )
}
