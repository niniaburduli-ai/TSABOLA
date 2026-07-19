import { AdminPanel } from '@/features/tsabola/admin/admin-panel'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content'
import { getSiteContent } from '@/features/tsabola/service/site-content.service'
import type { SectionVisibility, SiteContent, ThemeConfig } from '@/features/tsabola/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const result = await getSiteContent()
  const siteContentData = result.data

  const initialContent = ('error' in siteContentData ? DEFAULT_CONTENT : siteContentData.content) as SiteContent
  const initialTheme = ('error' in siteContentData ? DEFAULT_THEME : siteContentData.theme) as ThemeConfig
  const initialVisibility = ('error' in siteContentData ? DEFAULT_VISIBILITY : siteContentData.visibility) as SectionVisibility

  return (
    <AdminPanel
      initialContent={initialContent}
      initialTheme={initialTheme}
      initialVisibility={initialVisibility}
    />
  )
}
