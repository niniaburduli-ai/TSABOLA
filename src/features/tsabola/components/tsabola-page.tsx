'use client'

import { useEffect } from 'react'

import { TsabolaAbout } from './tsabola-about'
import { TsabolaContact } from './tsabola-contact'
import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGallery } from './tsabola-gallery'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaHero } from './tsabola-hero'
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
  }, [theme])

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main>
        {visibility.hero && <TsabolaHero />}
        {visibility.wines && <TsabolaWineCatalog />}
        {visibility.gallery && <TsabolaGallery />}
        {visibility.about && <TsabolaAbout />}
        {visibility.contact && <TsabolaContact />}
      </main>
      <TsabolaFooter />
    </div>
  )
}
