import { enqueueTranslation } from '@/features/translation-queue/service/translation-queue.service';
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import type { HeroImage, NewsItem, SiteContent } from '@/features/tsabola/types';
import { ServiceResult, TranslationMemory } from '@/shared/types/common';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';
import { slugify } from '@/shared/utils/slugify';

type PendingTranslation = { path: string; sourceKa: string };

type SiteContentPayload = { content: unknown; theme: unknown; visibility: unknown };

function normalizeNewsItem(item: NewsItem): NewsItem {
  const fallbackSlug = slugify(item.title?.en ?? '') || slugify(item.title?.ka ?? '') || item.id;
  return { ...item, slug: item.slug || fallbackSlug, published: item.published ?? true };
}

function normalizeHeroImage(image: unknown): HeroImage {
  if (typeof image === 'string') {
    return { src: image, positionMobile: 'top', positionDesktop: 'top' };
  }
  return image as HeroImage;
}

function normalizeContent(content: SiteContent): SiteContent {
  return {
    ...content,
    hero: { ...content.hero, images: content.hero.images.map(normalizeHeroImage) },
    news: { ...content.news, items: content.news.items.map(normalizeNewsItem) },
  };
}

function isBilingualValue(node: unknown): node is { ka: string; en: string } {
  if (typeof node !== 'object' || node === null) return false;
  const candidate = node as { ka?: unknown; en?: unknown };
  return typeof candidate.ka === 'string' && typeof candidate.en === 'string';
}

function isItemWithId(node: unknown): node is { id: string } {
  if (typeof node !== 'object' || node === null) return false;
  return typeof (node as { id?: unknown }).id === 'string';
}

async function resolveBilingualTree(
  node: unknown,
  prevNode: unknown,
  memory: Record<string, TranslationMemory>,
  path: string,
  pending: PendingTranslation[]
): Promise<unknown> {
  if (isBilingualValue(node)) {
    const baseline =
      memory[path] ?? (isBilingualValue(prevNode) ? { sourceKa: prevNode.ka, autoEn: prevNode.en } : undefined);
    const resolved = await resolveBilingualField(node, baseline);
    memory[path] = resolved.memory;
    if (resolved.pending) pending.push({ path, sourceKa: resolved.value.ka });
    return resolved.value;
  }

  if (Array.isArray(node)) {
    const prevArr = Array.isArray(prevNode) ? prevNode : [];
    const resolved: unknown[] = [];
    for (let i = 0; i < node.length; i++) {
      const item = node[i];
      const key = isItemWithId(item) ? item.id : String(i);
      const prevItem = isItemWithId(item) ? prevArr.find((p) => isItemWithId(p) && p.id === item.id) : prevArr[i];
      resolved.push(await resolveBilingualTree(item, prevItem, memory, `${path}.${key}`, pending));
    }
    return resolved;
  }

  if (typeof node === 'object' && node !== null) {
    const source = node as Record<string, unknown>;
    const prevSource = typeof prevNode === 'object' && prevNode !== null ? (prevNode as Record<string, unknown>) : {};
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      result[key] = await resolveBilingualTree(
        source[key],
        prevSource[key],
        memory,
        path ? `${path}.${key}` : key,
        pending
      );
    }
    return result;
  }

  return node;
}

export async function getSiteContent(): Promise<ServiceResult<SiteContentPayload>> {
  const doc = await siteContentRepository.findOne();
  if (!doc) {
    return {
      data: { content: normalizeContent(DEFAULT_CONTENT), theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY },
      status: 200,
    };
  }
  return {
    data: {
      content: normalizeContent(doc.content as SiteContent),
      theme: doc.theme,
      visibility: doc.visibility,
    },
    status: 200,
  };
}

export async function saveSiteContent(
  data: SiteContentPayload
): Promise<ServiceResult<SiteContentPayload>> {
  const existing = await siteContentRepository.findOne();
  const memory: Record<string, TranslationMemory> = {
    ...((existing?.translationMemory as Record<string, TranslationMemory> | undefined) ?? {}),
  };

  const pending: PendingTranslation[] = [];
  const content = (await resolveBilingualTree(data.content, existing?.content, memory, '', pending)) as SiteContent;
  const resolved = { content, theme: data.theme, visibility: data.visibility };

  await siteContentRepository.upsert({ ...resolved, translationMemory: memory });

  for (const item of pending) {
    await enqueueTranslation('site-content', 'tsabola', item.path, item.sourceKa);
  }

  return { data: resolved, status: 200 };
}
