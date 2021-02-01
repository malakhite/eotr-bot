import { URL } from 'url';

export function extractUrl(input: string) {
  const urlPattern = /((http|https):\/\/[^\s]+)/gm;
  const matches = input.match(urlPattern);
  if (Array.isArray(matches)) {
    return matches.map((url) => new URL(url));
  }
  throw new Error('No URLs identified');
}
