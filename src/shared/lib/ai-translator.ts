import { OPENROUTER_API_URL, OPENROUTER_MODEL } from '@/shared/const/ai.const';

type OpenRouterResponse = {
  choices?: { message?: { content?: string } }[];
};

class AiTranslator {
  async translate(text: string): Promise<string | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'Translate Georgian text to English. Preserve meaning and formatting. ' +
                'Reply with only the translated text, no notes or quotes.',
            },
            { role: 'user', content: trimmed },
          ],
        }),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) return null;

      return content.trim();
    } catch {
      return null;
    }
  }
}

export const aiTranslator = new AiTranslator();
export { AiTranslator };
