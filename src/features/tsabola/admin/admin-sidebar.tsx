'use client'

import { X } from 'lucide-react'

interface Props {
  active: string
  onSelect: (section: string) => void
  open: boolean
  onClose: () => void
}

const CONTENT_SECTIONS = ['site', 'hero', 'wines', 'news', 'gallery', 'about', 'contact', 'footer'] as const
const APPEARANCE_SECTIONS = ['theme', 'sectionStyle', 'visibility'] as const

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'დაშბორდი',
  site: 'საიტი',
  hero: 'მთავარი ბანერი',
  wines: 'ღვინოები',
  news: 'სიახლეები',
  gallery: 'გალერეა',
  about: 'ჩვენ შესახებ',
  contact: 'კონტაქტი',
  footer: 'ფუტერი',
  theme: 'თემა',
  sectionStyle: 'სექციების სტილი',
  visibility: 'ხილვადობა',
}

export function AdminSidebar({ active, onSelect, open, onClose }: Props) {
  const linkClass = (key: string) =>
    `w-full text-left px-3 py-2 rounded text-sm transition-colors ${
      active === key ? 'bg-wine/10 text-wine font-medium' : 'text-charcoal/70 hover:bg-charcoal/5'
    }`

  function selectAndClose(section: string) {
    onSelect(section)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        aria-label="მენიუს დახურვა"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-charcoal/40 transition-opacity duration-200 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={
          'fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 overflow-y-auto border-r border-border-wine bg-cream ' +
          'transition-transform duration-200 ease-out md:static md:z-auto md:w-60 md:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex items-center justify-between border-b border-border-wine p-4 md:hidden">
          <span className="text-sm font-bold text-charcoal">მენიუ</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="მენიუს დახურვა"
            className="flex h-8 w-8 items-center justify-center rounded text-charcoal/60 hover:text-wine"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">
          <button onClick={() => selectAndClose('dashboard')} className={`${linkClass('dashboard')} mb-4`}>
            {SECTION_LABELS.dashboard}
          </button>

          <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3">კონტენტი</p>
          {CONTENT_SECTIONS.map((s) => (
            <button key={s} onClick={() => selectAndClose(s)} className={linkClass(s)}>
              {SECTION_LABELS[s]}
            </button>
          ))}

          <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3 mt-6">გარეგნობა</p>
          {APPEARANCE_SECTIONS.map((s) => (
            <button key={s} onClick={() => selectAndClose(s)} className={linkClass(s)}>
              {SECTION_LABELS[s]}
            </button>
          ))}

          <div className="mt-6 border-t border-border-wine pt-4">
            <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3">მოქმედებები</p>
            <button onClick={() => selectAndClose('export')} className={linkClass('export')}>
              JSON-ის ექსპორტი
            </button>
            <button onClick={() => selectAndClose('reset')} className={linkClass('reset')}>
              ნაგულისხმევზე დაბრუნება
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
