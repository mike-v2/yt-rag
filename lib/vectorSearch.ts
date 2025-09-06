import pinecone from '@/config/pinecone';
import { Source } from '@/types';

const pineconeIndex = pinecone.index(
  process.env.PINECONE_INDEX!,
  process.env.PINECONE_HOST!,
);
const namespace = pineconeIndex.namespace('default');

interface PineconeHit {
  _id: string;
  _score: number;
  fields: Omit<Source, 'score'>;
}

interface PineconeSearchResponse {
  result?: PineconeSearchResult;
}

interface PineconeSearchResult {
  hits?: PineconeHit[];
}

export async function searchSimilarContent(query: string): Promise<Source[]> {
  try {
    const searchResponse = await namespace.searchRecords({
      query: {
        topK: 15,
        inputs: { text: query },
      },
      fields: ['*'], // Request all metadata fields
    });

    const results = (
      searchResponse as PineconeSearchResponse
    )?.result?.hits?.map((hit: PineconeHit) => ({
      ...hit.fields,
      score: hit._score,
    }));
    if (!results) {
      throw new Error('Search failed');
    }

    return results;
  } catch (error) {
    console.error('Error in searchSimilarContent:', error);
    return [];
  }
}
