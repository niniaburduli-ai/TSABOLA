import { create } from 'zustand'

type WineLikesStore = {
  counts: Record<string, number>
  likedWineIds: string[]
  setCounts: (counts: Record<string, number>) => void
  setLikedWineIds: (ids: string[]) => void
  toggle: (wineId: string) => void
}

export const useWineLikesStore = create<WineLikesStore>()((set, get) => ({
  counts: {},
  likedWineIds: [],
  setCounts: (counts) => set({ counts }),
  setLikedWineIds: (likedWineIds) => set({ likedWineIds }),
  toggle: (wineId) => {
    const { counts, likedWineIds } = get()
    const isLiked = likedWineIds.includes(wineId)
    const nextLiked = isLiked
      ? likedWineIds.filter((id) => id !== wineId)
      : [...likedWineIds, wineId]
    const current = counts[wineId] ?? 0
    const nextCount = isLiked ? Math.max(0, current - 1) : current + 1
    set({ likedWineIds: nextLiked, counts: { ...counts, [wineId]: nextCount } })
  },
}))
