'use client'

type Wine = { wineId: string; name: string; count: number }

type Props = {
  wines: Wine[]
}

export function TopLikedChart({ wines }: Props) {
  if (wines.length === 0) return null
  const maxCount = Math.max(1, ...wines.map((w) => w.count))

  return (
    <div>
      <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-3">
        ყველაზე მოწონებული პროდუქტები
      </p>
      <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-1">
        {wines.map((wine) => (
          <div key={wine.wineId} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-charcoal/70">{wine.name}</span>
            <div className="flex-1 h-4 bg-cream/60 rounded overflow-hidden">
              <div
                className="h-full bg-wine rounded"
                style={{ width: `${(wine.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm font-bold text-wine">{wine.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
