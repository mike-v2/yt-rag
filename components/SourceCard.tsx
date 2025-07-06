'use client';

import { useState } from 'react';
import YouTubePlayer from './YouTubePlayer';
import { Source } from '@/types';

interface SourceCardProps {
  source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Date(source.published_at).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <div className='rounded-lg border bg-white p-4 shadow-md'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>
            <p className='font-semibold'>{source.title}</p>
            <p className='text-gray-500'>Published: {formattedDate}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700'>
            Similarity: {source.score.toFixed(3)}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
          >
            {isExpanded ? 'Hide Snippet' : 'Show Snippet'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className='mt-4'>
          <YouTubePlayer videoId={source.video_id} startTime={source.start_time} />
          <div className='mt-4 rounded-lg border bg-gray-50 p-4'>
            <p className='whitespace-pre-wrap font-mono text-sm'>
              {source.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 