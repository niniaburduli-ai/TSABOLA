import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { translationQueueRepository } from '@/features/translation-queue/repository/translation-queue.repository';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import { aiTranslator } from '@/shared/lib/ai-translator';
import { TranslationMemory } from '@/shared/types/common';
import { getAtPath, setAtPath } from '@/shared/utils/json-path';

export type TranslationQueueFeature = 'gallery' | 'site-content';

const BASE_BACKOFF_MS = 60_000;
const MAX_BACKOFF_MS = 60 * 60_000;

function nextBackoff(attempts: number): Date {
  const delay = Math.min(BASE_BACKOFF_MS * 2 ** attempts, MAX_BACKOFF_MS);
  return new Date(Date.now() + delay);
}

export async function enqueueTranslation(
  feature: TranslationQueueFeature,
  targetId: string,
  path: string,
  sourceKa: string
): Promise<void> {
  await translationQueueRepository.upsertPending({ feature, targetId, path, sourceKa });
}

async function applyGalleryTranslation(
  targetId: string,
  path: string,
  sourceKa: string,
  translated: string
): Promise<boolean> {
  const existing = await galleryRepository.findById(targetId);
  if (!existing) return false;

  if (path === 'caption' && existing.caption?.ka === sourceKa) {
    await galleryRepository.updateById(targetId, {
      caption: { ka: sourceKa, en: translated },
      captionTranslation: { sourceKa, autoEn: translated },
    });
    return true;
  }

  if (path === 'description' && existing.description?.ka === sourceKa) {
    await galleryRepository.updateById(targetId, {
      description: { ka: sourceKa, en: translated },
      descriptionTranslation: { sourceKa, autoEn: translated },
    });
    return true;
  }

  return false;
}

async function applySiteContentTranslation(
  path: string,
  sourceKa: string,
  translated: string
): Promise<boolean> {
  const doc = await siteContentRepository.findOne();
  if (!doc) return false;

  const content = doc.content as Record<string, unknown>;
  const leaf = getAtPath(content, path) as { ka?: unknown; en?: unknown } | undefined;
  if (typeof leaf?.ka !== 'string' || leaf.ka !== sourceKa) return false;

  setAtPath(content, path, { ka: sourceKa, en: translated });

  const memory: Record<string, TranslationMemory> = {
    ...((doc.translationMemory as Record<string, TranslationMemory> | undefined) ?? {}),
  };
  memory[path] = { sourceKa, autoEn: translated };

  await siteContentRepository.upsert({
    content,
    theme: doc.theme,
    visibility: doc.visibility,
    translationMemory: memory,
  });
  return true;
}

export type ProcessQueueResult = {
  processed: number;
  succeeded: number;
  rescheduled: number;
  dropped: number;
};

export async function processTranslationQueue(): Promise<ProcessQueueResult> {
  const due = await translationQueueRepository.findDue(new Date());
  const result: ProcessQueueResult = { processed: due.length, succeeded: 0, rescheduled: 0, dropped: 0 };

  for (const item of due) {
    let translated: string | null = null;
    try {
      translated = await aiTranslator.translate(item.sourceKa);
    } catch {
      translated = null;
    }

    if (!translated) {
      await translationQueueRepository.reschedule(
        item._id.toString(),
        item.attempts + 1,
        nextBackoff(item.attempts + 1)
      );
      result.rescheduled++;
      continue;
    }

    const applied =
      item.feature === 'gallery'
        ? await applyGalleryTranslation(item.targetId, item.path, item.sourceKa, translated)
        : await applySiteContentTranslation(item.path, item.sourceKa, translated);

    await translationQueueRepository.deleteById(item._id.toString());
    if (applied) result.succeeded++;
    else result.dropped++;
  }

  return result;
}
