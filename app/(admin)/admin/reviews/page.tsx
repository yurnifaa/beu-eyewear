import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import ConfirmSubmitButton from '@/component/admin/ConfirmSubmitButton';
import Pagination from '@/component/admin/Pagination';
import { REVIEW_STATUSES, REVIEW_STATUS_LABELS, getAdminReviews, parseReviewFilters } from '@/lib/admin/reviews';
import { deleteReview, setReviewFeatured, setReviewStatus } from './actions';

export const dynamic = 'force-dynamic';

const filterClassName = 'rounded-lg border border-border bg-background px-3 py-2 text-sm';

const STATUS_STYLES = {
  PUBLISHED: 'bg-green-500/15 text-green-700',
  PENDING: 'bg-amber-500/15 text-amber-700',
  HIDDEN: 'bg-muted text-muted-foreground',
} as const;

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
}

export default async function ReviewsPage(props: PageProps<'/admin/reviews'>) {
  const filters = parseReviewFilters(await props.searchParams);
  const { reviews, total, page, totalPages, counts } = await getAdminReviews(filters);
  const isFiltered = Boolean(filters.status || filters.q);
  const params: Record<string, string> = { ...(filters.q && { q: filters.q }), ...(filters.status && { status: filters.status }) };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only published reviews appear in the shop, and they make up each product’s rating. Give a published review a
          home order (1, 2, 3…) to show it in the testimonial row on the home page.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input type="search" name="q" defaultValue={filters.q} placeholder="Search reviews, authors or products" aria-label="Search reviews" className={`${filterClassName} w-72`} />
        <select name="status" defaultValue={filters.status ?? ''} aria-label="Filter by status" className={filterClassName}>
          <option value="">All statuses</option>
          {REVIEW_STATUSES.map((status) => (
            <option key={status} value={status}>
              {REVIEW_STATUS_LABELS[status]} ({counts[status] ?? 0})
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClassName({ variant: 'secondary' })}>Filter</button>
        {isFiltered && <Link href="/admin/reviews" className="text-sm text-muted-foreground underline hover:text-foreground">Clear</Link>}
      </form>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-semibold">Review</th>
              <th scope="col" className="px-4 py-3 font-semibold">Product</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Home order</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-border align-top last:border-b-0">
                <td className="max-w-md px-4 py-3">
                  <p className="font-medium">
                    <span aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>{' '}
                    {review.title}
                  </p>
                  <p className="mt-1 text-muted-foreground">{review.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.authorName}{review.isVerifiedPurchase ? ' · verified purchase' : ''} · {formatDate(review.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${review.product.slug}`} className="underline-offset-2 hover:underline">{review.product.name}</Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[review.status]}`}>{REVIEW_STATUS_LABELS[review.status]}</span>
                </td>
                <td className="px-4 py-3">
                  {review.status === 'PUBLISHED' ? (
                    <form action={setReviewFeatured.bind(null, review.id)} className="flex items-center gap-2">
                      <input name="order" inputMode="numeric" pattern="[0-9]{1,2}" maxLength={2} defaultValue={review.featuredOrder ?? ''} aria-label={`Home page order for the review by ${review.authorName}`} placeholder="—" className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-center text-sm tabular-nums" />
                      <button type="submit" className={buttonClassName({ variant: 'secondary', size: 'sm' })}>Save</button>
                    </form>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {review.status !== 'PUBLISHED' && (
                      <form action={setReviewStatus.bind(null, review.id, 'PUBLISHED')}>
                        <button type="submit" className={buttonClassName({ variant: 'secondary', size: 'sm' })}>Publish</button>
                      </form>
                    )}
                    {review.status !== 'HIDDEN' && (
                      <form action={setReviewStatus.bind(null, review.id, 'HIDDEN')}>
                        <button type="submit" className={buttonClassName({ variant: 'secondary', size: 'sm' })}>Hide</button>
                      </form>
                    )}
                    <ConfirmSubmitButton action={deleteReview.bind(null, review.id)} label="Delete" danger message="Delete this review permanently? To keep it but stop showing it, use Hide instead." />
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {isFiltered ? 'No reviews match your filters.' : 'No reviews yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{total} review{total === 1 ? '' : 's'}{isFiltered ? ' matching your filters' : ''}.</p>
        <Pagination basePath="/admin/reviews" params={params} page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
