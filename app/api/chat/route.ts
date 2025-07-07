import { NextRequest } from 'next/server';
import { StreamData, StreamingTextResponse, streamText } from 'ai';

import { generateContextualQuery } from '@/lib/llm';
import { searchSimilarContent } from '@/lib/vectorSearch';
import { deepseek } from '@/lib/llm';
import { CHAT_INSTRUCTIONS } from '@/constants/prompts';

const CHAT_TEMPERATURE = 0.2;

export async function POST(req: NextRequest) {
  const { messages, model } = await req.json();

  const data = new StreamData();
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const recentMessages = messages.slice(-4);

        let contextualQuery = messages[messages.length - 1].content;
        if (recentMessages.length > 1) {
          contextualQuery = await generateContextualQuery(recentMessages);
        }

        const sources = await searchSimilarContent(contextualQuery);
        const context = sources
          .map((s: any) => `Source (ID: ${s.id}): ${s.text}`)
          .join('\n');

        data.append({ sources } as any);

        const result = await streamText({
          model: deepseek(model),
          system: `${CHAT_INSTRUCTIONS}\n\n${context}`,
          messages: recentMessages,
          temperature: CHAT_TEMPERATURE,
        });

        const aiStream = result.toAIStream();
        const reader = aiStream.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        console.error('Error in stream:', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorPayload = `3:${JSON.stringify(errorMessage)}\n`;
        controller.enqueue(new TextEncoder().encode(errorPayload));
      } finally {
        data.close();
        controller.close();
      }
    },
  });

  return new StreamingTextResponse(stream, {}, data);
}
