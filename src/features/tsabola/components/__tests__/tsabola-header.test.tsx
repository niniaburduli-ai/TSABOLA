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
    expect(screen.getByText('ცაბოლა')).toBeInTheDocument()
  })

  it('renders KA and EN buttons', () => {
    render(<TsabolaHeader />)
    expect(screen.getByRole('button', { name: 'KA' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
  })

  it('clicking EN switches language', () => {
    render(<TsabolaHeader />)
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(useLanguageStore.getState().lang).toBe('en')
  })

  it('renders nav links', () => {
    render(<TsabolaHeader />)
    expect(screen.getByText('ღვინოები')).toBeInTheDocument()
  })
})
