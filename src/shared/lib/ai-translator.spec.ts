import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AiTranslator } from './ai-translator';

const PRIMARY_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
const FALLBACK_MODEL = 'qwen/qwen3-next-80b-a3b-instruct:free';
const ROUND_DELAYS_MS = [1000, 2000, 4000];

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function modelOf(call: unknown[]): string {
  const init = call[1] as RequestInit;
  return JSON.parse(init.body as string).model;
}

async function advanceThroughRounds(promise: Promise<unknown>, rounds: number) {
  for (let i = 0; i < rounds; i++) {
    await vi.advanceTimersByTimeAsync(ROUND_DELAYS_MS[i]);
  }
  return promise;
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
    vi.useRealTimers();
  });

  it('returns translated text on success from the primary model', async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({ choices: [{ message: { content: 'Hello world' } }] })
    );
    const result = await translator.translate('გამარჯობა მსოფლიო');
    expect(result).toBe('Hello world');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-key',
    });
    expect(modelOf(mockFetch.mock.calls[0])).toBe(PRIMARY_MODEL);
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

  it('falls back to the fallback model when the primary model fails', async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse({}, 429))
      .mockResolvedValueOnce(makeResponse({ choices: [{ message: { content: 'Fallback text' } }] }));

    const result = await translator.translate('text');

    expect(result).toBe('Fallback text');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(modelOf(mockFetch.mock.calls[0])).toBe(PRIMARY_MODEL);
    expect(modelOf(mockFetch.mock.calls[1])).toBe(FALLBACK_MODEL);
  });

  it('falls back when the primary model throws (e.g. timeout)', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(makeResponse({ choices: [{ message: { content: 'Fallback text' } }] }));

    const result = await translator.translate('text');

    expect(result).toBe('Fallback text');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries with exponential backoff across rounds when both models keep failing', async () => {
    vi.useFakeTimers();
    mockFetch
      .mockResolvedValueOnce(makeResponse({}, 429)) // round 0: primary
      .mockResolvedValueOnce(makeResponse({}, 503)) // round 0: fallback
      .mockResolvedValueOnce(makeResponse({}, 429)) // round 1: primary
      .mockResolvedValueOnce(makeResponse({ choices: [{ message: { content: 'Retried text' } }] })); // round 1: fallback

    const promise = translator.translate('text');
    const result = await advanceThroughRounds(promise, 2);

    expect(result).toBe('Retried text');
    expect(mockFetch).toHaveBeenCalledTimes(4);
    expect(modelOf(mockFetch.mock.calls[0])).toBe(PRIMARY_MODEL);
    expect(modelOf(mockFetch.mock.calls[1])).toBe(FALLBACK_MODEL);
    expect(modelOf(mockFetch.mock.calls[2])).toBe(PRIMARY_MODEL);
    expect(modelOf(mockFetch.mock.calls[3])).toBe(FALLBACK_MODEL);
  });

  it('returns null when every round and both models fail', async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue(makeResponse({}, 429));

    const promise = translator.translate('text');
    const result = await advanceThroughRounds(promise, 3);

    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(8);
  });

  it('returns null when response has no content', async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue(makeResponse({ choices: [] }));

    const promise = translator.translate('text');
    const result = await advanceThroughRounds(promise, 3);

    expect(result).toBeNull();
  });
});
