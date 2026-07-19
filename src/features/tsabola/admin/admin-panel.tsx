'use client'

import { useRef, useState } from 'react'

import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'
import { AboutEditor } from './editors/about-editor'
import { ContactEditor } from './editors/contact-editor'
import { FooterEditor } from './editors/footer-editor'
import { GalleryEditor } from './editors/gallery-editor'
import { HeroEditor } from './editors/hero-editor'
import { NewsEditor } from './editors/news-editor'
import { SiteEditor } from './editors/site-editor'
import { WinesEditor } from './editors/wines-editor'
import { ExportReset } from './export-reset'
import { SectionStyleEditor } from './section-style-editor'
import { ThemeEditor } from './theme-editor'
import { VisibilityEditor } from './visibility-editor'
import { useContentStore } from '../store/content-store'

import type { SectionVisibility, SiteContent, ThemeConfig } from '../types'

const EDITOR_MAP: Record<string, React.ComponentType> = {
  site: SiteEditor,
  hero: HeroEditor,
  wines: WinesEditor,
  news: NewsEditor,
  gallery: GalleryEditor,
  about: AboutEditor,
  contact: ContactEditor,
  footer: FooterEditor,
  theme: ThemeEditor,
  sectionStyle: SectionStyleEditor,
  visibility: VisibilityEditor,
  export: ExportReset,
  reset: ExportReset,
}

type Props = {
  initialContent: SiteContent
  initialTheme: ThemeConfig
  initialVisibility: SectionVisibility
}

export function AdminPanel({ initialContent, initialTheme, initialVisibility }: Props) {
  const hydrated = useRef(false)
  if (!hydrated.current) {
    useContentStore.setState({ content: initialContent, theme: initialTheme, visibility: initialVisibility })
    hydrated.current = true
  }

  const [active, setActive] = useState('site')
  const Editor = EDITOR_MAP[active] ?? SiteEditor

  return (
    <div className="force-light-theme flex flex-col h-screen bg-white">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-8">
          <Editor />
        </main>
      </div>
    </div>
  )
}
