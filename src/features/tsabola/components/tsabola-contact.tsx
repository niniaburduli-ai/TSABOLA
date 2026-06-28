'use client'

import { Mail, Phone, MapPin } from 'lucide-react'

import { useLang } from '../hooks/use-lang'

export function TsabolaContact() {
  const { t, r } = useLang()

  return (
    <section id="contact" className="bg-white py-24 px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">
          {r(t.contact.subtitle)}
        </p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">
          {r(t.contact.title)}
        </h2>
        <div className="w-12 h-0.5 bg-wine mx-auto mb-12" />

        <div className="flex flex-col gap-6">
          <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors">
            <Mail className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.email}</span>
          </a>
          <a href={`tel:${t.contact.phone}`} className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors">
            <Phone className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.phone}</span>
          </a>
          <div className="flex items-center gap-3 justify-center text-charcoal/70">
            <MapPin className="size-4 text-wine flex-shrink-0" />
            <span>{r(t.contact.address)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
