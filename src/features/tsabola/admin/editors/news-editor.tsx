'use client'

import { useState } from 'react'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { useContentStore } from '@/features/tsabola/store/content-store'
import type { NewsItem } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { slugify } from '@/shared/utils/slugify'

import { BilingualField } from './_bilingual-field'

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
        <h2 className="font-display text-2xl font-bold text-charcoal">News</h2>
        <Button size="sm" onClick={addItem} className="bg-wine hover:bg-wine/90 text-white">
          + Add Item
        </Button>
      </div>

      <div className="space-y-4">
        <BilingualField
          label="Section Title"
          value={news.title}
          onChange={(v) => updateSection('news', { ...news, title: v })}
        />
        <BilingualField
          label="Section Subtitle"
          value={news.subtitle}
          onChange={(v) => updateSection('news', { ...news, subtitle: v })}
        />
      </div>

      {news.items.map((item, i) => (
        <div key={item.id} className="border border-border-wine rounded p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="font-medium text-charcoal hover:text-wine text-left flex items-center gap-2"
            >
              {item.title.ka || item.title.en || `Item ${i + 1}`}
              {item.published === false && (
                <span className="text-xs px-2 py-0.5 rounded bg-charcoal/10 text-charcoal/60">Draft</span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                className="text-xs px-2 py-1 border rounded hover:bg-cream disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveItem(i, 1)}
                disabled={i === news.items.length - 1}
                className="text-xs px-2 py-1 border rounded hover:bg-cream disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => deleteItem(i)}
                className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          {expandedId === item.id && (
            <div className="space-y-4 pt-2 border-t border-border-wine">
              <BilingualField
                label="Title"
                value={item.title}
                onChange={(v) => updateItem(i, { ...item, title: v })}
              />
              <BilingualField
                label="Body"
                value={item.body}
                onChange={(v) => updateItem(i, { ...item, body: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-charcoal/70">Slug (URL: /news/…)</Label>
                  <Input
                    value={item.slug}
                    onChange={(e) => updateItem(i, { ...item, slug: slugify(e.target.value) })}
                    onBlur={() => {
                      if (!item.slug) {
                        updateItem(i, { ...item, slug: slugify(item.title.en || item.title.ka) })
                      }
                    }}
                    placeholder="auto-generated from title"
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
                    Published
                  </Label>
                </div>
              </div>
              <BilingualField
                label="Date (e.g. January 2025)"
                value={toBilingualDate(item.date)}
                onChange={(v) => updateItem(i, { ...item, date: v })}
              />
              <div>
                <Label className="text-sm text-charcoal/70">Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={item.image}
                    onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
                    placeholder="https://... or /news/item.jpg"
                  />
                  <ImageUploadButton
                    onUpload={(url) => updateItem(i, { ...item, image: url })}
                    folder="tsabola/news"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
