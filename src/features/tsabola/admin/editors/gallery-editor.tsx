'use client'

import { useEffect, useState } from 'react'

import { GalleryUpload } from '@/features/gallery/components/gallery-upload'
import type { GalleryImage } from '@/features/gallery/types/gallery.types'
import { useContentStore } from '@/features/tsabola/store/content-store'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'
import { GalleryImageRow } from './_gallery-image-row'

export function GalleryEditor() {
  const { content, updateSection } = useContentStore()
  const { gallery } = content
  const [dbImages, setDbImages] = useState<GalleryImage[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

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
    setSaveError(null)
    try {
      const res = await fetch(`/api/gallery/${image._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: image.slug,
          published: image.published,
          caption: image.caption,
          description: image.description,
          date: image.date,
        }),
      })
      const updated: GalleryImage = await res.json()
      if (!res.ok || !updated?._id) {
        setSaveError('შენახვა ვერ მოხერხდა')
        return
      }
      updateLocal(image._id, {
        slug: updated.slug,
        published: updated.published,
        caption: updated.caption,
        description: updated.description,
        date: updated.date,
      })
    } catch {
      setSaveError('შენახვა ვერ მოხერხდა')
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
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
              ...prev,
            ])
          }
        />

        {dbImages.length > 0 && (
          <div className="space-y-4 mt-4">
            {dbImages.map((image) => (
              <GalleryImageRow
                key={image._id}
                image={image}
                expanded={expandedId === image._id}
                saving={saving === image._id}
                deleting={deleting === image._id}
                error={expandedId === image._id ? saveError : null}
                onToggle={() => setExpandedId(expandedId === image._id ? null : image._id)}
                onChange={(patch) => updateLocal(image._id, patch)}
                onSave={() => saveImage(image)}
                onDelete={() => deleteImage(image._id)}
              />
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
