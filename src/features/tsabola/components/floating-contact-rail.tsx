'use client'

import { Facebook, GripVertical, Link2, MessageCircle, Phone } from 'lucide-react'
import { useRef, useState } from 'react'

import { useLang } from '../hooks/use-lang'

import type { PointerEvent as ReactPointerEvent } from 'react'

const MIN_TOP_PERCENT = 8
const MAX_TOP_PERCENT = 92
const DRAG_THRESHOLD_PX = 4

export function FloatingContactRail() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [topPercent, setTopPercent] = useState(50)
  const dragStateRef = useRef({ startY: 0, startTop: 50, dragging: false })

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.origin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStateRef.current = { startY: e.clientY, startTop: topPercent, dragging: false }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current
    const deltaY = e.clientY - drag.startY
    if (Math.abs(deltaY) > DRAG_THRESHOLD_PX) drag.dragging = true
    if (!drag.dragging) return
    const deltaPercent = (deltaY / window.innerHeight) * 100
    const nextTop = Math.min(MAX_TOP_PERCENT, Math.max(MIN_TOP_PERCENT, drag.startTop + deltaPercent))
    setTopPercent(nextTop)
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!dragStateRef.current.dragging) setOpen((prev) => !prev)
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
      className="fixed right-0 z-50 flex items-center"
      style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={`flex flex-col gap-2 rounded-l-xl bg-wine p-2 shadow-lg transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
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
      <button
        type="button"
        aria-label="საკონტაქტო პანელი"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex size-9 flex-shrink-0 cursor-grab touch-none items-center justify-center
          rounded-l-lg bg-wine text-cream shadow-lg active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </button>
    </div>
  )
}
