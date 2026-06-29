'use client'

import { useState } from 'react'

import { useContentStore } from '@/features/tsabola/store/content-store'
import type { NewsItem } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'

const EMPTY_ITEM: NewsItem = {
  id: '',
  title: { ka: '', en: '' },
  date: '',
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
    const newItem: NewsItem = { ...EMPTY_ITEM, id: `news-${news.items.length + 1}` }
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
              className="font-medium text-charcoal hover:text-wine text-left"
            >
              {item.title.ka || item.title.en || `Item ${i + 1}`}
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
                  <Label className="text-sm text-charcoal/70">Date (e.g. January 2025)</Label>
                  <Input
                    value={item.date}
                    onChange={(e) => updateItem(i, { ...item, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm text-charcoal/70">Image path</Label>
                  <Input
                    value={item.image}
                    onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
                    placeholder="/news/item.jpg"
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
