import { Star } from "lucide-react";
import { RevealItem } from "@/component/Reveal";
import type { ProductReview } from "@/lib/catalog/types";

const TILTS = ["-rotate-2", "rotate-1", "rotate-2"];

export default function ReviewsSection({ reviews }: { reviews: ProductReview[] }) {
  return (
    <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 py-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
      {reviews.map((review, index) => (
        // The item carries the layout and the reveal; the tilt stays on the figure so the two
        // transforms never fight.
        <RevealItem key={review.id} className="w-72 shrink-0 snap-start md:w-full">
        <figure
          className={`flex h-full flex-col gap-3 rounded-2xl border-2 border-ink bg-white p-5 shadow-[5px_5px_0_var(--ink)] ${TILTS[index % TILTS.length]}`}
        >
          <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < review.rating ? "fill-accent text-accent" : "text-accent/40"}
              />
            ))}
          </div>
          <blockquote className="text-sm leading-relaxed text-foreground">
            <span className="font-accent text-xl">&ldquo;</span>
            {review.body}
            <span className="font-accent text-xl">&rdquo;</span>
          </blockquote>
          <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-ice text-[10px] font-bold text-ink">
              {review.authorInitials}
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold">{review.authorName}</span>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                {review.isVerifiedPurchase ? "Verified Buyer" : "Customer"}
              </span>
            </span>
          </figcaption>
        </figure>
        </RevealItem>
      ))}
    </div>
  );
}
