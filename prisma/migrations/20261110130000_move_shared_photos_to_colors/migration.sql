-- Photos now belong to colors only. Copy each product's existing Main photo + Gallery onto every
-- color that has no photos of its own (at most 8, the per-color limit), so the shop looks the same
-- as before. Product."imageUrl" / "galleryUrls" are no longer read; they are left in place.
UPDATE "ProductVariant" AS v
SET "imageUrls" = (
  array_remove(array_prepend(p."imageUrl", COALESCE(p."galleryUrls", ARRAY[]::TEXT[])), NULL)
)[1:8]
FROM "Product" AS p
WHERE p."slug" = v."productSlug"
  AND COALESCE(cardinality(v."imageUrls"), 0) = 0
  AND (p."imageUrl" IS NOT NULL OR COALESCE(cardinality(p."galleryUrls"), 0) > 0);
