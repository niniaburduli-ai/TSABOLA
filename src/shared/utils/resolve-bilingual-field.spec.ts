import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/ai-translator', () => ({
  aiTranslator: { translate: vi.fn() },
}));

import { aiTranslator } from '@/shared/lib/ai-translator';

import { resolveBilingualField } from './resolve-bilingual-field';

describe('resolveBilingualField', () => {
  beforeEach(() => {
    vi.mocked(aiTranslator.translate).mockReset();
  });

  it('no-ops when ka is empty', async () => {
    const result = await resolveBilingualField({ ka: '', en: '' }, undefined);
    expect(result).toEqual({ value: { ka: '', en: '' }, memory: { sourceKa: '', autoEn: '' } });
    expect(aiTranslator.translate).not.toHaveBeenCalled();
  });

  it('translates a fresh field with no prior memory', async () => {
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Hello');
    const result = await resolveBilingualField({ ka: 'გამარჯობა', en: '' }, undefined);
    expect(result).toEqual({
      value: { ka: 'გამარჯობა', en: 'Hello' },
      memory: { sourceKa: 'გამარჯობა', autoEn: 'Hello' },
    });
  });

  it('retranslates when ka changes and en still matches last auto output', async () => {
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Goodbye');
    const result = await resolveBilingualField(
      { ka: 'ნახვამდის', en: 'Hello' },
      { sourceKa: 'გამარჯობა', autoEn: 'Hello' }
    );
    expect(result).toEqual({
      value: { ka: 'ნახვამდის', en: 'Goodbye' },
      memory: { sourceKa: 'ნახვამდის', autoEn: 'Goodbye' },
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
    });
    expect(aiTranslator.translate).not.toHaveBeenCalled();
  });

  it('is a no-op when nothing changed', async () => {
    const memory = { sourceKa: 'გამარჯობა', autoEn: 'Hello' };
    const result = await resolveBilingualField({ ka: 'გამარჯობა', en: 'Hello' }, memory);
    expect(result).toEqual({ value: { ka: 'გამარჯობა', en: 'Hello' }, memory });
    expect(aiTranslator.translate).not.toHaveBeenCalled();
  });

  it('keeps old value and memory unchanged so it retries next time when translation fails', async () => {
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce(null);
    const memory = { sourceKa: 'ძველი', autoEn: 'Old' };
    const result = await resolveBilingualField({ ka: 'ახალი', en: 'Old' }, memory);
    expect(result).toEqual({ value: { ka: 'ახალი', en: 'Old' }, memory });
  });
});
