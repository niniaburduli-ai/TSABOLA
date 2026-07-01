import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AiTranslator } from './ai-translator';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('AiTranslator', () => {
  let translator: AiTranslator;

  beforeEach(() => {
    translator = new AiTranslator();
    mockFetch.mockReset();
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns translated text on success', async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({ choices: [{ message: { content: 'Hello world' } }] })
    );
    const result = await translator.translate('გამარჯობა მსოფლიო');
    expect(result).toBe('Hello world');
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-key',
    });
  });

  it('returns null when API key is missing', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    const result = await translator.translate('text');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns null for empty input without calling fetch', async () => {
    const result = await translator.translate('   ');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns null on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, 500));
    const result = await translator.translate('text');
    expect(result).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    const result = await translator.translate('text');
    expect(result).toBeNull();
  });

  it('returns null when response has no content', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ choices: [] }));
    const result = await translator.translate('text');
    expect(result).toBeNull();
  });
});
