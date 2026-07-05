import { listPublishedGalleryImages } from '@/features/gallery/service/gallery.service'
import { TsabolaGalleryListPage } from '@/features/tsabola/components/tsabola-gallery-list-page'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery — TSABO',
  description: 'Vineyard, cellar, and craft — photos from Tsabo winery.',
}

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const result = await listPublishedGalleryImages()
  const images = 'error' in result.data ? [] : result.data

  return <TsabolaGalleryListPage images={images} />
}
