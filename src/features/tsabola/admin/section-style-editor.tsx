'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import type { SectionKey, TextElementStyle } from '@/features/tsabola/types'
import { SITE_SECTION_ELEMENTS } from '@/shared/const/site-section-elements.const'
import { SITE_SECTIONS } from '@/shared/const/site-section.const'

import { SectionPreview } from './_section-preview'
import { TextElementStyleRow } from './_text-element-style-row'

export function SectionStyleEditor() {
  const { theme, setTheme } = useContentStore()

  const updateElement = (section: SectionKey, elementKey: string, patch: Partial<TextElementStyle>) => {
    const elements = { ...theme.sections[section].elements }
    elements[elementKey] = { ...elements[elementKey], ...patch }
    setTheme({ ...theme, sections: { ...theme.sections, [section]: { elements } } })
  }

  return (
    <div className="max-w-5xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">სექციების სტილი</h2>
      <p className="text-sm text-charcoal/50">
        სექციის ყოველი ცალკეული წარწერის ფერი, ფონტი და ზომა ცალ-ცალკე რეგულირდება.
      </p>

      <div className="space-y-6">
        {SITE_SECTIONS.map(({ key, label }) => (
          <div key={key} className="border border-border-wine rounded p-4">
            <p className="font-medium text-charcoal mb-2">{label}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="divide-y divide-border-wine">
                {SITE_SECTION_ELEMENTS[key].map((el) => (
                  <TextElementStyleRow
                    key={el.key}
                    def={el}
                    theme={theme}
                    style={theme.sections[key].elements[el.key]}
                    onChange={(patch) => updateElement(key, el.key, patch)}
                  />
                ))}
              </div>
              <SectionPreview section={key} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-charcoal/40">ცვლილებები მაშინვე აისახება საიტზე.</p>
    </div>
  )
}
