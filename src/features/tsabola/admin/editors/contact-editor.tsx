'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

import { BilingualField } from './_bilingual-field'

export function ContactEditor() {
  const { content, updateSection } = useContentStore()
  const { contact } = content

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">კონტაქტი</h2>
      <BilingualField
        label="სექციის სათაური"
        value={contact.title}
        onChange={(v) => updateSection('contact', { ...contact, title: v })}
      />
      <BilingualField
        label="ქვესათაური"
        value={contact.subtitle}
        onChange={(v) => updateSection('contact', { ...contact, subtitle: v })}
      />
      <BilingualField
        label="მისამართი"
        value={contact.address}
        onChange={(v) => updateSection('contact', { ...contact, address: v })}
      />
      <div>
        <Label className="text-sm text-charcoal/70">ელ. ფოსტა</Label>
        <Input
          value={contact.email}
          onChange={(e) => updateSection('contact', { ...contact, email: e.target.value })}
        />
      </div>
      <div>
        <Label className="text-sm text-charcoal/70">ტელეფონი</Label>
        <Input
          value={contact.phone}
          onChange={(e) => updateSection('contact', { ...contact, phone: e.target.value })}
        />
      </div>
    </div>
  )
}
