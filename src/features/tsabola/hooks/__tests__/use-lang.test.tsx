import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { useLang, r } from '../use-lang'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('r()', () => {
  it('returns ka string when lang is ka', () => {
    expect(r({ ka: 'ღვინო', en: 'Wine' }, 'ka')).toBe('ღვინო')
  })
  it('returns en string when lang is en', () => {
    expect(r({ ka: 'ღვინო', en: 'Wine' }, 'en')).toBe('Wine')
  })
})

describe('useLang()', () => {
  it('r() partial resolves to ka by default', () => {
    const { result } = renderHook(() => useLang())
    expect(result.current.r({ ka: 'ცაბოლა', en: 'TSABOLA' })).toBe('ცაბოლა')
  })

  it('r() resolves to en after setLang en', () => {
    const { result } = renderHook(() => useLang())
    act(() => result.current.setLang('en'))
    expect(result.current.r({ ka: 'ცაბოლა', en: 'TSABOLA' })).toBe('TSABOLA')
  })

  it('t.site.name.ka is correct', () => {
    const { result } = renderHook(() => useLang())
    expect(result.current.t.site.name.ka).toBe('ცაბო')
  })
})
