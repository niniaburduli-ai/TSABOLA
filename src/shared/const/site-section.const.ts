import type { SectionKey } from '@/features/tsabola/types'

export const SITE_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'hero', label: 'მთავარი ბანერი' },
  { key: 'wines', label: 'ღვინის კატალოგი' },
  { key: 'news', label: 'სიახლეები' },
  { key: 'gallery', label: 'გალერეა' },
  { key: 'about', label: 'ჩვენ შესახებ' },
  { key: 'contact', label: 'კონტაქტი' },
]

export const SITE_SECTION_KEYS: SectionKey[] = SITE_SECTIONS.map((s) => s.key)
