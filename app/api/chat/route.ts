import { NextRequest, NextResponse } from 'next/server';

import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { format } from 'date-fns';

import { CHAT_INSTRUCTIONS } from '@/constants/prompts';
import { Source } from '@/types';

const openAiClient = new OpenAI();

const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const pcIndex = pinecone.index('openai-1000');
const queryModel = 'deepseek-chat';
const queryTemperature = 0;
const chatTemperature = 0.2;

async function generateContextualQuery(messages: any[]) {
  const joinedMessages = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const result = await generateText({
    model: deepseek(queryModel),
    messages: [
      {
        role: 'system',
        content:
          "Given the recent conversation, generate a detailed search query that captures the context and intent of the user's latest question. The query should be rich in relevant keywords and concepts. Only output the raw search query, without any surrounding text or explanation.",
      },
      {
        role: 'user',
        content: `Recent conversation:\n${joinedMessages}\n\nSearch query:`,
      },
    ],
    temperature: queryTemperature,
  });
  console.log('Contextual query:', result.text);
  return result.text;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();
    const recentMessages = messages.slice(-4);

    let contextualQuery = messages[messages.length - 1].content;
    if (recentMessages.length > 1) {
      contextualQuery = await generateContextualQuery(recentMessages);
    }

    // Generate embedding for the user's message
    const embeddingResponse = await openAiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: contextualQuery,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Query Pinecone
    const queryResponse = await pcIndex.query({
      vector: embedding,
      topK: 8,
      includeMetadata: true,
    });

    const sources: Source[] =
      queryResponse.matches?.map((match) => ({
        ...(match.metadata as Omit<Source, 'score'>),
        score: match.score ?? 0,
      })) ?? [];

    // Combine Pinecone results for context
    const context = sources
      .map((source: Source) => {
        const date = format(new Date(source.published_at), 'MMM d, yyyy');
        return `Date: ${date}\nContent: ${source.text}`;
      })
      .filter(Boolean)
      .join('\n\n---\n\n');

    const chatMessages = [
      {
        role: 'system',
        content: `${CHAT_INSTRUCTIONS} \n\n Context: ${context}`,
      },
      ...recentMessages,
    ];

    const result = await streamText({
      model: deepseek(model || 'deepseek-chat'),
      messages: chatMessages,
      temperature: chatTemperature,
    });

    const sourcesJson = JSON.stringify(sources);
    const encodedSources = Buffer.from(sourcesJson).toString('base64');

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
