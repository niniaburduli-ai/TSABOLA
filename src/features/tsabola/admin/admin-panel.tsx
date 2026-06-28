'use client'

import { useState } from 'react'

import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'
import { FooterEditor } from './editors/footer-editor'
import { HeroEditor } from './editors/hero-editor'
import { SiteEditor } from './editors/site-editor'
import { ExportReset } from './export-reset'

// Stubs for Tasks 12-14
function WinesEditor() { return <div className="p-4 text-sm text-charcoal/60">Wines editor — coming soon</div> }
function GalleryEditor() { return <div className="p-4 text-sm text-charcoal/60">Gallery editor — coming soon</div> }
function AboutEditor() { return <div className="p-4 text-sm text-charcoal/60">About editor — coming soon</div> }
function ContactEditor() { return <div className="p-4 text-sm text-charcoal/60">Contact editor — coming soon</div> }
function ThemeEditor() { return <div className="p-4 text-sm text-charcoal/60">Theme editor — coming soon</div> }
function VisibilityEditor() { return <div className="p-4 text-sm text-charcoal/60">Visibility editor — coming soon</div> }

const EDITOR_MAP: Record<string, React.ComponentType> = {
  site: SiteEditor,
  hero: HeroEditor,
  wines: WinesEditor,
  gallery: GalleryEditor,
  about: AboutEditor,
  contact: ContactEditor,
  footer: FooterEditor,
  theme: ThemeEditor,
  visibility: VisibilityEditor,
  export: ExportReset,
  reset: ExportReset,
}

export function AdminPanel() {
  const [active, setActive] = useState('site')
  const Editor = EDITOR_MAP[active] ?? SiteEditor

  return (
    <div className="flex flex-col h-screen bg-white">
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
