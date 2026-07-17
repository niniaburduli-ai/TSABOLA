'use client'

import type { GalleryImage } from '@/features/gallery/types/gallery.types'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { slugify } from '@/shared/utils/slugify'

import { BilingualField } from './_bilingual-field'
import { ImageSizeSelect } from './_image-size-select'

type Props = {
  image: GalleryImage
  expanded: boolean
  saving: boolean
  deleting: boolean
  error?: string | null
  onToggle: () => void
  onChange: (patch: Partial<GalleryImage>) => void
  onSave: () => void
  onDelete: () => void
}

function toMonthInput(iso: string): string {
  return iso ? iso.slice(0, 7) : ''
}

function fromMonthInput(value: string): string {
  return value ? new Date(`${value}-01T00:00:00.000Z`).toISOString() : ''
}

export function GalleryImageRow({
  image, expanded, saving, deleting, error, onToggle, onChange, onSave, onDelete,
}: Props) {
  return (
    <div className="border border-border-wine rounded p-4 space-y-4">
      <div className="flex items-center gap-4">
        <img src={image.url} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" />
        <button
          onClick={onToggle}
          className="font-medium text-charcoal hover:text-wine text-left flex items-center gap-2 flex-1"
        >
          {image.caption.ka || image.caption.en || image.slug || 'უსახელო სურათი'}
          {image.published === false && (
            <span className="text-xs px-2 py-0.5 rounded bg-charcoal/10 text-charcoal/60">დრაფტი</span>
          )}
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? '…' : 'წაშლა'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-2 border-t border-border-wine">
          <BilingualField label="წარწერა" value={image.caption} onChange={(v) => onChange({ caption: v })} />
          <BilingualField label="აღწერა" value={image.description} onChange={(v) => onChange({ description: v })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-charcoal/70">სლაგი (URL: /gallery/…)</Label>
              <Input
                value={image.slug}
                onChange={(e) => onChange({ slug: slugify(e.target.value) })}
                onBlur={() => {
                  if (!image.slug) onChange({ slug: slugify(image.caption.en || image.caption.ka) })
                }}
                placeholder="ავტომატურად გენერირდება წარწერიდან"
              />
            </div>
            <div>
              <Label className="text-sm text-charcoal/70">თარიღი</Label>
              <Input
                type="month"
                value={toMonthInput(image.date)}
                onChange={(e) => onChange({ date: fromMonthInput(e.target.value) })}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                id={`published-${image._id}`}
                checked={image.published !== false}
                onChange={(e) => onChange({ published: e.target.checked })}
                className="h-4 w-4 accent-wine"
              />
              <Label htmlFor={`published-${image._id}`} className="text-sm text-charcoal/70">
                გამოქვეყნებული
              </Label>
            </div>
            <ImageSizeSelect value={image.imageSize} onChange={(imageSize) => onChange({ imageSize })} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-wine text-white text-sm font-medium rounded hover:bg-wine/90 disabled:opacity-50"
            >
              {saving ? 'ინახება…' : 'შენახვა'}
            </button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
