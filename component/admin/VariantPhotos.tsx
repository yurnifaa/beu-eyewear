'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PhotoThumb from '@/component/admin/PhotoThumb';
import { MAX_VARIANT_IMAGES } from '@/lib/admin/product-form';
import { ACCEPTED_IMAGE_TYPES, imageFileError } from '@/lib/storage/image-rules';

export const PRODUCT_IMAGE_ENDPOINT = '/admin/api/product-images';

// How many photos upload at once: enough to feel quick, few enough not to swamp a slow connection.
const UPLOAD_CONCURRENCY = 2;

interface Pending {
  id: number;
  name: string;
  preview: string;
}

export interface VariantPhotosProps {
  images: string[];
  // The product's slug (or '' for a product not saved yet): used only to name the stored files.
  slug: string;
  // Called once per uploaded photo, in the order the files were picked.
  onAdd: (url: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (url: string) => void;
  // +n when n uploads start, -1 each time one finishes, so the form can hold Save until all are done.
  onBusy: (delta: number) => void;
}

async function uploadOne(file: File, slug: string): Promise<{ url: string } | { error: string }> {
  try {
    const body = new FormData();
    body.set('file', file);
    body.set('slug', slug);
    const response = await fetch(PRODUCT_IMAGE_ENDPOINT, { method: 'POST', body });
    const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (response.ok && data?.url) return { url: data.url };
    return { error: data?.error ?? 'We couldn’t upload that photo. Please try again.' };
  } catch {
    return { error: 'We couldn’t upload that photo. Check your connection and try again.' };
  }
}

// The photo set for one color: upload as you pick, reorder (the first photo is the cover) and remove.
export default function VariantPhotos({ images, slug, onAdd, onMove, onRemove, onBusy }: VariantPhotosProps) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const nextId = useRef(1);
  const previews = useRef(new Set<string>());

  // Object URLs hold the file in memory until revoked.
  useEffect(() => {
    const held = previews.current;
    return () => {
      for (const preview of held) URL.revokeObjectURL(preview);
    };
  }, []);

  const slots = MAX_VARIANT_IMAGES - images.length - pending.length;

  const pick = async (picked: File[]) => {
    const issues: string[] = [];
    const accepted: File[] = [];
    for (const file of picked) {
      const problem = imageFileError(file);
      if (problem) issues.push(`${file.name}: ${problem}`);
      else if (accepted.length < slots) accepted.push(file);
      else if (!issues.some((issue) => issue.startsWith('Only'))) issues.push(`Only ${MAX_VARIANT_IMAGES} photos fit on a color, so the rest were skipped.`);
    }
    setProblems(issues);
    if (accepted.length === 0) return;

    const entries = accepted.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { file, pending: { id: nextId.current++, name: file.name, preview } };
    });
    setPending((current) => [...current, ...entries.map((entry) => entry.pending)]);
    onBusy(entries.length);

    // Photos are added in the order they were picked, even if a later one finishes first.
    const results: ({ url: string } | { error: string } | undefined)[] = new Array(entries.length);
    let flushed = 0;
    const flush = () => {
      while (flushed < entries.length && results[flushed]) {
        const result = results[flushed]!;
        const entry = entries[flushed].pending;
        if ('url' in result) onAdd(result.url);
        else setProblems((current) => [...current, `${entry.name}: ${result.error}`]);
        URL.revokeObjectURL(entry.preview);
        previews.current.delete(entry.preview);
        setPending((current) => current.filter((item) => item.id !== entry.id));
        flushed += 1;
      }
    };

    let cursor = 0;
    const worker = async () => {
      while (cursor < entries.length) {
        const index = cursor++;
        results[index] = await uploadOne(entries[index].file, slug);
        onBusy(-1);
        flush();
      }
    };
    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, entries.length) }, worker));
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold">
        Photos for this color{' '}
        <span className="font-normal text-muted-foreground">
          ({images.length} / {MAX_VARIANT_IMAGES}). The first photo is the cover.
        </span>
      </p>

      {(images.length > 0 || pending.length > 0) && (
        <ul className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <li key={url} className="flex flex-col items-start gap-1">
              <div className="relative">
                <PhotoThumb src={url} alt={`Photo ${index + 1}`} />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Move photo ${index + 1} earlier`}
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                  className="grid size-7 place-items-center rounded border border-border disabled:opacity-40"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Move photo ${index + 1} later`}
                  disabled={index === images.length - 1}
                  onClick={() => onMove(index, index + 1)}
                  className="grid size-7 place-items-center rounded border border-border disabled:opacity-40"
                >
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => onRemove(url)} className="px-1 text-xs font-semibold text-red-600">
                  Remove
                </button>
              </div>
            </li>
          ))}
          {pending.map((item) => (
            <li key={item.id} className="flex flex-col items-start gap-1" aria-busy="true">
              <div className="opacity-60">
                <PhotoThumb src={item.preview} alt={`Uploading ${item.name}`} />
              </div>
              <span className="text-xs text-muted-foreground">Uploading…</span>
            </li>
          ))}
        </ul>
      )}

      {images.length === 0 && pending.length === 0 && (
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-800">
          No photos yet. Shoppers will see a placeholder for this color until you add some.
        </p>
      )}

      <input
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        disabled={slots <= 0}
        aria-label="Add photos for this color"
        onChange={(event) => {
          // No `name`, so these files never ride along with the form's save request.
          const input = event.target;
          const picked = Array.from(input.files ?? []);
          input.value = '';
          void pick(picked);
        }}
        className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-semibold"
      />
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP or AVIF, up to 4 MB each. Photos upload as soon as you choose them.
      </p>
      {problems.length > 0 && (
        <ul role="alert" className="text-xs text-red-500">
          {problems.map((problem, index) => (
            <li key={index}>{problem}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Re-exported so the form's cancel/remove paths can share one way of discarding an unsaved upload.
export function discardUploadedPhoto(url: string, { keepalive = false }: { keepalive?: boolean } = {}) {
  void fetch(PRODUCT_IMAGE_ENDPOINT, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    keepalive,
  }).catch(() => {
    // Best-effort: an unused photo left in storage is harmless.
  });
}
