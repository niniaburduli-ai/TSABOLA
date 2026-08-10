import { beforeEach, describe, expect, it } from 'vitest'

import { useWineLikesStore } from './wine-likes-store'

beforeEach(() => {
  useWineLikesStore.setState({ counts: {}, likedWineIds: [] })
})

describe('useWineLikesStore', () => {
  it('setCounts replaces the counts map', () => {
    useWineLikesStore.getState().setCounts({ 'wine-1': 2 })
    expect(useWineLikesStore.getState().counts).toEqual({ 'wine-1': 2 })
  })

  it('toggle adds the wineId and increments its count when not liked', () => {
    useWineLikesStore.setState({ counts: { 'wine-1': 2 }, likedWineIds: [] })
    useWineLikesStore.getState().toggle('wine-1')
    const state = useWineLikesStore.getState()
    expect(state.likedWineIds).toEqual(['wine-1'])
    expect(state.counts['wine-1']).toBe(3)
  })

  it('toggle removes the wineId and decrements its count when already liked', () => {
    useWineLikesStore.setState({ counts: { 'wine-1': 2 }, likedWineIds: ['wine-1'] })
    useWineLikesStore.getState().toggle('wine-1')
    const state = useWineLikesStore.getState()
    expect(state.likedWineIds).toEqual([])
    expect(state.counts['wine-1']).toBe(1)
  })

  it('toggle never takes a count below 0', () => {
    useWineLikesStore.setState({ counts: { 'wine-1': 0 }, likedWineIds: ['wine-1'] })
    useWineLikesStore.getState().toggle('wine-1')
    expect(useWineLikesStore.getState().counts['wine-1']).toBe(0)
  })
})
