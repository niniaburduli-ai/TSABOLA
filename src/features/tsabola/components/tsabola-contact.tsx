'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

import { useLang } from '../hooks/use-lang'

// eslint-disable-next-line max-len
const WHATSAPP_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={WHATSAPP_PATH} />
    </svg>
  )
}

export function TsabolaContact() {
  const { t, r } = useLang()

  return (
    <section id="contact" className="relative w-full py-24 px-6 overflow-hidden">
      <Image
        src="https://res.cloudinary.com/dm8ksdiiq/image/upload/v1783260886/tsabola/contact/map.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-cream/55" />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">
          {r(t.contact.subtitle)}
        </p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">
          {r(t.contact.title)}
        </h2>
        <div className="w-12 h-0.5 bg-wine mx-auto mb-12" />

        <div className="flex flex-col gap-6">
          <a
            href={`tel:${t.contact.phone}`}
            className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors"
          >
            <Phone className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.phone}</span>
          </a>
          <a
            href={`https://wa.me/${t.contact.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors"
          >
            <WhatsAppIcon className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.phone}</span>
          </a>
          <a
            href={`https://mail.google.com/mail/?view=cm&to=${t.contact.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors"
          >
            <Mail className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.email}</span>
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Zemo+Khandaki,+Kaspi,+Shida+Kartli,+Georgia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors"
          >
            <MapPin className="size-4 text-wine flex-shrink-0" />
            <span>{r(t.contact.address)}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
