'use client'

import { Facebook, Link2, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'

import { useLang } from '../hooks/use-lang'

export function FloatingContactRail() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.origin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const links = [
    { key: 'link', icon: Link2, label: copied ? 'დაკოპირდა' : 'ლინკის კოპირება', onClick: handleCopyLink },
    { key: 'facebook', icon: Facebook, label: 'Facebook', href: t.contact.facebook },
    { key: 'phone', icon: Phone, label: 'დარეკვა', href: `tel:${t.contact.phone}` },
    {
      key: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      href: `https://wa.me/${t.contact.whatsapp.replace(/\D/g, '')}`,
    },
  ]

  return (
    <div
      className="fixed right-0 top-1/2 z-50 -translate-y-1/2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((prev) => !prev)}
    >
      <div
        className={`flex flex-col gap-2 rounded-l-xl bg-wine p-2 shadow-lg transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-[calc(100%-2.25rem)]'
        }`}
      >
        {links.map(({ key, icon: Icon, label, href, onClick }) =>
          href ? (
            <a
              key={key}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={label}
              className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg text-cream transition-colors hover:bg-cream/20"
            >
              <Icon className="size-5" />
            </a>
          ) : (
            <button
              key={key}
              type="button"
              onClick={onClick}
              aria-label={label}
              className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg text-cream transition-colors hover:bg-cream/20"
            >
              <Icon className="size-5" />
            </button>
          )
        )}
      </div>
    </div>
  )
}
