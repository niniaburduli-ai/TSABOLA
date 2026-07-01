'use client'

import { useEffect } from 'react'

import { TsabolaAbout } from './tsabola-about'
import { TsabolaContact } from './tsabola-contact'
import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGallery } from './tsabola-gallery'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaHero } from './tsabola-hero'
import { TsabolaNews } from './tsabola-news'
import { TsabolaWineCatalog } from './tsabola-wine-catalog'
import { useLang } from '../hooks/use-lang'

export function TsabolaPage() {
  const { lang, theme, visibility } = useLang()

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Apply theme CSS vars
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--wine', theme.colorWine)
    root.style.setProperty('--charcoal', theme.colorCharcoal)
    root.style.setProperty('--cream', theme.colorCream)
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
        {visibility.gallery && <TsabolaGallery />}
        {visibility.contact && <TsabolaContact />}
      </main>
      <TsabolaFooter />
    </div>
  )
}
