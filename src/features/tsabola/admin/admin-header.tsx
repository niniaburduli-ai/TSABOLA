'use client'

import Link from 'next/link'

export function AdminHeader() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 font-medium flex items-center justify-between">
      <span>⚠ Local development — no authentication</span>
      <Link href="/" className="underline hover:text-amber-900">
        ← Back to site
      </Link>
    </div>
  )
}
