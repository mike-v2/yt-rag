import { NextRequest, NextResponse } from 'next/server';

import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const openAiClient = new OpenAI();
const pinecone = new Pinecone();
const pcIndex = pinecone.index('openai-1000');
const queryModel = 'gpt-4o-mini';
const queryTemperature = 0;
const chatModel = 'gpt-4o-mini';
const chatTemperature = 0.2;

async function generateContextualQuery(messages: any[]) {
  const recentMessages = messages
    .slice(-3)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const result = await generateText({
    model: openai(queryModel),
    messages: [
      {
        role: 'system',
        content:
          "Given the recent conversation, generate a detailed search query that captures the context and intent of the user's latest question. The query should be rich in relevant keywords and concepts.",
      },
      {
        role: 'user',
        content: `Recent conversation:\n${recentMessages}\n\n
          Generate a search query based on this conversation.`,
      },
    ],
    temperature: queryTemperature,
  });
  return result.text;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const contextualQuery = await generateContextualQuery(messages);

    // Generate embedding for the user's message
    const embeddingResponse = await openAiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: contextualQuery,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Query Pinecone
    //TODO use relevance score and/or restrict max tokens
    const queryResponse = await pcIndex.query({
      vector: embedding,
      topK: 8,
      includeMetadata: true,
    });

    // Combine Pinecone results
    const context = queryResponse.matches
      .map((match) => match.metadata?.text)
      .filter(Boolean)
      .join('\n\n');

    const chatMessages = [
      {
        role: 'system',
        content: `${process.env.CHAT_INSTRUCTIONS} \n\n Context: ${context}`,
      },
      ...messages,
    ];

    const result = await streamText({
      model: openai(chatModel),
      messages: chatMessages,
      temperature: chatTemperature,
      /* async onFinish({ text, usage, finishReason }) {
        console.log('Finished:', { text, usage, finishReason });
        // Implement your own logic here, e.g. for storing messages or recording token usage
      }, */
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
