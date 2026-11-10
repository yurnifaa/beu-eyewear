// Shared by the product form (checks before uploading) and the server (the
// authoritative check). No 'server-only' on purpose so both sides can import it.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(IMAGE_EXTENSIONS).join(',');

// Returns an error message, or null when the file is acceptable.
export function imageFileError(file: { type: string; size: number }): string | null {
  if (!(file.type in IMAGE_EXTENSIONS)) return 'Photo must be a JPG, PNG, WebP or AVIF image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Photo must be 4 MB or smaller.';
  return null;
}

const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

// Images uploaded from the admin live in Vercel Blob.
export function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

// next/image only renders local paths and the configured Blob host, so those are the only
// image addresses the catalog accepts.
export function isAllowedImageUrl(value: string): boolean {
  return (value.startsWith('/') && !value.startsWith('//')) || isBlobUrl(value);
}
