'use client'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import type { HeroImage, HeroImagePosition } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

import { BilingualField } from './_bilingual-field'
import { ImageSizeSelect } from './_image-size-select'
import { useContentStore } from '../../store/content-store'

const POSITION_LABEL: Record<HeroImagePosition, string> = {
  top: 'ზედა',
  center: 'ცენტრი',
  bottom: 'ქვედა',
}

export function HeroEditor() {
  const { content, updateSection } = useContentStore()
  const { hero } = content

  const update = (key: keyof typeof hero) => (val: typeof hero[typeof key]) =>
    updateSection('hero', { ...hero, [key]: val })

  const patchImage = (index: number, patch: Partial<HeroImage>) => {
    const images = hero.images.map((image, i) => (i === index ? { ...image, ...patch } : image))
    updateSection('hero', { ...hero, images })
  }

  const addImage = () => {
    const image: HeroImage = { src: '', positionMobile: 'center', positionDesktop: 'center', size: 'md' }
    updateSection('hero', { ...hero, images: [...hero.images, image] })
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
        {hero.images.map((image, i) => (
          <div key={i} className="space-y-2">
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
              value={image.src}
              onChange={(e) => patchImage(i, { src: e.target.value })}
              placeholder="/hero/image.jpg"
            />
            <ImageUploadButton
              folder="tsabola/hero"
              onUpload={(url) => patchImage(i, { src: url })}
              aspectRatio={16 / 9}
            />
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-charcoal/50">მობილურზე</Label>
                <Select
                  value={image.positionMobile}
                  onValueChange={(v) => patchImage(i, { positionMobile: v as HeroImagePosition })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">{POSITION_LABEL.top}</SelectItem>
                    <SelectItem value="center">{POSITION_LABEL.center}</SelectItem>
                    <SelectItem value="bottom">{POSITION_LABEL.bottom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-charcoal/50">დესქტოპზე</Label>
                <Select
                  value={image.positionDesktop}
                  onValueChange={(v) => patchImage(i, { positionDesktop: v as HeroImagePosition })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">{POSITION_LABEL.top}</SelectItem>
                    <SelectItem value="center">{POSITION_LABEL.center}</SelectItem>
                    <SelectItem value="bottom">{POSITION_LABEL.bottom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ImageSizeSelect value={image.size} onChange={(size) => patchImage(i, { size })} />
            </div>
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
