import { OPENROUTER_API_URL, OPENROUTER_FALLBACK_MODEL, OPENROUTER_MODEL } from '@/shared/const/ai.const';

type OpenRouterResponse = {
  choices?: { message?: { content?: string } }[];
};

const REQUEST_TIMEOUT_MS = 15000;
const MAX_ROUNDS = 4;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 8000;
const RATE_LIMIT_MAX_DELAY_MS = 30000;
const MODELS = [OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ModelCallResult = { text: string | null; retryAfterMs?: number };

class AiTranslator {
  private async callModel(model: string, apiKey: string, text: string): Promise<ModelCallResult> {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Translate Georgian text to English. Preserve meaning and formatting. ' +
                'Reply with only the translated text, no notes or quotes.',
            },
            { role: 'user', content: text },
          ],
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : undefined;
        return { text: null, retryAfterMs: retryAfterMs && !Number.isNaN(retryAfterMs) ? retryAfterMs : undefined };
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) return { text: null };

      return { text: content.trim() };
    } catch {
      return { text: null };
    }
  }

  async translate(text: string): Promise<string | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      for (const model of MODELS) {
        const result = await this.callModel(model, apiKey, trimmed);
        if (result.text) return result.text;
        if (result.retryAfterMs) {
          await sleep(Math.min(result.retryAfterMs, RATE_LIMIT_MAX_DELAY_MS));
        }
      }
      if (round < MAX_ROUNDS - 1) {
        await sleep(Math.min(BASE_DELAY_MS * 2 ** round, MAX_DELAY_MS));
      }
    }

    return null;
  }
}

export const aiTranslator = new AiTranslator();
export { AiTranslator };
