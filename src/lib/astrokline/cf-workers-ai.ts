/**
 * Cloudflare Workers AI fallback — called when Gemini fails.
 *
 * Production: uses the AI binding from wrangler.toml ([ai] binding = "AI").
 * Local dev:  binding is not available, throws immediately.
 */

/** Ordered by scoring results: GLM (best tone) → Qwen (best evidence) */
export const CF_FALLBACK_MODELS = [
  '@cf/zai-org/glm-4.7-flash',
  '@cf/qwen/qwen3-30b-a3b-fp8',
] as const;

/**
 * Get the Cloudflare Workers AI binding from the runtime context.
 * Returns null in local dev or if the binding is not configured.
 */
async function getAIBinding(): Promise<any | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext() as { env: { AI?: any } };
    return env?.AI ?? null;
  } catch {
    return null;
  }
}

function stripCodeFences(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

/**
 * Call a Cloudflare Workers AI model and return the raw text response.
 *
 * @throws if the AI binding is unavailable or the model returns empty.
 */
export async function callCfWorkersAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; model?: string }
): Promise<string> {
  const model = options?.model ?? CF_FALLBACK_MODELS[0];
  const maxTokens = options?.maxTokens ?? 4096;

  const ai = await getAIBinding();
  if (!ai) {
    throw new Error('CF Workers AI binding not available (local dev?)');
  }

  const result = await ai.run(model, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  // Chat completion format → text generation format
  const raw: string =
    result?.choices?.[0]?.message?.content
    || result?.response
    || '';

  if (!raw) throw new Error(`CF model ${model} returned empty response`);

  return stripCodeFences(raw);
}

/**
 * Try each CF fallback model in order. Returns parsed JSON or null.
 */
export async function tryCfFallbackModels<T>(
  systemPrompt: string,
  userPrompt: string,
  validator: (_parsed: T) => boolean,
  options?: { maxTokens?: number }
): Promise<T | null> {
  for (const model of CF_FALLBACK_MODELS) {
    try {
      const rawText = await callCfWorkersAI(systemPrompt, userPrompt, {
        maxTokens: options?.maxTokens ?? 8192,
        model,
      });

      let text = rawText;
      // Attempt JSON salvage for truncated responses
      try {
        return JSON.parse(text) as T;
      } catch {
        // Close unclosed strings/braces
        if ((text.match(/"/g) || []).length % 2 !== 0) text += '"';
        text = text.replace(/,\s*$/, '');
        const ob = text.split('{').length - 1;
        const cb = text.split('}').length - 1;
        if (ob > cb) text += '}'.repeat(ob - cb);

        const salvaged = JSON.parse(text) as T;
        if (validator(salvaged)) return salvaged;
      }
    } catch (err) {
      console.error(`CF fallback ${model} failed:`, err);
    }
  }
  return null;
}
