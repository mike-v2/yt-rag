'use client';

import { useChatWithSources } from '@/hooks/useChatWithSources';
import SourceCard from '@/components/SourceCard';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, sources } =
    useChatWithSources();

  return (
    <div className='grid h-screen grid-cols-12'>
      <div className='col-span-8 flex flex-col bg-gray-50'>
        <div className='flex-grow overflow-y-auto p-8'>
          <div className='flex flex-col gap-4'>
            {messages.map((m) => (
              <div
                key={m.id}
                className='whitespace-pre-wrap rounded-md border p-4'
              >
                <span className='font-bold'>
                  {m.role === 'user' ? 'You: ' : 'Caleb: '}
                </span>
                {m.content}
              </div>
            ))}
          </div>
        </div>

        {error && <div>{error.message}</div>}

        <form onSubmit={handleSubmit} className='bg-white p-4'>
          <input
            className='w-full rounded border border-gray-300 p-2 shadow-xl'
            value={input}
            placeholder='Chat with Caleb...'
            onChange={handleInputChange}
          />
        </form>
      </div>

      <div className='col-span-4 flex flex-col border-l bg-white'>
        <div className='flex-grow overflow-y-auto p-6'>
          <h2 className='mb-4 text-xl font-bold'>Sources</h2>
          {sources.length > 0 ? (
            <div className='flex flex-col gap-4'>
              {sources.map((source, index) => (
                <SourceCard key={index} source={source} />
              ))}
            </div>
          ) : (
            <p className='text-gray-500'>
              Sources will appear here when you ask a question.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
