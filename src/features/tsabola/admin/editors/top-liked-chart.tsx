'use client'

import { Grape } from 'lucide-react'

type Wine = { wineId: string; name: string; count: number }

type Props = {
  wines: Wine[]
}

const BAR_WIDTH_STEPS = [
  'w-0', 'w-1/12', 'w-2/12', 'w-3/12', 'w-4/12', 'w-5/12',
  'w-6/12', 'w-7/12', 'w-8/12', 'w-9/12', 'w-10/12', 'w-11/12', 'w-full',
] as const

function barWidthClass(count: number, maxCount: number) {
  const step = Math.round((count / maxCount) * (BAR_WIDTH_STEPS.length - 1))
  return BAR_WIDTH_STEPS[step]
}

export function TopLikedChart({ wines }: Props) {
  if (wines.length === 0) return null
  const maxCount = Math.max(1, ...wines.map((w) => w.count))

  return (
    <div>
      <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-3">
        ყველაზე მოწონებული პროდუქტები
      </p>
      <div className="max-h-96 overflow-y-auto flex flex-col gap-3 pr-1">
        {wines.map((wine, index) => (
          <div key={wine.wineId} className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-wine/10 text-wine">
              <Grape className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-charcoal/70">
                  {index + 1}. {wine.name}
                </span>
                <span className="shrink-0 text-sm font-bold text-wine">{wine.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-cream/60">
                <div className={`h-full rounded-full bg-wine ${barWidthClass(wine.count, maxCount)}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
