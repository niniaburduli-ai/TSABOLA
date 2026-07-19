'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { useContentStore } from '@/features/tsabola/store/content-store'
import type { NewsItem } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { DEFAULT_HERO_POSITION } from '@/shared/const/hero-image.const'
import { slugify } from '@/shared/utils/slugify'

import { BilingualField } from './_bilingual-field'
import { HeroPositionPicker } from './_hero-position-picker'
import { ImageSizeSelect } from './_image-size-select'

function toBilingualDate(date: NewsItem['date']): NewsItem['date'] {
  return typeof date === 'string' ? { ka: date, en: date } : date
}

const EMPTY_ITEM: NewsItem = {
  id: '',
  slug: '',
  published: true,
  title: { ka: '', en: '' },
  date: { ka: '', en: '' },
  body: { ka: '', en: '' },
  image: '',
  imageSize: 'md',
  position: DEFAULT_HERO_POSITION,
}

export function NewsEditor() {
  const { content, updateSection } = useContentStore()
  const { news } = content
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const setItems = (items: NewsItem[]) => updateSection('news', { ...news, items })

  const updateItem = (index: number, item: NewsItem) => {
    const next = [...news.items]
    next[index] = item
    setItems(next)
  }

  const deleteItem = (index: number) => {
    setItems(news.items.filter((_, i) => i !== index))
  }

  const addItem = () => {
    const newItem: NewsItem = { ...EMPTY_ITEM, id: `news-${Date.now()}` }
    setItems([...news.items, newItem])
    setExpandedId(newItem.id)
  }

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = [...news.items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-charcoal">სიახლეები</h2>
        <Button size="sm" onClick={addItem} className="bg-wine hover:bg-wine/90 text-white">
          + სიახლის დამატება
        </Button>
      </div>

      <div className="space-y-4">
        <BilingualField
          label="სექციის სათაური"
          value={news.title}
          onChange={(v) => updateSection('news', { ...news, title: v })}
        />
        <BilingualField
          label="სექციის ქვესათაური"
          value={news.subtitle}
          onChange={(v) => updateSection('news', { ...news, subtitle: v })}
        />
      </div>

      {news.items.map((item, i) => (
        <div key={item.id} className="border border-border-wine rounded p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
              {item.image ? (
                <img src={item.image} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded bg-cream flex-shrink-0" />
              )}
              <span className="font-medium text-charcoal hover:text-wine truncate flex items-center gap-2">
                {item.title.ka || item.title.en || `სიახლე ${i + 1}`}
                {item.published === false && (
                  <span className="text-xs px-2 py-0.5 rounded bg-charcoal/10 text-charcoal/60 flex-shrink-0">დრაფტი</span>
                )}
              </span>
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                className="p-1.5 border rounded hover:bg-cream disabled:opacity-30"
                aria-label="ზემოთ გადატანა"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveItem(i, 1)}
                disabled={i === news.items.length - 1}
                className="p-1.5 border rounded hover:bg-cream disabled:opacity-30"
                aria-label="ქვემოთ გადატანა"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteItem(i)}
                className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
              >
                წაშლა
              </button>
            </div>
          </div>

          {expandedId === item.id && (
            <div className="space-y-4 pt-2 border-t border-border-wine">
              <BilingualField
                label="სათაური"
                value={item.title}
                onChange={(v) => updateItem(i, { ...item, title: v })}
              />
              <BilingualField
                label="ტექსტი"
                value={item.body}
                onChange={(v) => updateItem(i, { ...item, body: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-charcoal/70">სლაგი (URL: /news/…)</Label>
                  <Input
                    value={item.slug}
                    onChange={(e) => updateItem(i, { ...item, slug: slugify(e.target.value) })}
                    onBlur={() => {
                      if (!item.slug) {
                        updateItem(i, { ...item, slug: slugify(item.title.en || item.title.ka) })
                      }
                    }}
                    placeholder="ავტომატურად გენერირდება სათაურიდან"
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input
                    type="checkbox"
                    id={`published-${item.id}`}
                    checked={item.published !== false}
                    onChange={(e) => updateItem(i, { ...item, published: e.target.checked })}
                    className="h-4 w-4 accent-wine"
                  />
                  <Label htmlFor={`published-${item.id}`} className="text-sm text-charcoal/70">
                    გამოქვეყნებული
                  </Label>
                </div>
              </div>
              <BilingualField
                label="თარიღი (მაგ: იანვარი 2025)"
                value={toBilingualDate(item.date)}
                onChange={(v) => updateItem(i, { ...item, date: v })}
              />
              <div>
                <Label className="text-sm text-charcoal/70">სურათი</Label>
                <div className="flex gap-2">
                  <Input
                    value={item.image}
                    onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
                    placeholder="https://... ან /news/item.jpg"
                  />
                  <ImageUploadButton
                    onUpload={(url) => updateItem(i, { ...item, image: url })}
                    folder="tsabola/news"
                    aspectRatio={16 / 9}
                  />
                </div>
                <ImageSizeSelect
                  value={item.imageSize}
                  onChange={(imageSize) => updateItem(i, { ...item, imageSize })}
                />
                {item.image && (
                  <div className="max-w-56">
                    <HeroPositionPicker
                      label="ფოკუსი"
                      src={item.image}
                      value={item.position}
                      onChange={(position) => updateItem(i, { ...item, position })}
                      size={item.imageSize}
                      aspectClassName="aspect-video"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
