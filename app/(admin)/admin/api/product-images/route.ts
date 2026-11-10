import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { isBlobUrl } from '@/lib/storage/image-rules';
import { deleteProductImage, uploadErrorMessage, uploadProductImage, validateImageFile } from '@/lib/storage/product-image';
import { SLUG_PATTERN } from '@/lib/validation/product';

// One photo per request, so a product with many colors isn't limited by the size of a single form
// submission. Photos still go through the same resize-to-WebP step as the form's own uploads.
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

// Route handlers don't get the Server Action origin check, so do the equivalent here.
function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin GET/fetch from some browsers omits it; cookies are SameSite=Lax
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Returns a ready-made error response, or null for a signed-in admin.
async function guard(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Request not allowed.' }, 403);
  const user = await getCurrentUser();
  if (!user) return json({ error: 'Please sign in again.' }, 401);
  if (user.role !== 'ADMIN') return json({ error: 'Not allowed.' }, 403);
  return null;
}

export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'We couldn’t read that upload.' }, 400);
  }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return json({ error: 'Choose a photo to upload.' }, 400);
  const problem = validateImageFile(file);
  if (problem) return json({ error: problem }, 400);

  // Photos for a product that isn't saved yet go under a shared "draft" name.
  const slug = String(form.get('slug') ?? '');
  try {
    const url = await uploadProductImage(SLUG_PATTERN.test(slug) ? slug : 'draft', file);
    return json({ url });
  } catch (error) {
    console.error('uploading color photo failed', error);
    return json({ error: uploadErrorMessage(error) }, 503);
  }
}

// Lets the form discard a photo it uploaded but never saved. A photo that any product still uses is
// never deleted here, so a bug or a crafted request can't remove live pictures.
export async function DELETE(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === 'string' ? body.url : '';
  if (!isBlobUrl(url)) return json({ error: 'Not a stored photo.' }, 400);

  const inUse = await Promise.all([
    prisma.product.count({ where: { OR: [{ imageUrl: url }, { galleryUrls: { has: url } }] } }),
    prisma.productVariant.count({ where: { imageUrls: { has: url } } }),
  ]);
  if (inUse.some((count) => count > 0)) return json({ error: 'That photo is in use.' }, 409);

  await deleteProductImage(url);
  return json({ ok: true });
}
