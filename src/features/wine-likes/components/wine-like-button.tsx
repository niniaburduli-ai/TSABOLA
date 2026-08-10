'use client';

import { Heart } from 'lucide-react';

import { useToggleWineLike } from '@/features/wine-likes/hooks/use-wine-likes';
import { useWineLikesStore } from '@/features/wine-likes/store/wine-likes-store';

type Props = {
  wineId: string;
  className?: string;
};

export function WineLikeButton({ wineId, className = '' }: Props) {
  const count = useWineLikesStore((state) => state.counts[wineId] ?? 0);
  const liked = useWineLikesStore((state) => state.likedWineIds.includes(wineId));
  const toggleLike = useToggleWineLike();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(wineId);
      }}
      aria-label={liked ? 'გულის მოხსნა' : 'დალაიქება'}
      aria-pressed={liked}
      className={[
        'flex items-center gap-1 rounded-full bg-cream/90 dark:bg-charcoal/90 px-2 py-1',
        'text-xs font-semibold text-wine shadow transition-colors hover:bg-cream dark:hover:bg-charcoal',
        className,
      ].join(' ')}
    >
      <Heart className={`size-4 ${liked ? 'fill-wine text-wine' : 'text-wine'}`} />
      <span>{count}</span>
    </button>
  );
}
