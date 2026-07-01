'use client'

import Link from 'next/link'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'

import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGalleryArticle } from './tsabola-gallery-article'
import { TsabolaHeader } from './tsabola-header'
import { useLang } from '../hooks/use-lang'

type Props = {
  image: GalleryImage
}

export function TsabolaGalleryDetailPage({ image }: Props) {
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
        <TsabolaGalleryArticle image={image} />
      </main>
      <TsabolaFooter />
    </div>
  )
}
