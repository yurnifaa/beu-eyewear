import 'server-only';

import { del, put } from '@vercel/blob';
import { IMAGE_EXTENSIONS, imageFileError, isBlobUrl } from '@/lib/storage/image-rules';

export { MAX_IMAGE_BYTES } from '@/lib/storage/image-rules';

// Thrown when no Vercel Blob store is connected, so the admin can be told the
// real reason instead of a generic "try again".
export class BlobNotConfiguredError extends Error {
  constructor() {
    super('BLOB_READ_WRITE_TOKEN is not set');
  }
}

// Returns an error message, or null when the file is acceptable.
export function validateImageFile(file: File): string | null {
  return imageFileError(file);
}

// The longest side a shop photo ever needs: the biggest slot on the site is about 760px wide, so
// 1600px still covers 2x screens.
const MAX_PHOTO_SIDE = 1600;

// Shrinks the upload before it is stored (resize + WebP, honouring the camera's rotation) so the
// image optimiser never has to start from a 4 MB original on a visitor's slow connection. If anything
// goes wrong, or the result isn't actually smaller, the original is stored untouched.
async function optimisePhoto(file: File): Promise<{ body: Buffer | File; contentType: string; extension: string }> {
  const original = { body: file, contentType: file.type, extension: IMAGE_EXTENSIONS[file.type] };
  try {
    const { default: sharp } = await import('sharp');
    const output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: MAX_PHOTO_SIDE, height: MAX_PHOTO_SIDE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return output.length < file.size ? { body: output, contentType: 'image/webp', extension: 'webp' } : original;
  } catch (error) {
    console.error('optimising product image failed, storing the original', error instanceof Error ? error.message : 'unknown error');
    return original;
  }
}

export async function uploadProductImage(slug: string, file: File): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new BlobNotConfiguredError();

  const photo = await optimisePhoto(file);
  const blob = await put(`products/${slug}.${photo.extension}`, photo.body, {
    access: 'public',
    addRandomSuffix: true,
    contentType: photo.contentType,
  });
  return blob.url;
}

// Best-effort: an orphaned blob is harmless, but a failed cleanup must never
// turn a saved product into an error. Only Blob uploads are deleted; images that
// ship with the app under /products are left alone.
export async function deleteProductImage(url: string | null | undefined) {
  if (!url || !isBlobUrl(url)) return;
  try {
    await del(url);
  } catch (error) {
    console.error('deleting product image failed', error);
  }
}
