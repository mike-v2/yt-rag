'use client';

import { format } from 'date-fns';
import { Source } from '@/types';

interface SourceCardProps {
  source: Source;
  onClick: () => void;
  selected: boolean;
}

export default function SourceCard({
  source,
  onClick,
  selected,
}: SourceCardProps) {
  const videoId = source.video_id;
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      className={`w-48 cursor-pointer rounded-lg border bg-white p-2 shadow-sm transition-all hover:shadow-md ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500'
          : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className='flex flex-col gap-2'>
        <img
          src={thumbnailUrl}
          alt={source.title}
          className='h-24 w-full rounded-md object-cover'
        />
        <div className='flex flex-col gap-1'>
          <p className='truncate text-xs font-semibold' title={source.title}>
            {source.title}
          </p>
          <div className='text-xs text-gray-500'>
            <p>{format(new Date(source.published_at), 'MMM d, yyyy')}</p>
            <p>Similarity: {(source.score * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
} 