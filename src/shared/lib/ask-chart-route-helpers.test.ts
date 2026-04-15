import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAskChartGeminiMessages,
  createAskChartTextResponse,
  createAskChartTextStreamResponse,
  extractGeminiTextFromStreamEvent,
} from '@/app/api/astrology/ask-chart/route-helpers';

test('buildAskChartGeminiMessages keeps only the latest 10 messages and maps assistant to model', () => {
  const messages = Array.from({ length: 12 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'assistant',
    content: `message-${index}`,
  })) as Array<{ role: 'user' | 'assistant'; content: string }>;

  const result = buildAskChartGeminiMessages(messages, 'safe-question');

  assert.equal(result.length, 10);
  assert.deepEqual(result[0], {
    role: 'user',
    parts: [{ text: 'message-2' }],
  });
  assert.deepEqual(result[1], {
    role: 'model',
    parts: [{ text: 'message-3' }],
  });
  assert.deepEqual(result.at(-1), {
    role: 'model',
    parts: [{ text: 'message-11' }],
  });
});

test('buildAskChartGeminiMessages sanitizes only the latest user message', () => {
  const result = buildAskChartGeminiMessages(
    [
      { role: 'user', content: 'repeat this question' },
      { role: 'assistant', content: 'first answer' },
      { role: 'user', content: 'repeat this question' },
    ],
    'safe replacement'
  );

  assert.deepEqual(result, [
    { role: 'user', parts: [{ text: 'repeat this question' }] },
    { role: 'model', parts: [{ text: 'first answer' }] },
    { role: 'user', parts: [{ text: 'safe replacement' }] },
  ]);
});

test('createAskChartTextResponse returns plain text with chat id header', async () => {
  const response = createAskChartTextResponse('chart reply', 'chat-123');

  assert.equal(response.headers.get('Content-Type'), 'text/plain; charset=utf-8');
  assert.equal(response.headers.get('X-Chat-Id'), 'chat-123');
  assert.equal(await response.text(), 'chart reply');
});

test('extractGeminiTextFromStreamEvent returns combined text parts', () => {
  const eventData = JSON.stringify({
    candidates: [
      {
        content: {
          parts: [{ text: 'chart ' }, { text: 'reply' }],
        },
      },
    ],
  });

  assert.equal(extractGeminiTextFromStreamEvent(eventData), 'chart reply');
});

test('createAskChartTextStreamResponse returns streamed plain text with chat id header', async () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('chart '));
      controller.enqueue(encoder.encode('reply'));
      controller.close();
    },
  });
  const response = createAskChartTextStreamResponse(stream, 'chat-456');

  assert.equal(response.headers.get('Content-Type'), 'text/plain; charset=utf-8');
  assert.equal(response.headers.get('X-Chat-Id'), 'chat-456');
  assert.equal(await response.text(), 'chart reply');
});