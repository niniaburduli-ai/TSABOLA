import { aiTranslator } from '@/shared/lib/ai-translator';
import type { TranslationMemory } from '@/shared/types/common';

type BilingualValue = { ka: string; en: string };

// Loosely-typed on purpose: Mongoose's InferSchemaType makes nested schema
// fields optional (see how `caption`/`description` are already accessed with
// `?.` + `??` elsewhere in this codebase), so callers passing a Mongoose
// subdocument won't have a strict TranslationMemory to hand us.
type StoredMemory = { sourceKa?: string; autoEn?: string } | undefined;

export async function resolveBilingualField(
  current: BilingualValue,
  memory: StoredMemory
): Promise<{ value: BilingualValue; memory: TranslationMemory; pending: boolean }> {
  const baseline: TranslationMemory = {
    sourceKa: memory?.sourceKa ?? '',
    autoEn: memory?.autoEn ?? '',
  };

  if (!current.ka.trim()) {
    return { value: current, memory: baseline, pending: false };
  }

  if (baseline.autoEn && current.en !== baseline.autoEn) {
    return { value: current, memory: baseline, pending: false };
  }

  if (current.ka === baseline.sourceKa) {
    return { value: current, memory: baseline, pending: false };
  }

  const translated = await aiTranslator.translate(current.ka);
  if (!translated) {
    return { value: current, memory: baseline, pending: true };
  }

  return {
    value: { ka: current.ka, en: translated },
    memory: { sourceKa: current.ka, autoEn: translated },
    pending: false,
  };
}
