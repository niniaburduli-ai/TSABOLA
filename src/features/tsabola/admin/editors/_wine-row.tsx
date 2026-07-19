'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { getWineDiscount } from '@/features/tsabola/hooks/use-wine-discount'
import type { WineItem } from '@/features/tsabola/types'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'
import { HeroPositionPicker } from './_hero-position-picker'
import { ImageSizeSelect } from './_image-size-select'

type WineRowProps = {
  wine: WineItem
  index: number
  isFirst: boolean
  isLast: boolean
  expanded: boolean
  onToggleExpand: () => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  onUpdate: (wine: WineItem) => void
}

export function WineRow({ wine, index, isFirst, isLast, expanded, onToggleExpand, onMove, onDelete, onUpdate }: WineRowProps) {
  const discount = wine.discountPrice ? getWineDiscount(wine.price, wine.discountPrice) : null

  return (
    <div className="border border-border-wine rounded p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onToggleExpand} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          {wine.image ? (
            <img src={wine.image} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded bg-cream flex-shrink-0" />
          )}
          <span className="font-medium text-charcoal hover:text-wine truncate">
            {wine.name.ka || wine.name.en || `ღვინო ${index + 1}`}
          </span>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="p-1.5 border rounded hover:bg-cream disabled:opacity-30"
            aria-label="ზემოთ გადატანა"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="p-1.5 border rounded hover:bg-cream disabled:opacity-30"
            aria-label="ქვემოთ გადატანა"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">
          წაშლა
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 pt-2 border-t border-border-wine">
          <BilingualField
            label="სახელი"
            value={wine.name}
            onChange={(v) => onUpdate({ ...wine, name: v, typeBadge: wine.typeBadge })}
          />
          <BilingualField
            label="ტიპი"
            value={wine.type}
            onChange={(v) => onUpdate({ ...wine, type: v, typeBadge: v })}
          />
          <BilingualField
            label="აღწერა"
            value={wine.description}
            onChange={(v) => onUpdate({ ...wine, description: v })}
          />
          <BilingualField
            label="მოკლე აღწერა"
            hint="ჩანს ღვინის ბარათზე, სახელის ქვემოთ. თითო მახასიათებელი თითო ხაზზე, მაგ: ღვინო: მშრალი | ყურძენი: ჩინებული"
            multiline
            value={wine.details ?? { ka: '', en: '' }}
            onChange={(v) => onUpdate({ ...wine, details: v })}
          />
          <BilingualField
            label="სრული აღწერა"
            hint="ჩანს ღვინის დეტალების ფანჯარაში"
            multiline
            value={wine.longDescription ?? { ka: '', en: '' }}
            onChange={(v) => onUpdate({ ...wine, longDescription: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-charcoal/70">ფასი (მაგ: 45₾)</Label>
              <Input value={wine.price} onChange={(e) => onUpdate({ ...wine, price: e.target.value })} />
            </div>
            <div>
              <Label className="text-sm text-charcoal/70">ფასდაკლებული ფასი (არასავალდებულო)</Label>
              <Input
                value={wine.discountPrice ?? ''}
                onChange={(e) => onUpdate({ ...wine, discountPrice: e.target.value })}
                placeholder="მაგ: 40₾"
              />
              {wine.discountPrice && (
                <p className="text-xs text-red-600 mt-1">
                  {discount
                    ? `ფასდაკლება -${discount.percent}% გამოჩნდება საიტზე`
                    : 'ფასდაკლებული ფასი უნდა იყოს ვალიდური თანხა, ჩვეულებრივ ფასზე ნაკლები'}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-charcoal/70">სურათი</Label>
            <Input value={wine.image} onChange={(e) => onUpdate({ ...wine, image: e.target.value })} placeholder="/wines/name.jpg" />
            <ImageUploadButton folder="tsabola/wines" onUpload={(url) => onUpdate({ ...wine, image: url })} aspectRatio={3 / 4} />
            <ImageSizeSelect value={wine.imageSize} onChange={(imageSize) => onUpdate({ ...wine, imageSize })} />
            {wine.image && (
              <div className="max-w-56">
                <HeroPositionPicker
                  label="ფოკუსი"
                  src={wine.image}
                  value={wine.position}
                  onChange={(position) => onUpdate({ ...wine, position })}
                  size={wine.imageSize}
                  aspectClassName="aspect-portrait"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-charcoal/70">მირთმევის ტემპერატურა</Label>
              <Input
                value={wine.serveTemp ?? ''}
                onChange={(e) => onUpdate({ ...wine, serveTemp: e.target.value })}
                placeholder="10–12°C"
              />
            </div>
            <div>
              <Label className="text-sm text-charcoal/70">ალკოჰოლი</Label>
              <Input value={wine.alcohol ?? ''} onChange={(e) => onUpdate({ ...wine, alcohol: e.target.value })} placeholder="13.5%" />
            </div>
            <div>
              <Label className="text-sm text-charcoal/70">მოცულობა</Label>
              <Input value={wine.volume ?? ''} onChange={(e) => onUpdate({ ...wine, volume: e.target.value })} placeholder="750 მლ" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
