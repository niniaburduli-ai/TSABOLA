'use client'

interface Props {
  active: string
  onSelect: (section: string) => void
}

const CONTENT_SECTIONS = ['site', 'hero', 'wines', 'news', 'gallery', 'about', 'contact', 'footer'] as const
const APPEARANCE_SECTIONS = ['theme', 'visibility'] as const

export function AdminSidebar({ active, onSelect }: Props) {
  const linkClass = (key: string) =>
    `w-full text-left px-3 py-2 rounded text-sm transition-colors ${
      active === key ? 'bg-wine/10 text-wine font-medium' : 'text-charcoal/70 hover:bg-charcoal/5'
    }`

  return (
    <aside className="w-60 flex-shrink-0 border-r border-border-wine bg-cream h-full overflow-y-auto">
      <div className="p-4">
        <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3">Content</p>
        {CONTENT_SECTIONS.map((s) => (
          <button key={s} onClick={() => onSelect(s)} className={linkClass(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3 mt-6">Appearance</p>
        {APPEARANCE_SECTIONS.map((s) => (
          <button key={s} onClick={() => onSelect(s)} className={linkClass(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div className="mt-6 border-t border-border-wine pt-4">
          <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3">Actions</p>
          <button onClick={() => onSelect('export')} className={linkClass('export')}>
            Export JSON
          </button>
          <button onClick={() => onSelect('reset')} className={linkClass('reset')}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </aside>
  )
}
