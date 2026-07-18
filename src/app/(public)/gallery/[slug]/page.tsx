import { notFound } from 'next/navigation'

import { getGalleryImageBySlugService, listPublishedGalleryImages } from '@/features/gallery/service/gallery.service'
import type { GalleryImage } from '@/features/gallery/types/gallery.types'
import type { GalleryNavTarget } from '@/features/tsabola/components/tsabola-gallery-article'
import { TsabolaGalleryDetailPage } from '@/features/tsabola/components/tsabola-gallery-detail-page'


import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getGalleryImageBySlugService(slug)
  if ('error' in result.data) return { title: 'Gallery — TSABO' }

  const image = result.data
  return {
    title: image.caption.ka ? `${image.caption.ka} — TSABO` : 'Gallery — TSABO',
    description: image.description.ka.slice(0, 160) || undefined,
    openGraph: { images: [image.url] },
  }
}

function neighborsAt<T>(list: T[], index: number): { prev: T | null; next: T | null } {
  if (list.length <= 1) return { prev: null, next: null }
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  }
}

function toNavTarget(image: GalleryImage | null): GalleryNavTarget | null {
  return image ? { slug: image.slug, caption: image.caption } : null
}

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getGalleryImageBySlugService(slug)
  if ('error' in result.data) notFound()

  const listResult = await listPublishedGalleryImages()
  const images = 'error' in listResult.data ? [] : listResult.data
  const index = images.findIndex((img) => img.slug === slug)
  const { prev, next } = neighborsAt(images, index)

  return <TsabolaGalleryDetailPage image={result.data} prev={toNavTarget(prev)} next={toNavTarget(next)} />
}
