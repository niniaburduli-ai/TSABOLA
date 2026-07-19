'use client'

import { IMAGE_SIZE_SCALE_CLASS } from '@/shared/const/image-size.const'

import { useLang } from '../hooks/use-lang'
import { useTextStyle } from '../hooks/use-text-style'

export function TsabolaAbout() {
  const { t, r } = useLang()
  const eyebrowStyle = useTextStyle('about', 'eyebrow')
  const headingStyle = useTextStyle('about', 'heading')
  const bodyStyle = useTextStyle('about', 'body')
  const paragraphs = r(t.about.body).split('\n\n').filter(Boolean)

  return (
    <section id="about" className="bg-cream dark:bg-charcoal py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p
            style={eyebrowStyle.style}
            className={`font-bold tracking-widest uppercase text-wine mb-6 ${eyebrowStyle.className}`}
          >
            {r(t.nav.about)}
          </p>
          <h2
            style={headingStyle.style}
            className={`font-display font-bold text-charcoal dark:text-cream mb-8 ${headingStyle.className}`}
          >
            {r(t.about.title)}
          </h2>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={bodyStyle.style}
              className={`text-charcoal/70 dark:text-cream/70 leading-relaxed mb-4 ${bodyStyle.className} ${i === 0 ? 'border-l-2 border-wine pl-4' : ''}`}
            >
              {p}
            </p>
          ))}
        </div>

        <div className="aspect-portrait overflow-hidden">
          {t.about.image ? (
            <img
              src={t.about.image}
              alt={r(t.about.imageAlt)}
              className={`w-full h-full object-cover ${IMAGE_SIZE_SCALE_CLASS[t.about.imageSize]}`}
              // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
              style={{ objectPosition: `${t.about.position.x}% ${t.about.position.y}%` }}
            />
          ) : (
            <div
              data-placeholder="true"
              className="w-full h-full bg-gradient-to-b from-wine/20 via-charcoal/10 to-charcoal/30"
            />
          )}
        </div>
      </div>
    </section>
  )
}
