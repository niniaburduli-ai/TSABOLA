import { beforeEach, describe, expect, it } from 'vitest'

import { useLanguageStore } from '../language-store'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
})

describe('languageStore', () => {
  it('defaults to ka', () => {
    expect(useLanguageStore.getState().lang).toBe('ka')
  })

  it('setLang switches to en', () => {
    useLanguageStore.getState().setLang('en')
    expect(useLanguageStore.getState().lang).toBe('en')
  })

  it('setLang switches back to ka', () => {
    useLanguageStore.getState().setLang('en')
    useLanguageStore.getState().setLang('ka')
    expect(useLanguageStore.getState().lang).toBe('ka')
  })
})
