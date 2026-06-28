'use client'

import { BilingualField } from './_bilingual-field'
import { useContentStore } from '../../store/content-store'

export function HeroEditor() {
  const { content, updateSection } = useContentStore()
  const { hero } = content

  const update = (key: keyof typeof hero) => (val: typeof hero[typeof key]) =>
    updateSection('hero', { ...hero, [key]: val })

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Hero</h2>
      <BilingualField label="Headline" value={hero.headline} onChange={update('headline')} />
      <BilingualField label="Subline" value={hero.subline} onChange={update('subline')} />
      <BilingualField label="CTA Button" value={hero.cta} onChange={update('cta')} />
    </div>
  )
}
