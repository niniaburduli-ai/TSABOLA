'use client'

import { useState } from 'react'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { getWineDiscount } from '@/features/tsabola/hooks/use-wine-discount'
import { useContentStore } from '@/features/tsabola/store/content-store'
import type { WineItem } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'

const EMPTY_WINE: WineItem = {
  id: '',
  name: { ka: '', en: '' },
  type: { ka: '', en: '' },
  typeBadge: { ka: '', en: '' },
  price: '',
  discountPrice: '',
  description: { ka: '', en: '' },
  image: '',
  details: { ka: '', en: '' },
  longDescription: { ka: '', en: '' },
  serveTemp: '',
  alcohol: '',
  volume: '',
}

export function WinesEditor() {
  const { content, updateSection } = useContentStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const setWines = (wines: WineItem[]) => updateSection('wines', wines)

  const updateWine = (index: number, wine: WineItem) => {
    const next = [...content.wines]
    next[index] = wine
    setWines(next)
  }

  const deleteWine = (index: number) => {
    setWines(content.wines.filter((_, i) => i !== index))
  }

  const addWine = () => {
    const newWine: WineItem = { ...EMPTY_WINE, id: `wine-${content.wines.length + 1}` }
    setWines([...content.wines, newWine])
    setExpandedId(newWine.id)
  }

  const moveWine = (index: number, dir: -1 | 1) => {
    const next = [...content.wines]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setWines(next)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-charcoal">Wines</h2>
        <Button size="sm" onClick={addWine} className="bg-wine hover:bg-wine/90 text-white">
          + Add Wine
        </Button>
      </div>

      {content.wines.map((wine, i) => {
        const discount = wine.discountPrice ? getWineDiscount(wine.price, wine.discountPrice) : null

        return (
          <div key={wine.id} className="border border-border-wine rounded p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedId(expandedId === wine.id ? null : wine.id)}
                className="font-medium text-charcoal hover:text-wine text-left"
              >
                {wine.name.ka || wine.name.en || `Wine ${i + 1}`}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveWine(i, -1)}
                  disabled={i === 0}
                  className="text-xs px-2 py-1 border rounded hover:bg-cream disabled:opacity-30"
                >
                ↑
                </button>
                <button
                  onClick={() => moveWine(i, 1)}
                  disabled={i === content.wines.length - 1}
                  className="text-xs px-2 py-1 border rounded hover:bg-cream disabled:opacity-30"
                >
                ↓
                </button>
                <button
                  onClick={() => deleteWine(i)}
                  className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
                >
                Delete
                </button>
              </div>
            </div>

            {expandedId === wine.id && (
              <div className="space-y-4 pt-2 border-t border-border-wine">
                <BilingualField
                  label="Name"
                  value={wine.name}
                  onChange={(v) => updateWine(i, { ...wine, name: v, typeBadge: wine.typeBadge })}
                />
                <BilingualField
                  label="Type"
                  value={wine.type}
                  onChange={(v) => updateWine(i, { ...wine, type: v, typeBadge: v })}
                />
                <BilingualField
                  label="Description"
                  value={wine.description}
                  onChange={(v) => updateWine(i, { ...wine, description: v })}
                />
                <BilingualField
                  label="Short Description"
                  hint="Shown on the wine card, under the name. One attribute per line, e.g. Wine: Dry | Grape: Chinebuli"
                  multiline
                  value={wine.details ?? { ka: '', en: '' }}
                  onChange={(v) => updateWine(i, { ...wine, details: v })}
                />
                <BilingualField
                  label="Full Description"
                  hint="Shown in the wine detail popup"
                  multiline
                  value={wine.longDescription ?? { ka: '', en: '' }}
                  onChange={(v) => updateWine(i, { ...wine, longDescription: v })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-charcoal/70">Price (e.g. 45₾)</Label>
                    <Input
                      value={wine.price}
                      onChange={(e) => updateWine(i, { ...wine, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-charcoal/70">Discount Price (optional)</Label>
                    <Input
                      value={wine.discountPrice ?? ''}
                      onChange={(e) => updateWine(i, { ...wine, discountPrice: e.target.value })}
                      placeholder="e.g. 40₾"
                    />
                    {wine.discountPrice && (
                      <p className="text-xs text-red-600 mt-1">
                        {discount
                          ? `Discount -${discount.percent}% will be shown on the website`
                          : 'Discount price must be a valid amount lower than the regular price'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-charcoal/70">Image</Label>
                  <Input
                    value={wine.image}
                    onChange={(e) => updateWine(i, { ...wine, image: e.target.value })}
                    placeholder="/wines/name.jpg"
                  />
                  <ImageUploadButton
                    folder="tsabola/wines"
                    onUpload={(url) => updateWine(i, { ...wine, image: url })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-charcoal/70">Serve Temp</Label>
                    <Input
                      value={wine.serveTemp ?? ''}
                      onChange={(e) => updateWine(i, { ...wine, serveTemp: e.target.value })}
                      placeholder="10–12°C"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-charcoal/70">Alcohol</Label>
                    <Input
                      value={wine.alcohol ?? ''}
                      onChange={(e) => updateWine(i, { ...wine, alcohol: e.target.value })}
                      placeholder="13.5%"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-charcoal/70">Volume</Label>
                    <Input
                      value={wine.volume ?? ''}
                      onChange={(e) => updateWine(i, { ...wine, volume: e.target.value })}
                      placeholder="750 მლ"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
