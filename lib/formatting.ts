import { format } from 'date-fns';
import { Source } from '@/types';

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

export function formatSourcesAsContext(sources: Source[]): string {
  return sources
    .map((source: Source) => {
      const date = formatDate(source.published_at);
      return `Date: ${date}\nContent: ${source.text}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}

export function encodeSourcesForHeaders(sources: Source[]): string {
  const sourcesJson = JSON.stringify(sources);
  return Buffer.from(sourcesJson).toString('base64');
} 