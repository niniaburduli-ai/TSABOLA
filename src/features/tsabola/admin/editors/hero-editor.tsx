'use client'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { Button } from '@/shared/components/ui/button'
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

  const addImage = () => {
    updateSection('hero', { ...hero, images: [...hero.images, ''] })
  }

  const removeImage = (index: number) => {
    const images = hero.images.filter((_, i) => i !== index)
    updateSection('hero', { ...hero, images })
  }

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">მთავარი ბანერი</h2>
      <BilingualField label="სათაური" value={hero.headline} onChange={update('headline')} />
      <BilingualField label="ქვესათაური" value={hero.subline} onChange={update('subline')} />
      <BilingualField label="CTA ღილაკი" value={hero.cta} onChange={update('cta')} />

      <div className="space-y-4">
        <Label className="text-sm font-medium text-charcoal/70">მთავარი სურათები</Label>
        {hero.images.map((src, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-charcoal/50">სურათი {i + 1}</Label>
              {hero.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  წაშლა
                </button>
              )}
            </div>
            <Input
              value={src}
              onChange={(e) => updateImage(i, e.target.value)}
              placeholder="/hero/image.jpg"
            />
            <ImageUploadButton
              folder="tsabola/hero"
              onUpload={(url) => updateImage(i, url)}
              aspectRatio={16 / 9}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addImage}
          className="w-full"
        >
          + სურათის დამატება
        </Button>
      </div>
    </div>
  )
}
