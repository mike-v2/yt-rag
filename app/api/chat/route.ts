import { NextRequest, NextResponse } from 'next/server';

import { generateContextualQuery, streamChatResponse } from '@/lib/llm';
import { searchSimilarContent } from '@/lib/vectorSearch';
import {
  formatSourcesAsContext,
  encodeSourcesForHeaders,
} from '@/lib/formatting';

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();
    const recentMessages = messages.slice(-4);

    let contextualQuery = messages[messages.length - 1].content;
    if (recentMessages.length > 1) {
      contextualQuery = await generateContextualQuery(recentMessages);
    }
    const sources = await searchSimilarContent(contextualQuery);
    const context = formatSourcesAsContext(sources);

    const result = await streamChatResponse(recentMessages, context, model);
    const encodedSources = encodeSourcesForHeaders(sources);

    return result.toAIStreamResponse({
      headers: {
        'X-Sources': encodedSources,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
