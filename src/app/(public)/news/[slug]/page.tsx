import { notFound } from 'next/navigation'

import type { NewsNavTarget } from '@/features/tsabola/components/tsabola-news-article'
import { TsabolaNewsDetailPage } from '@/features/tsabola/components/tsabola-news-detail-page'
import { getNewsItemBySlugService, getPublishedNewsService } from '@/features/tsabola/service/news.service'
import type { NewsItem } from '@/features/tsabola/types'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await getNewsItemBySlugService(slug)
  if ('error' in result.data) return { title: 'News — TSABO' }

  const item = result.data
  return {
    title: `${item.title.ka} — TSABO`,
    description: item.body.ka.slice(0, 160),
    openGraph: item.image ? { images: [item.image] } : undefined,
  }
}

function neighborsAt<T>(list: T[], index: number): { prev: T | null; next: T | null } {
  if (list.length <= 1) return { prev: null, next: null }
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  }
}

function toNavTarget(item: NewsItem | null): NewsNavTarget | null {
  return item ? { slug: item.slug, title: item.title } : null
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getNewsItemBySlugService(slug)
  if ('error' in result.data) notFound()

  const listResult = await getPublishedNewsService()
  const items = 'error' in listResult.data ? [] : listResult.data
  const index = items.findIndex((n) => n.slug === slug)
  const { prev, next } = neighborsAt(items, index)

  return <TsabolaNewsDetailPage item={result.data} prev={toNavTarget(prev)} next={toNavTarget(next)} />
}
