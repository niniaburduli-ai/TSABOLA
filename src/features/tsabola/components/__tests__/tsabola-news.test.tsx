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

  it('renders an All News link to the news page', () => {
    render(<TsabolaNews />)
    expect(screen.getByRole('link', { name: 'All News' })).toHaveAttribute('href', '/news')
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

  it('links each card to its news detail page by slug', () => {
    render(<TsabolaNews />)
    const link = screen.getByText('2024 ყვავება — ახალი მოსავალი').closest('a')
    expect(link).toHaveAttribute('href', '/news/2024-harvest-new-vintage')
  })

  it('omits unpublished items from the ticker', () => {
    useContentStore.setState({
      content: {
        ...DEFAULT_CONTENT,
        news: {
          ...DEFAULT_CONTENT.news,
          items: [
            { ...DEFAULT_CONTENT.news.items[0], published: false },
            DEFAULT_CONTENT.news.items[1],
          ],
        },
      },
      theme: DEFAULT_THEME,
      visibility: DEFAULT_VISIBILITY,
    })
    render(<TsabolaNews />)
    expect(screen.queryByText('2024 ყვავება — ახალი მოსავალი')).not.toBeInTheDocument()
    expect(screen.getByText('სეზონური ფასდაკლება')).toBeInTheDocument()
  })

  it('renders placeholder when item has no image', () => {
    const { container } = render(<TsabolaNews />)
    const placeholders = container.querySelectorAll('.bg-gradient-to-br')
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
