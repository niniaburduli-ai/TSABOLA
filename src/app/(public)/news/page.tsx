import { TsabolaNewsListPage } from '@/features/tsabola/components/tsabola-news-list-page'
import { getPublishedNewsService } from '@/features/tsabola/service/news.service'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'News — TSABO',
  description: 'Latest news and updates from Tsabo winery.',
}

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const result = await getPublishedNewsService()
  const items = 'error' in result.data ? [] : result.data

  return <TsabolaNewsListPage items={items} />
}
