'use client';

import { useState } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useChat } from 'ai/react';
import ChatInput from '@/components/ChatInput';
import SourcesBar from '@/components/SourcesBar';
import SourceDetail from '@/components/SourceDetail';
import LoadingIndicator from '@/components/LoadingIndicator';
import { Source } from '@/types';

export default function Chat() {
  const [useReasoner, setUseReasoner] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    data,
    isLoading,
  } = useChat({
    body: {
      model: useReasoner ? 'deepseek-reasoner' : 'deepseek-chat',
    },
  });

  const sourcesData = (data as any)?.find((d: any) => d.sources);
  const sources = sourcesData?.sources ?? [];

  const showLoadingIndicator =
    isLoading && messages[messages.length - 1]?.role === 'user';

  return (
    <div className='grid h-screen grid-cols-12'>
      <div className='col-span-8 flex h-screen flex-col bg-gray-50'>
        <SourcesBar
          sources={sources}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />
        <div className='flex-grow overflow-y-auto p-8'>
          <div className='flex flex-col gap-4'>
            {messages.map((m) => (
              <div
                key={m.id}
                className='prose max-w-none rounded-md border p-4'
              >
                <span className='font-bold'>
                  {m.role === 'user' ? 'You: ' : 'Caleb: '}
                </span>
                <span>
                  {m.role === 'user' ? (
                    m.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  )}
                </span>
              </div>
            ))}
            {showLoadingIndicator && (
              <div className='rounded-md border p-4'>
                <span className='font-bold'>Caleb: </span>
                <LoadingIndicator />
              </div>
            )}
          </div>
        </div>

        {error && <div>{error.message}</div>}

        <ChatInput
          handleSubmit={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          useReasoner={useReasoner}
          setUseReasoner={setUseReasoner}
        />
      </div>

      <div className='col-span-4 h-screen overflow-y-auto border-l p-6'>
        <SourceDetail source={selectedSource} />
      </div>
    </div>
  );
}
