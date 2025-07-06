'use client';

import {
  ChangeEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  useRef,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';

type ChatInputProps = {
  handleSubmit: FormEventHandler<HTMLFormElement>;
  input: string;
  handleInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  useReasoner: boolean;
  setUseReasoner: (value: boolean) => void;
};

export default function ChatInput({
  handleSubmit,
  input,
  handleInputChange,
  useReasoner,
  setUseReasoner,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className='bg-white p-4'>
      <div className='relative'>
        <TextareaAutosize
          className='w-full resize-none rounded border border-gray-300 p-2 shadow-xl'
          value={input}
          placeholder='Chat with Caleb...'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          minRows={1}
          maxRows={5}
        />
      </div>
      <div className='mt-2 flex items-center'>
        <button
          type='button'
          onClick={() => setUseReasoner(!useReasoner)}
          className={`rounded-md px-3 py-1 text-sm transition-colors ${
            useReasoner
              ? 'bg-indigo-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          DeepThink (R1)
        </button>
      </div>
    </form>
  );
} 