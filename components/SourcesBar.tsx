'use client';

import SourceCard from '@/components/SourceCard';
import { Source } from '@/types';

type SourcesBarProps = {
  sources: Source[];
  selectedSource: Source | null;
  setSelectedSource: (source: Source) => void;
};

export default function SourcesBar({
  sources,
  selectedSource,
  setSelectedSource,
}: SourcesBarProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className='border-b bg-gray-100 p-4'>
      <h2 className='mb-2 text-lg font-semibold'>Sources</h2>
      <div className='flex gap-4 overflow-x-auto p-2'>
        {sources.map((source, index) => (
          <div key={index} className='flex-shrink-0'>
            <SourceCard
              source={source}
              selected={selectedSource?.video_id === source.video_id}
              onClick={() => setSelectedSource(source)}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 