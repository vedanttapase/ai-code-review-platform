import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

/**
 * Model resolution:
 * - If OPENROUTER_API_KEY is set, use OpenRouter (no credit card needed —
 *   free models available). Override the model with OPENROUTER_MODEL.
 * - Otherwise fall back to the Vercel AI Gateway model string.
 */

const openrouter = process.env.OPENROUTER_API_KEY
  ? createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        'HTTP-Referer': 'https://codesentry.app',
        'X-Title': 'CodeSentry',
      },
    })
  : null

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3.1:free'

export function getReviewModel() {
  if (openrouter) {
    return openrouter.chatModel(OPENROUTER_MODEL)
  }
  // Vercel AI Gateway fallback (requires activated AI Gateway)
  return 'openai/gpt-5-mini'
}

export function isUsingOpenRouter() {
  return openrouter !== null
}
