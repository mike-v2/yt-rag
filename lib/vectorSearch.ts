import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { Source } from '@/types';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const pcIndex = pinecone.index('openai-1000');

const openAiClient = new OpenAI();

export async function searchSimilarContent(query: string): Promise<Source[]> {
  // Generate embedding for the query
  const embeddingResponse = await openAiClient.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const embedding = embeddingResponse.data[0].embedding;

  // Search Pinecone with the embedding
  const queryResponse = await pcIndex.query({
    vector: embedding,
    topK: 8,
    includeMetadata: true,
  });

  return queryResponse.matches?.map((match) => ({
    ...(match.metadata as Omit<Source, 'score'>),
    score: match.score ?? 0,
  })) ?? [];
}

export { pcIndex }; 