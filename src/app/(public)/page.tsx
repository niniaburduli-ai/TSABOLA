import { listPublishedGalleryImages } from '@/features/gallery/service/gallery.service'
import { TsabolaPage } from '@/features/tsabola/components/tsabola-page'

export default async function HomePage() {
  const galleryResult = await listPublishedGalleryImages()
  const galleryImages = 'error' in galleryResult.data ? [] : galleryResult.data

  return <TsabolaPage initialGalleryImages={galleryImages} />
}
