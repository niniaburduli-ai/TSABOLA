import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaHero } from '../tsabola-hero'

const HERO_IMAGES = [
  { src: '/hero/one.jpg', positionMobile: { x: 50, y: 0 }, positionDesktop: { x: 50, y: 50 }, size: 'md' as const },
  { src: '/hero/two.jpg', positionMobile: { x: 50, y: 100 }, positionDesktop: { x: 50, y: 0 }, size: 'lg' as const },
  { src: '', positionMobile: { x: 50, y: 50 }, positionDesktop: { x: 50, y: 50 }, size: 'md' as const },
]

function mockDesktopViewport(isDesktop: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: isDesktop,
    addEventListener: () => {},
    removeEventListener: () => {},
  })
}

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

  it('applies each image mobile focal point as inline object-position', () => {
    mockDesktopViewport(false)
    const { container } = render(<TsabolaHero />)
    const images = container.querySelectorAll('img')
    expect(images[0].style.objectPosition).toBe('50% 0%')
    expect(images[1].style.objectPosition).toBe('50% 100%')
  })

  it('applies each image desktop focal point as inline object-position', () => {
    mockDesktopViewport(true)
    const { container } = render(<TsabolaHero />)
    const images = container.querySelectorAll('img')
    expect(images[0].style.objectPosition).toBe('50% 50%')
    expect(images[1].style.objectPosition).toBe('50% 0%')
  })

  it("applies each image's zoom scale class", () => {
    const { container } = render(<TsabolaHero />)
    const images = container.querySelectorAll('img')
    expect(images[0].className).toContain('scale-110')
    expect(images[1].className).toContain('scale-125')
  })

  it('wraps the headline instead of clipping it', () => {
    render(<TsabolaHero />)
    const headline = screen.getByRole('heading', { level: 1 })
    expect(headline.className.split(' ')).not.toContain('whitespace-nowrap')
    expect(headline.className).toContain('text-balance')
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
