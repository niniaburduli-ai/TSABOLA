'use client'

import { useEffect } from 'react'

import { useContentStore } from '../store/content-store'

import type { SiteContent, SectionVisibility, ThemeConfig } from '../types'

export function useSiteContentSync() {
  const { setContent, setTheme, setVisibility } = useContentStore()

  useEffect(() => {
    fetch('/api/site-content')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) return
        if (data.content) setContent(data.content as SiteContent)
        if (data.theme) setTheme(data.theme as ThemeConfig)
        if (data.visibility) setVisibility(data.visibility as SectionVisibility)
      })
      .catch(() => {})
  }, [setContent, setTheme, setVisibility])
}
