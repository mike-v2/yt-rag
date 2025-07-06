'use client';

import { Source } from '@/types/source';
import YouTubePlayer from './YouTubePlayer';

export default function SourceDetail({ source }: { source: Source | null }) {
  if (!source) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-gray-500'>
          Click a source above to see its details.
        </p>
      </div>
    );
  }

  const { video_id, title, text, start_time } = source;

  return (
    <div>
      {video_id && <YouTubePlayer videoId={video_id} startTime={start_time} />}
      <h3 className='mb-2 mt-4 text-lg font-bold'>{title}</h3>
      <p className='whitespace-pre-wrap text-sm text-gray-700'>{text}</p>
    </div>
  );
} 