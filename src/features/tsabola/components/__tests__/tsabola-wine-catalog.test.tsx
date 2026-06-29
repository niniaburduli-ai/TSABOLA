import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaWineCatalog } from '../tsabola-wine-catalog'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('TsabolaWineCatalog', () => {
  it('renders all wines', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('თეთრი მშრალი')).toBeInTheDocument()
    expect(screen.getByText('წითელი მშრალი')).toBeInTheDocument()
  })

  it('renders prices', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('30₾')).toBeInTheDocument()
    expect(screen.getByText('50₾')).toBeInTheDocument()
  })

  it('renders type badges in ka', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('თეთრი')).toBeInTheDocument()
    expect(screen.getByText('წითელი')).toBeInTheDocument()
  })

  it('opens lightbox when wine image is clicked', () => {
    render(<TsabolaWineCatalog />)
    const buttons = screen.getAllByRole('button', { name: /თეთრი მშრალი/i })
    fireEvent.click(buttons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/ჩინებულის ჯიშის/)).toBeInTheDocument()
  })

  it('closes lightbox when close button is clicked', () => {
    render(<TsabolaWineCatalog />)
    const imageButtons = screen.getAllByRole('button', { name: /თეთრი მშრალი/i })
    fireEvent.click(imageButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes lightbox on Escape key', () => {
    render(<TsabolaWineCatalog />)
    const imageButtons = screen.getAllByRole('button', { name: /თეთრი მშრალი/i })
    fireEvent.click(imageButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
