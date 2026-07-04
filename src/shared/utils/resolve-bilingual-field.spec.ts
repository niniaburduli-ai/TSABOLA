import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/ai-translator', () => ({
  aiTranslator: { translateOnce: vi.fn() },
}));

import { aiTranslator } from '@/shared/lib/ai-translator';

import { resolveBilingualField } from './resolve-bilingual-field';

describe('resolveBilingualField', () => {
  beforeEach(() => {
    vi.mocked(aiTranslator.translateOnce).mockReset();
  });

  it('no-ops when ka is empty', async () => {
    const result = await resolveBilingualField({ ka: '', en: '' }, undefined);
    expect(result).toEqual({ value: { ka: '', en: '' }, memory: { sourceKa: '', autoEn: '' }, pending: false });
    expect(aiTranslator.translateOnce).not.toHaveBeenCalled();
  });

  it('translates a fresh field with no prior memory', async () => {
    vi.mocked(aiTranslator.translateOnce).mockResolvedValueOnce('Hello');
    const result = await resolveBilingualField({ ka: 'გამარჯობა', en: '' }, undefined);
    expect(result).toEqual({
      value: { ka: 'გამარჯობა', en: 'Hello' },
      memory: { sourceKa: 'გამარჯობა', autoEn: 'Hello' },
      pending: false,
    });
  });

  it('retranslates when ka changes and en still matches last auto output', async () => {
    vi.mocked(aiTranslator.translateOnce).mockResolvedValueOnce('Goodbye');
    const result = await resolveBilingualField(
      { ka: 'ნახვამდის', en: 'Hello' },
      { sourceKa: 'გამარჯობა', autoEn: 'Hello' }
    );
    expect(result).toEqual({
      value: { ka: 'ნახვამდის', en: 'Goodbye' },
      memory: { sourceKa: 'ნახვამდის', autoEn: 'Goodbye' },
      pending: false,
    });
  });

  it('never overwrites a manually edited en, even if ka changed', async () => {
    const result = await resolveBilingualField(
      { ka: 'ნახვამდის', en: 'Manually written English' },
      { sourceKa: 'გამარჯობა', autoEn: 'Hello' }
    );
    expect(result).toEqual({
      value: { ka: 'ნახვამდის', en: 'Manually written English' },
      memory: { sourceKa: 'გამარჯობა', autoEn: 'Hello' },
      pending: false,
    });
    expect(aiTranslator.translateOnce).not.toHaveBeenCalled();
  });

  it('is a no-op when nothing changed', async () => {
    const memory = { sourceKa: 'გამარჯობა', autoEn: 'Hello' };
    const result = await resolveBilingualField({ ka: 'გამარჯობა', en: 'Hello' }, memory);
    expect(result).toEqual({ value: { ka: 'გამარჯობა', en: 'Hello' }, memory, pending: false });
    expect(aiTranslator.translateOnce).not.toHaveBeenCalled();
  });

  it('marks the field pending and keeps the old value when translation fails', async () => {
    vi.mocked(aiTranslator.translateOnce).mockResolvedValueOnce(null);
    const memory = { sourceKa: 'ძველი', autoEn: 'Old' };
    const result = await resolveBilingualField({ ka: 'ახალი', en: 'Old' }, memory);
    expect(result).toEqual({ value: { ka: 'ახალი', en: 'Old' }, memory, pending: true });
  });

  it('translates stale seed content that predates any translation memory', async () => {
    vi.mocked(aiTranslator.translateOnce).mockResolvedValueOnce('New harvest');
    const result = await resolveBilingualField(
      { ka: 'ახალი მოსავალი', en: '2024 Harvest — New Vintage' },
      undefined
    );
    expect(result).toEqual({
      value: { ka: 'ახალი მოსავალი', en: 'New harvest' },
      memory: { sourceKa: 'ახალი მოსავალი', autoEn: 'New harvest' },
      pending: false,
    });
  });
});
