import { notFound } from 'next/navigation'

import { TsabolaNewsDetailPage } from '@/features/tsabola/components/tsabola-news-detail-page'
import { getNewsItemBySlugService } from '@/features/tsabola/service/news.service'

import type { Metadata } from 'next'

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

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const result = await getNewsItemBySlugService(slug)
  if ('error' in result.data) notFound()

  return <TsabolaNewsDetailPage item={result.data} />
}
