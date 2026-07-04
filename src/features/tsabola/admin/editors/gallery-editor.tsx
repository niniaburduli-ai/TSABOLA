'use client'

import { useEffect, useState } from 'react'

import { GalleryUpload } from '@/features/gallery/components/gallery-upload'
import type { GalleryImage } from '@/features/gallery/types/gallery.types'
import { useContentStore } from '@/features/tsabola/store/content-store'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { slugify } from '@/shared/utils/slugify'

import { BilingualField } from './_bilingual-field'

export function GalleryEditor() {
  const { content, updateSection } = useContentStore()
  const { gallery } = content
  const [dbImages, setDbImages] = useState<GalleryImage[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data: GalleryImage[]) => Array.isArray(data) && setDbImages(data))
      .catch(() => {})
  }, [])

  const updateImage = (index: number, val: string) => {
    const images = [...gallery.images]
    images[index] = val
    updateSection('gallery', { ...gallery, images })
  }

  function updateLocal(id: string, patch: Partial<GalleryImage>) {
    setDbImages((prev) => prev.map((img) => (img._id === id ? { ...img, ...patch } : img)))
  }

  async function saveImage(image: GalleryImage) {
    setSaving(image._id)
    try {
      const res = await fetch(`/api/gallery/${image._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: image.slug,
          published: image.published,
          caption: image.caption,
          description: image.description,
        }),
      })
      const updated: GalleryImage = await res.json()
      if (updated?._id) {
        updateLocal(image._id, {
          slug: updated.slug,
          published: updated.published,
          caption: updated.caption,
          description: updated.description,
        })
      }
    } finally {
      setSaving(null)
    }
  }

  async function deleteImage(id: string) {
    setDeleting(id)
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    setDbImages((prev) => prev.filter((img) => img._id !== id))
    setDeleting(null)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">გალერეა</h2>
      <BilingualField
        label="სათაური"
        value={gallery.title}
        onChange={(v) => updateSection('gallery', { ...gallery, title: v })}
      />
      <BilingualField
        label="ქვესათაური"
        value={gallery.subtitle}
        onChange={(v) => updateSection('gallery', { ...gallery, subtitle: v })}
      />

      <div className="space-y-4">
        <Label className="text-sm font-medium text-charcoal/70">ატვირთვა გალერეაში</Label>
        <GalleryUpload
          onUploaded={(img) =>
            setDbImages((prev) => [
              {
                _id: img.id,
                url: img.url,
                publicId: img.publicId,
                slug: '',
                published: true,
                caption: { ka: '', en: '' },
                description: { ka: '', en: '' },
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ])
          }
        />

        {dbImages.length > 0 && (
          <div className="space-y-4 mt-4">
            {dbImages.map((image) => (
              <div key={image._id} className="border border-border-wine rounded p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <img src={image.url} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" />
                  <button
                    onClick={() => setExpandedId(expandedId === image._id ? null : image._id)}
                    className="font-medium text-charcoal hover:text-wine text-left flex items-center gap-2 flex-1"
                  >
                    {image.caption.ka || image.caption.en || image.slug || 'უსახელო სურათი'}
                    {image.published === false && (
                      <span className="text-xs px-2 py-0.5 rounded bg-charcoal/10 text-charcoal/60">დრაფტი</span>
                    )}
                  </button>
                  <button
                    onClick={() => deleteImage(image._id)}
                    disabled={deleting === image._id}
                    className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting === image._id ? '…' : 'წაშლა'}
                  </button>
                </div>

                {expandedId === image._id && (
                  <div className="space-y-4 pt-2 border-t border-border-wine">
                    <BilingualField
                      label="წარწერა"
                      value={image.caption}
                      onChange={(v) => updateLocal(image._id, { caption: v })}
                    />
                    <BilingualField
                      label="აღწერა"
                      value={image.description}
                      onChange={(v) => updateLocal(image._id, { description: v })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-charcoal/70">სლაგი (URL: /gallery/…)</Label>
                        <Input
                          value={image.slug}
                          onChange={(e) => updateLocal(image._id, { slug: slugify(e.target.value) })}
                          onBlur={() => {
                            if (!image.slug) {
                              updateLocal(image._id, { slug: slugify(image.caption.en || image.caption.ka) })
                            }
                          }}
                          placeholder="ავტომატურად გენერირდება წარწერიდან"
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-1">
                        <input
                          type="checkbox"
                          id={`published-${image._id}`}
                          checked={image.published !== false}
                          onChange={(e) => updateLocal(image._id, { published: e.target.checked })}
                          className="h-4 w-4 accent-wine"
                        />
                        <Label htmlFor={`published-${image._id}`} className="text-sm text-charcoal/70">
                          გამოქვეყნებული
                        </Label>
                      </div>
                    </div>
                    <button
                      onClick={() => saveImage(image)}
                      disabled={saving === image._id}
                      className="px-4 py-2 bg-wine text-white text-sm font-medium rounded hover:bg-wine/90 disabled:opacity-50"
                    >
                      {saving === image._id ? 'ინახება…' : 'შენახვა'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-charcoal/70">სტატიკური სურათების მისამართები</Label>
        {gallery.images.map((src, i) => (
          <Input
            key={i}
            value={src}
            onChange={(e) => updateImage(i, e.target.value)}
            placeholder={`/gallery/image-${i + 1}.jpg`}
          />
        ))}
      </div>
    </div>
  )
}
