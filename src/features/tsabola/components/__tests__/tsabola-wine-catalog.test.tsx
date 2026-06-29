import { render, screen } from '@testing-library/react'
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
    expect(screen.getByText('თეთრი ღვინო')).toBeInTheDocument()
    expect(screen.getByText('წითელი ღვინო')).toBeInTheDocument()
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
})
