'use client'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'
import { useContentStore } from '../../store/content-store'

export function HeroEditor() {
  const { content, updateSection } = useContentStore()
  const { hero } = content

  const update = (key: keyof typeof hero) => (val: typeof hero[typeof key]) =>
    updateSection('hero', { ...hero, [key]: val })

  const updateImage = (index: number, url: string) => {
    const images = [...hero.images]
    images[index] = url
    updateSection('hero', { ...hero, images })
  }

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Hero</h2>
      <BilingualField label="Headline" value={hero.headline} onChange={update('headline')} />
      <BilingualField label="Subline" value={hero.subline} onChange={update('subline')} />
      <BilingualField label="CTA Button" value={hero.cta} onChange={update('cta')} />

      <div className="space-y-3">
        <Label className="text-sm font-medium text-charcoal/70">Hero Images</Label>
        {hero.images.map((src, i) => (
          <div key={i} className="space-y-1">
            <Label className="text-xs text-charcoal/50">Image {i + 1}</Label>
            <Input
              value={src}
              onChange={(e) => updateImage(i, e.target.value)}
              placeholder="/hero/image.jpg"
            />
            <ImageUploadButton
              folder="tsabola/hero"
              onUpload={(url) => updateImage(i, url)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
