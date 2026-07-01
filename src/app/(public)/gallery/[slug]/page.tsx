import { notFound } from 'next/navigation'

import { getGalleryImageBySlugService } from '@/features/gallery/service/gallery.service'
import { TsabolaGalleryDetailPage } from '@/features/tsabola/components/tsabola-gallery-detail-page'

import type { Metadata } from 'next'

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

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getGalleryImageBySlugService(slug)
  if ('error' in result.data) notFound()

  return <TsabolaGalleryDetailPage image={result.data} />
}
