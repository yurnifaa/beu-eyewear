import 'server-only';

import { del, put } from '@vercel/blob';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

// Returns an error message, or null when the file is acceptable.
export function validateImageFile(file: File): string | null {
  if (!(file.type in EXTENSIONS)) return 'Photo must be a JPG, PNG, WebP or AVIF image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Photo must be 4 MB or smaller.';
  return null;
}

export async function uploadProductImage(slug: string, file: File): Promise<string> {
  const blob = await put(`products/${slug}.${EXTENSIONS[file.type]}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}

// Best-effort: an orphaned blob is harmless, but a failed cleanup must never
// turn a saved product into an error.
export async function deleteProductImage(url: string | null | undefined) {
  if (!url) return;
  try {
    await del(url);
  } catch (error) {
    console.error('deleting product image failed', error);
  }
}
