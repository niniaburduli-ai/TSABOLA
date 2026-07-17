'use client'


import type { SectionKey } from '@/features/tsabola/types'

import { TsabolaAbout } from '../components/tsabola-about'
import { TsabolaContact } from '../components/tsabola-contact'
import { TsabolaGallery } from '../components/tsabola-gallery'
import { TsabolaHero } from '../components/tsabola-hero'
import { TsabolaNews } from '../components/tsabola-news'
import { TsabolaWineCatalog } from '../components/tsabola-wine-catalog'

import type { JSX } from 'react'

const SECTION_COMPONENT: Record<SectionKey, () => JSX.Element> = {
  hero: TsabolaHero,
  about: TsabolaAbout,
  wines: TsabolaWineCatalog,
  news: TsabolaNews,
  gallery: () => <TsabolaGallery initialImages={[]} />,
  contact: TsabolaContact,
}

type Props = {
  section: SectionKey
}

// Renders the real, live section component — reads the same store the editor writes to,
// so edits show up here immediately without a separate preview data path to keep in sync.
export function SectionPreview({ section }: Props) {
  const Section = SECTION_COMPONENT[section]
  return (
    <div className="h-96 overflow-y-auto border border-border-wine rounded">
      <Section />
    </div>
  )
}
