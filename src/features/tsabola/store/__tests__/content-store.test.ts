import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../content-store'

beforeEach(() => {
  useContentStore.setState({
    content: DEFAULT_CONTENT,
    theme: DEFAULT_THEME,
    visibility: DEFAULT_VISIBILITY,
  })
})

describe('contentStore', () => {
  it('initializes with default content', () => {
    expect(useContentStore.getState().content.site.name.ka).toBe('ცაბოლა')
  })

  it('updateSection updates a top-level key', () => {
    const newSite = { name: { ka: 'ახალი', en: 'New' }, slogan: { ka: 'ა', en: 'b' } }
    useContentStore.getState().updateSection('site', newSite)
    expect(useContentStore.getState().content.site.name.ka).toBe('ახალი')
  })

  it('setTheme updates theme config', () => {
    useContentStore.getState().setTheme({ ...DEFAULT_THEME, colorWine: '#FF0000' })
    expect(useContentStore.getState().theme.colorWine).toBe('#FF0000')
  })

  it('setVisibility toggles section', () => {
    useContentStore.getState().setVisibility({ ...DEFAULT_VISIBILITY, hero: false })
    expect(useContentStore.getState().visibility.hero).toBe(false)
  })

  it('resetToDefaults restores defaults', () => {
    useContentStore.getState().setTheme({ ...DEFAULT_THEME, colorWine: '#FF0000' })
    useContentStore.getState().resetToDefaults()
    expect(useContentStore.getState().theme.colorWine).toBe('#722F37')
  })
})
