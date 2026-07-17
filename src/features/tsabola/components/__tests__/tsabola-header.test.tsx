import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaHeader } from '../tsabola-header'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('TsabolaHeader', () => {
  it('renders site name in ka', () => {
    render(<TsabolaHeader />)
    expect(screen.getByText('ცაბო')).toBeInTheDocument()
  })

  it('renders KA and EN flag buttons', () => {
    render(<TsabolaHeader />)
    expect(screen.getByRole('button', { name: 'ქართული' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('clicking English flag switches language', () => {
    render(<TsabolaHeader />)
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(useLanguageStore.getState().lang).toBe('en')
  })

  it('renders nav links', () => {
    render(<TsabolaHeader />)
    expect(screen.getByText('ღვინოები')).toBeInTheDocument()
  })
})
