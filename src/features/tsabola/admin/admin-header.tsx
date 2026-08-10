'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'

import { useContentStore } from '../store/content-store'

import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type Props = {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: Props) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const { content, theme, visibility, setContent } = useContentStore()

  async function handleSave() {
    setStatus('saving')
    try {
      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, theme, visibility }),
      })
      if (res.ok) {
        const saved: { content: SiteContent; theme: ThemeConfig; visibility: SectionVisibility } = await res.json()
        if (saved?.content) setContent(saved.content)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const label =
    status === 'saving' ? 'ინახება...' :
      status === 'saved'  ? 'შენახულია ✓' :
        status === 'error'  ? 'შეცდომა ✗' :
          'მონაცემთა ბაზაში შენახვა'

  const btnClass =
    status === 'saved'  ? 'bg-green-600 text-white' :
      status === 'error'  ? 'bg-red-500 text-white' :
        'bg-wine text-cream hover:bg-wine/90'

  return (
    <div
      className={
        'bg-cream border-b border-border-wine px-3 py-2 sm:px-6 ' +
        'flex flex-col gap-2 md:flex-row md:items-center md:justify-between'
      }
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="მენიუს გახსნა"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-wine/10 md:hidden"
        >
          <Menu className="size-4 text-charcoal/70" />
        </button>
      </div>
      <div className="flex items-center gap-3 pl-9 md:pl-0">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className={`px-4 py-1.5 rounded text-xs font-medium shadow-sm transition-colors duration-200 disabled:opacity-60 ${btnClass}`}
        >
          {label}
        </button>
        {/* Hard reload, not next/link — avoids the Router Cache flashing a pre-save snapshot */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="px-3 py-1.5 rounded border border-wine/30 text-wine text-xs font-medium hover:bg-wine/10 transition-colors duration-200"
        >
          ← საიტზე დაბრუნება
        </a>
      </div>
    </div>
  )
}
