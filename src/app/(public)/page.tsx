import { cookies } from 'next/headers'

import { listPublishedGalleryImages } from '@/features/gallery/service/gallery.service'
import { TsabolaPage } from '@/features/tsabola/components/tsabola-page'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content'
import { getSiteContent } from '@/features/tsabola/service/site-content.service'
import type { SectionVisibility, SiteContent, ThemeConfig } from '@/features/tsabola/types'
import { LANG_COOKIE_NAME } from '@/shared/const/cookie.const'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [galleryResult, siteContentResult, cookieStore] = await Promise.all([
    listPublishedGalleryImages(),
    getSiteContent(),
    cookies(),
  ])

  const galleryImages = 'error' in galleryResult.data ? [] : galleryResult.data
  const siteContentData = siteContentResult.data

  const initialContent = ('error' in siteContentData ? DEFAULT_CONTENT : siteContentData.content) as SiteContent
  const initialTheme = ('error' in siteContentData ? DEFAULT_THEME : siteContentData.theme) as ThemeConfig
  const initialVisibility = ('error' in siteContentData ? DEFAULT_VISIBILITY : siteContentData.visibility) as SectionVisibility
  const initialLang = cookieStore.get(LANG_COOKIE_NAME)?.value === 'en' ? 'en' : 'ka'

  return (
    <TsabolaPage
      initialGalleryImages={galleryImages}
      initialContent={initialContent}
      initialTheme={initialTheme}
      initialVisibility={initialVisibility}
      initialLang={initialLang}
    />
  )
}
