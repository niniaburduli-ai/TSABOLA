'use client'

import Link from 'next/link'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGalleryArticle } from './tsabola-gallery-article'
import { TsabolaHeader } from './tsabola-header'
import { useLang } from '../hooks/use-lang'

import type { GalleryNavTarget } from './tsabola-gallery-article'

type Props = {
  image: GalleryImage
  prev: GalleryNavTarget | null
  next: GalleryNavTarget | null
}

export function TsabolaGalleryDetailPage({ image, prev, next }: Props) {
  const { t, r } = useLang()

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-6 pt-10">
          <Link href="/gallery" className="text-sm text-wine hover:underline">
            ← {r(t.nav.gallery)}
          </Link>
        </div>
        <TsabolaGalleryArticle image={image} prev={prev} next={next} />
      </main>
      <TsabolaFooter />
    </div>
  )
}
