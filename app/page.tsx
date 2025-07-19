'use client';

import { useState, useRef, useEffect } from 'react';

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
  const sourceDetailRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (selectedSource && sourceDetailRef.current && window.innerWidth < 1024) {
      sourceDetailRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [selectedSource]);

  return (
    <div className='flex flex-col lg:grid lg:h-screen lg:grid-cols-12'>
      {/* Main chat area */}
      <div className='flex h-full flex-col bg-gray-50 lg:col-span-8 lg:h-screen'>
        <SourcesBar
          sources={sources}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />
        <div className='flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8'>
          <div className='flex flex-col gap-4'>
            {messages.map((m) => (
              <div
                key={m.id}
                className='prose max-w-none rounded-md border p-3 sm:p-4'
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
              <div className='rounded-md border p-3 sm:p-4'>
                <span className='font-bold'>Caleb: </span>
                <LoadingIndicator />
              </div>
            )}
          </div>
        </div>

        {error && <div className='p-4'>{error.message}</div>}

        <ChatInput
          handleSubmit={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          useReasoner={useReasoner}
          setUseReasoner={setUseReasoner}
        />
      </div>

      {/* Source detail sidebar */}
      <div
        ref={sourceDetailRef}
        className='h-full overflow-y-auto border-t p-4 sm:p-6 lg:col-span-4 lg:h-screen lg:border-l lg:border-t-0'
      >
        <SourceDetail source={selectedSource} />
      </div>
    </div>
  );
}
