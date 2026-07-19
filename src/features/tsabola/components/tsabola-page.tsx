'use client'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaAbout } from './tsabola-about'
import { TsabolaContact } from './tsabola-contact'
import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGallery } from './tsabola-gallery'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaHero } from './tsabola-hero'
import { TsabolaNews } from './tsabola-news'
import { TsabolaWineCatalog } from './tsabola-wine-catalog'
import { useLang } from '../hooks/use-lang'

type Props = {
  initialGalleryImages: GalleryImage[]
}

export function TsabolaPage({ initialGalleryImages }: Props) {
  const { theme, visibility } = useLang()

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
