'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

import { TopLikedChart } from './_top-liked-chart'

type DashboardStats = {
  wines: number
  news: { total: number; published: number }
  gallery: { total: number; published: number }
  users: { total: number; admins: number }
  contentUpdatedAt: string | null
  topLikedWines: { wineId: string; name: string; count: number }[]
}

type SessionUser = { name?: string | null }

export function DashboardEditor() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then((res) => {
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then(setStats)
      .catch(() => setError(true))
  }, [])

  const sessionUser = session?.user as SessionUser | undefined
  const userName = sessionUser?.name ?? 'ადმინი'

  const updatedLabel = stats?.contentUpdatedAt
    ? new Date(stats.contentUpdatedAt).toLocaleString('ka-GE', { dateStyle: 'medium', timeStyle: 'short' })
    : 'ჯერ არ შენახულა'

  const tiles = stats
    ? [
      { label: 'ღვინოები', value: String(stats.wines) },
      { label: 'სიახლეები', value: `${stats.news.published} / ${stats.news.total}`, hint: 'გამოქვეყნებული / სულ' },
      { label: 'გალერეის ფოტოები', value: `${stats.gallery.published} / ${stats.gallery.total}`, hint: 'გამოქვეყნებული / სულ' },
      { label: 'მომხმარებლები', value: String(stats.users.total), hint: `${stats.users.admins} ადმინი` },
    ]
    : []

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-charcoal">მოგესალმებით, {userName}</h2>
        <p className="text-sm text-charcoal/60 mt-1">საიტის მიმდინარე მდგომარეობა</p>
      </div>

      {error && (
        <p className="text-sm text-red-500">სტატისტიკის ჩატვირთვა ვერ მოხერხდა</p>
      )}

      {!stats && !error && (
        <p className="text-sm text-charcoal/50">იტვირთება...</p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {tiles.map((tile) => (
              <div key={tile.label} className="border border-border-wine rounded p-3 bg-cream/40 sm:p-4">
                <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide">{tile.label}</p>
                <p className="text-xl font-bold text-wine mt-1 whitespace-nowrap sm:text-2xl">{tile.value}</p>
                {tile.hint && <p className="text-xs text-charcoal/40 mt-1">{tile.hint}</p>}
              </div>
            ))}
          </div>

          <TopLikedChart wines={stats.topLikedWines} />

          <p className="text-xs text-charcoal/40 pt-4 border-t border-border-wine">
            ბოლო შენახვა: {updatedLabel}
          </p>
        </>
      )}
    </div>
  )
}
