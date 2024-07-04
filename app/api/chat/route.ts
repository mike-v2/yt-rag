import { NextRequest, NextResponse } from 'next/server';

import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const openAiClient = new OpenAI();
const pinecone = new Pinecone();
const pcIndex = pinecone.index('openai');

async function generateContextualQuery(messages: any[]) {
  const recentMessages = messages
    .slice(-3)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const result = await generateText({
    model: openai('gpt-3.5-turbo'),
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
    temperature: 0.2,
  });
  return result.text;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const contextualQuery = await generateContextualQuery(messages);
    console.log('Contextual Query:', contextualQuery);

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
      topK: 5,
      includeMetadata: true,
    });

    // Extract relevant context from Pinecone results
    const context = queryResponse.matches
      .map((match) => match.metadata?.text)
      .filter(Boolean)
      .join('\n\n');

    const debugContext = queryResponse.matches
      .map((match) => (match.metadata?.text as string).substring(0, 1000))
      .filter(Boolean)
      .join('\n\n');
    console.log('context: ', debugContext);

    // Prepare messages for the chat model
    const chatMessages = [
      {
        role: 'system',
        content: `${process.env.CHAT_INSTRUCTIONS} \n\n Context: ${context}`,
      },
      ...messages,
    ];

    // Call the language model with streaming
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: chatMessages,
      temperature: 0.2,
      async onFinish({ text, usage, finishReason }) {
        //console.log('Finished:', { text, usage, finishReason });
        // Implement your own logic here, e.g. for storing messages or recording token usage
      },
    });

    // Respond with the stream
    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
