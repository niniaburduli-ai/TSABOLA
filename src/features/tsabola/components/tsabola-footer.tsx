'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaFooter() {
  const { t, r } = useLang()

  return (
    <footer className="bg-wine py-4 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        <p className="text-sm text-black">{r(t.footer.copy)}</p>
      </div>
    </footer>
  )
}
