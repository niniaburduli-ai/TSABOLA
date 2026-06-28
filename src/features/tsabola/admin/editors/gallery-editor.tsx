'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'

export function GalleryEditor() {
  const { content, updateSection } = useContentStore()
  const { gallery } = content

  const updateImage = (index: number, val: string) => {
    const images = [...gallery.images]
    images[index] = val
    updateSection('gallery', { ...gallery, images })
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
      <div className="space-y-3">
        <Label className="text-sm font-medium text-charcoal/70">Image Paths</Label>
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
