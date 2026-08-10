import { redirect } from 'next/navigation'
import { type ReactNode } from 'react'

import { auth } from '@/shared/lib/auth'

import type { Metadata } from 'next'

type SessionUser = {
  role?: 'admin' | 'user'
}

export const metadata: Metadata = {
  title: 'Tsabola Admin',
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tsabola Admin',
  },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  const sessionUser = session?.user as SessionUser | undefined

  if (!session) redirect('/sign-in')
  if (sessionUser?.role !== 'admin') redirect('/')

  return <>{children}</>
}
