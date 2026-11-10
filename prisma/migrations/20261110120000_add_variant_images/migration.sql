-- Per-color photos: an ordered list on each variant. Empty = use the product's shared photos.
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
