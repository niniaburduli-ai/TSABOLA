'use client'

import { useState } from 'react'

import { useContentStore } from '../store/content-store'

import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AdminHeader() {
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
        'bg-charcoal text-cream hover:bg-charcoal/80'

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 font-medium flex items-center justify-between">
      <span>⚠ ლოკალური გარემო — ავტორიზაციის გარეშე</span>
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className={`px-4 py-1.5 text-xs font-medium transition-colors duration-200 disabled:opacity-60 ${btnClass}`}
        >
          {label}
        </button>
        {/* Hard reload, not next/link — avoids the Router Cache flashing a pre-save snapshot */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="underline hover:text-amber-900">
          ← საიტზე დაბრუნება
        </a>
      </div>
    </div>
  )
}
