'use client'

import Image from 'next/image'

import { useLang } from '../hooks/use-lang'

function StaffLines() {
  const ys = [8, 17, 26, 35, 44, 53, 62, 71, 80, 89, 98]
  return (
    <svg
      className="absolute inset-0 w-full h-full text-charcoal/8"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      aria-hidden
    >
      {ys.map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

export function TsabolaMarketingPost() {
  const { t, r } = useLang()

  return (
    <div className="relative aspect-square w-full bg-cream overflow-hidden">
      <StaffLines />

      <div className="relative z-10 h-full flex flex-col items-center px-12 py-10">

        {/* Top meta row */}
        <div className="flex items-center justify-between w-full">
          <p className="text-charcoal/30 text-xs tracking-widest uppercase">
            {r({ ka: 'ქართული ღვინო', en: 'Georgian Wine' })}
          </p>
          <p className="text-charcoal/30 text-xs tracking-widest font-light">
            Est. 2022
          </p>
        </div>

        {/* Note image — fully visible, no overlap */}
        <div className="relative flex-1 w-full my-6">
          <Image
            src="/LA.PNG"
            alt={r({ ka: 'ცაბო — ქართული ღვინო', en: 'Tsabo — Georgian Wine' })}
            fill
            className="object-contain"
          />
        </div>

        {/* Brand block — below image, no overlap */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-4 justify-center w-full">
            <span className="flex-1 h-px bg-wine/50 block" />
            <span className="w-1.5 h-1.5 rotate-45 bg-wine inline-block" />
            <span className="flex-1 h-px bg-wine/50 block" />
          </div>

          <span className="font-display font-bold text-6xl tracking-widest text-charcoal italic -skew-x-3">
            {r({ ka: 'ცაბო', en: 'TSABO' })}
          </span>

          <p className="text-charcoal/40 text-xs tracking-widest text-center">
            {r(t.site.slogan)}
          </p>
        </div>
      </div>
    </div>
  )
}
