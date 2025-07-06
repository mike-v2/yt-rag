'use client';

import { useState } from 'react';
import { useChat, type UseChatOptions, type Message } from 'ai/react';
import { Source } from '@/types';

export interface UseChatWithSourcesOptions extends UseChatOptions {
  model?: string;
}

export const useChatWithSources = (options?: UseChatWithSourcesOptions) => {
  const [sources, setSources] = useState<Source[]>([]);
  const {
    append: originalAppend,
    reload: originalReload,
    ...rest
  } = useChat({
    ...options,
    body: {
      ...options?.body,
      model: options?.model,
    },
    onResponse: (response) => {
      options?.onResponse?.(response);
      const sourcesHeader = response.headers.get('X-Sources');
      if (sourcesHeader) {
        const decodedSources = JSON.parse(atob(sourcesHeader));
        setSources(decodedSources);
      }
    },
  });

  const append = async (
    message: Message | Omit<Message, 'id'>,
    chatRequestOptions?: {
      options?: {
        headers?: Record<string, string> | Headers;
        body?: object;
      };
      functions?: any[];
      function_call?: any;
    },
  ) => {
    setSources([]);
    return originalAppend(message, chatRequestOptions);
  };

  const reload = async (chatRequestOptions?: {
    options?: {
      headers?: Record<string, string> | Headers;
      body?: object;
    };
  }) => {
    setSources([]);
    return originalReload(chatRequestOptions);
  };

  return {
    sources,
    append,
    reload,
    ...rest,
  };
}; 