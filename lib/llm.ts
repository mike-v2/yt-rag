import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

import { CHAT_INSTRUCTIONS } from '@/constants/prompts';

export const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const QUERY_TEMPERATURE = 0;
const CHAT_TEMPERATURE = 0.2;

export async function generateContextualQuery(messages: any[]): Promise<string> {
  const joinedMessages = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  const result = await generateText({
    model: deepseek('deepseek-chat'),
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
    temperature: QUERY_TEMPERATURE,
  });
  
  console.log('Contextual query:', result.text);
  return result.text;
}

export async function streamChatResponse(
  messages: any[],
  context: string,
  model: string = 'deepseek-chat'
) {
  const chatMessages = [
    {
      role: 'system',
      content: `${CHAT_INSTRUCTIONS} \n\n Context: ${context}`,
    },
    ...messages,
  ];

  return streamText({
    model: deepseek(model),
    messages: chatMessages,
    temperature: CHAT_TEMPERATURE,
  });
}
