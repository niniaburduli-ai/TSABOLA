'use client'

import Image from 'next/image'
import { useCallback, useRef } from 'react'

import { Label } from '@/shared/components/ui/label'
import { HERO_ZOOM_CLASS, type HeroPosition } from '@/shared/const/hero-image.const'
import type { ImageSize } from '@/shared/types/common'

type Props = {
  label: string
  src: string
  value: HeroPosition
  onChange: (value: HeroPosition) => void
  size: ImageSize
  aspectClassName: string
}

export function HeroPositionPicker({ label, src, value, onChange, size, aspectClassName }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ pointerX: number; pointerY: number; value: HeroPosition } | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { pointerX: e.clientX, pointerY: e.clientY, value }
  }

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const start = dragStart.current
      const box = boxRef.current
      if (!start || !box || e.buttons !== 1) return
      const rect = box.getBoundingClientRect()
      // Dragging the photo right should reveal more of its left side, so pointer
      // delta subtracts from (not adds to) the stored object-position percentage.
      const deltaX = ((e.clientX - start.pointerX) / rect.width) * 100
      const deltaY = ((e.clientY - start.pointerY) / rect.height) * 100
      onChange({
        x: Math.round(Math.min(100, Math.max(0, start.value.x - deltaX))),
        y: Math.round(Math.min(100, Math.max(0, start.value.y - deltaY))),
      })
    },
    [onChange]
  )

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs text-charcoal/50">{label}</Label>
        <span className="text-xs text-charcoal/30">
          {value.x}%, {value.y}%
        </span>
      </div>
      <div
        ref={boxRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={[
          'relative w-full overflow-hidden rounded border border-charcoal/15 bg-charcoal',
          'cursor-move touch-none select-none',
          aspectClassName,
        ].join(' ')}
      >
        {src && (
          <Image
            src={src}
            alt=""
            fill
            sizes="300px"
            className={['object-cover pointer-events-none', HERO_ZOOM_CLASS[size]].join(' ')}
            style={{ objectPosition: `${value.x}% ${value.y}%` }}
          />
        )}
      </div>
    </div>
  )
}
