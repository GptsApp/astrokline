import type { GeminiMessage } from '@/lib/astrokline/gemini';

export interface AskChartClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function buildAskChartGeminiMessages(
  clientMessages: AskChartClientMessage[],
  safeQuestion: string
): GeminiMessage[] {
  const recentMessages = clientMessages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
    )
    .slice(-10);

  const latestUserIndex = recentMessages
    .map((message) => message.role)
    .lastIndexOf('user');

  return recentMessages
    .map((message, index) => {
      const text =
        message.role === 'user' && index === latestUserIndex
          ? safeQuestion.trim()
          : message.content.trim();

      if (!text) {
        return null;
      }

      return {
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      } satisfies GeminiMessage;
    })
    .filter((message): message is GeminiMessage => message !== null);
}

export function createAskChartTextResponse(text: string, chatId: string) {
  const response = new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });

  response.headers.set('X-Chat-Id', chatId);

  return response;
}