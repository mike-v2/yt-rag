export default function LoadingIndicator() {
  return (
    <div className='flex items-center gap-2'>
      <div className='h-2 w-2 animate-pulse rounded-full bg-gray-500'></div>
      <div
        className='h-2 w-2 animate-pulse rounded-full bg-gray-500'
        style={{ animationDelay: '0.1s' }}
      ></div>
      <div
        className='h-2 w-2 animate-pulse rounded-full bg-gray-500'
        style={{ animationDelay: '0.2s' }}
      ></div>
    </div>
  );
};