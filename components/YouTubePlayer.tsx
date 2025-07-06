'use client';

interface YouTubePlayerProps {
  videoId: string;
  startTime: number;
}

export default function YouTubePlayer({
  videoId,
  startTime,
}: YouTubePlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(
    startTime,
  )}&autoplay=1`;

  return (
    <div className='relative h-0 pb-[56.25%]'>
      <iframe
        className='absolute left-0 top-0 h-full w-full'
        src={embedUrl}
        title='YouTube video player'
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      ></iframe>
    </div>
  );
} 