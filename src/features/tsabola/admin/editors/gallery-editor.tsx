'use client'

import { useEffect, useState } from 'react'

import { GalleryUpload } from '@/features/gallery/components/gallery-upload'
import { useContentStore } from '@/features/tsabola/store/content-store'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'

type DbImage = { _id: string; url: string; publicId: string }

export function GalleryEditor() {
  const { content, updateSection } = useContentStore()
  const { gallery } = content
  const [dbImages, setDbImages] = useState<DbImage[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setDbImages(data))
      .catch(() => {})
  }, [])

  const updateImage = (index: number, val: string) => {
    const images = [...gallery.images]
    images[index] = val
    updateSection('gallery', { ...gallery, images })
  }

  async function deleteImage(id: string) {
    setDeleting(id)
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
    setDbImages((prev) => prev.filter((img) => img._id !== id))
    setDeleting(null)
  }

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Gallery</h2>
      <BilingualField
        label="Title"
        value={gallery.title}
        onChange={(v) => updateSection('gallery', { ...gallery, title: v })}
      />
      <BilingualField
        label="Subtitle"
        value={gallery.subtitle}
        onChange={(v) => updateSection('gallery', { ...gallery, subtitle: v })}
      />

      <div className="space-y-4">
        <Label className="text-sm font-medium text-charcoal/70">Upload to Gallery</Label>
        <GalleryUpload
          onUploaded={(img) =>
            setDbImages((prev) => [{ _id: img.id, url: img.url, publicId: img.publicId }, ...prev])
          }
        />

        {dbImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {dbImages.map((img) => (
              <div key={img._id} className="relative group aspect-square">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  disabled={deleting === img._id}
                  onClick={() => deleteImage(img._id)}
                  className={
                    'absolute top-1 right-1 bg-black/70 text-white text-xs ' +
                    'px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 ' +
                    'transition-opacity disabled:opacity-50'
                  }
                >
                  {deleting === img._id ? '…' : '✕'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-charcoal/70">Static Image Paths</Label>
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
