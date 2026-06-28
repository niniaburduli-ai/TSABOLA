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
  it('renders all 4 wines', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('რქაწითელი')).toBeInTheDocument()
    expect(screen.getByText('საფერავი')).toBeInTheDocument()
    expect(screen.getByText('მწვანე')).toBeInTheDocument()
    expect(screen.getByText('კახური როზე')).toBeInTheDocument()
  })

  it('renders prices', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('45₾')).toBeInTheDocument()
    expect(screen.getByText('55₾')).toBeInTheDocument()
  })

  it('renders type badges in ka', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('ანბერი')).toBeInTheDocument()
    expect(screen.getByText('წითელი')).toBeInTheDocument()
  })
})
