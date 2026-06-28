'use client'

import { BilingualField } from './_bilingual-field'
import { useContentStore } from '../../store/content-store'

export function FooterEditor() {
  const { content, updateSection } = useContentStore()

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Footer</h2>
      <BilingualField
        label="Copyright Text"
        value={content.footer.copy}
        onChange={(val) => updateSection('footer', { copy: val })}
      />
    </div>
  )
}
