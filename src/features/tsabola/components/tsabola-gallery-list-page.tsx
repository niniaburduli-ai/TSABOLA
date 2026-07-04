'use client'

import Link from 'next/link'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGalleryGrid } from './tsabola-gallery-grid'
import { TsabolaHeader } from './tsabola-header'
import { useLang } from '../hooks/use-lang'

const BACK_TO_MAIN_LABEL = { ka: 'მთავარზე დაბრუნება', en: 'Back to Main' }

type Props = {
  images: GalleryImage[]
}

export function TsabolaGalleryListPage({ images }: Props) {
  const { t, r } = useLang()

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <Link href="/" className="inline-flex items-center text-sm text-wine hover:underline mb-10">
          ← {r(BACK_TO_MAIN_LABEL)}
        </Link>
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.gallery.subtitle)}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.gallery.title)}</h1>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>
        <TsabolaGalleryGrid images={images} />
      </main>
      <TsabolaFooter />
    </div>
  )
}
