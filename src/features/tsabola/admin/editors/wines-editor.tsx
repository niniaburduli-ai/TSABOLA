'use client'

import { useState } from 'react'

import { useContentStore } from '@/features/tsabola/store/content-store'
import type { WineItem } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { DEFAULT_HERO_POSITION } from '@/shared/const/hero-image.const'

import { BilingualField } from './_bilingual-field'
import { WineRow } from './_wine-row'

const EMPTY_WINE: WineItem = {
  id: '',
  name: { ka: '', en: '' },
  type: { ka: '', en: '' },
  typeBadge: { ka: '', en: '' },
  price: '',
  discountPrice: '',
  description: { ka: '', en: '' },
  image: '',
  imageSize: 'md',
  position: DEFAULT_HERO_POSITION,
  details: { ka: '', en: '' },
  longDescription: { ka: '', en: '' },
  serveTemp: '',
  alcohol: '',
  volume: '',
}

export function WinesEditor() {
  const { content, updateSection } = useContentStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const setWines = (items: WineItem[]) => updateSection('wines', { ...content.wines, items })

  const updateWine = (index: number, wine: WineItem) => {
    const next = [...content.wines.items]
    next[index] = wine
    setWines(next)
  }

  const deleteWine = (index: number) => {
    setWines(content.wines.items.filter((_, i) => i !== index))
  }

  const addWine = () => {
    const newWine: WineItem = { ...EMPTY_WINE, id: `wine-${content.wines.items.length + 1}` }
    setWines([...content.wines.items, newWine])
    setExpandedId(newWine.id)
  }

  const moveWine = (index: number, dir: -1 | 1) => {
    const next = [...content.wines.items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setWines(next)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-charcoal">ღვინოები</h2>
        <Button size="sm" onClick={addWine} className="bg-wine hover:bg-wine/90 text-white">
          + ღვინის დამატება
        </Button>
      </div>

      <BilingualField
        label="ზედწერილი (ბეჯი)"
        value={content.wines.subtitle}
        onChange={(v) => updateSection('wines', { ...content.wines, subtitle: v })}
      />
      <BilingualField
        label="სათაური"
        value={content.wines.title}
        onChange={(v) => updateSection('wines', { ...content.wines, title: v })}
      />

      {content.wines.items.map((wine, i) => (
        <WineRow
          key={wine.id}
          wine={wine}
          index={i}
          isFirst={i === 0}
          isLast={i === content.wines.items.length - 1}
          expanded={expandedId === wine.id}
          onToggleExpand={() => setExpandedId(expandedId === wine.id ? null : wine.id)}
          onMove={(dir) => moveWine(i, dir)}
          onDelete={() => deleteWine(i)}
          onUpdate={(next) => updateWine(i, next)}
        />
      ))}
    </div>
  )
}
