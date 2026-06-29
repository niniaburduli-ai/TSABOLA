import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaNews } from '../tsabola-news'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('TsabolaNews', () => {
  it('renders section title', () => {
    render(<TsabolaNews />)
    expect(screen.getByText('სიახლეები')).toBeInTheDocument()
  })

  it('renders all news item titles', () => {
    render(<TsabolaNews />)
    expect(screen.getByText('2024 ყვავება — ახალი მოსავალი')).toBeInTheDocument()
    expect(screen.getByText('სეზონური ფასდაკლება')).toBeInTheDocument()
  })

  it('renders item dates', () => {
    render(<TsabolaNews />)
    expect(screen.getByText('January 2025')).toBeInTheDocument()
    expect(screen.getByText('December 2024')).toBeInTheDocument()
  })

  it('renders placeholder when item has no image', () => {
    render(<TsabolaNews />)
    const placeholders = document.querySelectorAll('[data-placeholder="true"]')
    expect(placeholders.length).toBe(2)
  })

  it('renders img element when item has image path', () => {
    useContentStore.setState({
      content: {
        ...DEFAULT_CONTENT,
        news: {
          ...DEFAULT_CONTENT.news,
          items: [
            { ...DEFAULT_CONTENT.news.items[0], image: '/news/test.jpg' },
          ],
        },
      },
      theme: DEFAULT_THEME,
      visibility: DEFAULT_VISIBILITY,
    })
    render(<TsabolaNews />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/news/test.jpg')
  })
})
