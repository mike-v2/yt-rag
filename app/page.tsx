'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat();
  return (
    <div className='mx-auto flex w-full max-w-xl flex-col gap-4 py-24'>
      {messages.map((m) => (
        <div key={m.id} className='whitespace-pre-wrap rounded-md border p-4'>
          <span className='font-bold'>
            {m.role === 'user' ? 'You: ' : 'Caleb: '}
          </span>
          {m.content}
        </div>
      ))}

      {error && <div>{error.message}</div>}

      <form onSubmit={handleSubmit}>
        <input
          className='fixed bottom-0 mb-8 w-full max-w-md rounded border border-gray-300 p-2 shadow-xl'
          value={input}
          placeholder='Chat with Caleb...'
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
