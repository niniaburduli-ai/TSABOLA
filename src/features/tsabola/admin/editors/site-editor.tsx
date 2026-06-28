'use client'

import { BilingualField } from './_bilingual-field'
import { useContentStore } from '../../store/content-store'

export function SiteEditor() {
  const { content, updateSection } = useContentStore()

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Site Info</h2>
      <BilingualField
        label="Site Name"
        value={content.site.name}
        onChange={(val) => updateSection('site', { ...content.site, name: val })}
      />
      <BilingualField
        label="Slogan"
        value={content.site.slogan}
        onChange={(val) => updateSection('site', { ...content.site, slogan: val })}
      />

      <div className="pt-4 border-t border-border-wine">
        <p className="text-sm font-semibold text-charcoal mb-4">Navigation Labels</p>
        {(['wines', 'gallery', 'about', 'contact'] as const).map((key) => (
          <BilingualField
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={content.nav[key]}
            onChange={(val) => updateSection('nav', { ...content.nav, [key]: val })}
          />
        ))}
      </div>
    </div>
  )
}
