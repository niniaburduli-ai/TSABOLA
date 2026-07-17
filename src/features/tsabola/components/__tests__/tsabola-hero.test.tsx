import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaHero } from '../tsabola-hero'

const HERO_IMAGES = [
  { src: '/hero/one.jpg', positionMobile: 'top' as const, positionDesktop: 'center' as const },
  { src: '/hero/two.jpg', positionMobile: 'bottom' as const, positionDesktop: 'top' as const },
  { src: '', positionMobile: 'center' as const, positionDesktop: 'center' as const },
]

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({
    content: { ...DEFAULT_CONTENT, hero: { ...DEFAULT_CONTENT.hero, images: HERO_IMAGES } },
    theme: DEFAULT_THEME,
    visibility: DEFAULT_VISIBILITY,
  })
})

describe('TsabolaHero', () => {
  it('filters out images with an empty src', () => {
    const { container } = render(<TsabolaHero />)
    expect(container.querySelectorAll('img').length).toBe(2)
  })

  it("applies each image's mobile and desktop position classes", () => {
    const { container } = render(<TsabolaHero />)
    const images = container.querySelectorAll('img')
    expect(images[0].className).toContain('object-top')
    expect(images[0].className).toContain('sm:object-center')
    expect(images[1].className).toContain('object-bottom')
    expect(images[1].className).toContain('sm:object-top')
  })

  it('wraps the headline on mobile instead of clipping it', () => {
    render(<TsabolaHero />)
    const headline = screen.getByRole('heading', { level: 1 })
    expect(headline.className.split(' ')).not.toContain('whitespace-nowrap')
    expect(headline.className).toContain('sm:whitespace-nowrap')
  })

  it('opens the lightbox when the hero image is clicked', () => {
    render(<TsabolaHero />)
    fireEvent.click(screen.getByRole('button', { name: 'ფოტოს სრულად ნახვა' }))
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('closes the lightbox when close is clicked', () => {
    render(<TsabolaHero />)
    fireEvent.click(screen.getByRole('button', { name: 'ფოტოს სრულად ნახვა' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('pauses auto-rotate while the lightbox is open', () => {
    vi.useFakeTimers()
    const { container } = render(<TsabolaHero />)
    fireEvent.click(screen.getByRole('button', { name: 'ფოტოს სრულად ნახვა' }))
    vi.advanceTimersByTime(6000)
    const images = container.querySelectorAll('img')
    expect(images[0].parentElement?.className).toContain('opacity-100')
    vi.useRealTimers()
  })
})
