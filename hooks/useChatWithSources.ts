'use client';

import { useMemo } from 'react';
import { useChat, type UseChatOptions } from 'ai/react';
import { Source } from '@/components/SourceCard';

export const useChatWithSources = (options?: UseChatOptions) => {
  const { data, ...rest } = useChat(options);

  const sources: Source[] = useMemo(() => {
    if (!data) return [];
    const lastMessage = data[data.length - 1];
    if (typeof lastMessage === 'string') {
      try {
        const parsedData = JSON.parse(lastMessage);
        return parsedData.sources || [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }, [data]);

  return {
    sources,
    ...rest,
  };
}; 