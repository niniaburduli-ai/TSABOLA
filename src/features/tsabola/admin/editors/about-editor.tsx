'use client'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import { useContentStore } from '@/features/tsabola/store/content-store'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'

import { BilingualField } from './_bilingual-field'

export function AboutEditor() {
  const { content, updateSection } = useContentStore()
  const { about } = content

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">ჩვენ შესახებ</h2>
      <BilingualField
        label="სათაური"
        value={about.title}
        onChange={(v) => updateSection('about', { ...about, title: v })}
      />
      <div className="space-y-2">
        <Label className="text-sm font-medium text-charcoal/70">ტექსტი</Label>
        <Tabs defaultValue="ka">
          <TabsList className="h-8">
            <TabsTrigger value="ka" className="text-xs">KA</TabsTrigger>
            <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
          </TabsList>
          {(['ka', 'en'] as const).map((lang) => (
            <TabsContent key={lang} value={lang}>
              <Textarea
                value={about.body[lang]}
                onChange={(e) =>
                  updateSection('about', { ...about, body: { ...about.body, [lang]: e.target.value } })
                }
                rows={6}
                className="w-full"
              />
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-xs text-charcoal/40">პარაგრაფები გამოყავით ცარიელი ხაზით.</p>
      </div>
      <div className="space-y-1">
        <Label className="text-sm text-charcoal/70">სურათი</Label>
        <Input
          value={about.image}
          onChange={(e) => updateSection('about', { ...about, image: e.target.value })}
          placeholder="/about/winery.jpg"
        />
        <ImageUploadButton
          folder="tsabola/about"
          onUpload={(url) => updateSection('about', { ...about, image: url })}
          aspectRatio={3 / 4}
        />
      </div>
    </div>
  )
}
