-- The catalog moves from a Google Sheet into Postgres (see prisma/schema.prisma).
--
-- The old "Product" table held 23 sample products that nothing read any more. The new
-- required columns (listPrice, updatedAt) can't be added to a table with rows, so those
-- rows are removed first. Orders are unaffected: OrderItem has no foreign key to Product.
DELETE FROM "Product";

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FRAME', 'SMART_FRAME', 'ACCESSORY', 'BUNDLE');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RECEIVE', 'SALE', 'RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'PENDING', 'HIDDEN');

-- CreateEnum
CREATE TYPE "FilterKind" AS ENUM ('FRAME_MATERIAL', 'LENS_OPTION', 'FRAME_SHAPE', 'COLOR_FAMILY');

-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('PERCENT', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "OfferEligibility" AS ENUM ('NONE', 'STUDENT_ID', 'FIRST_ORDER');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 99,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "colors",
DROP COLUMN "price",
DROP COLUMN "stockQuantity",
ADD COLUMN     "bridgeWidthMm" INTEGER,
ADD COLUMN     "compatibleWith" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "featuredRank" INTEGER,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "galleryUrls" TEXT[],
ADD COLUMN     "hasEyewearKit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isStudentEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lensSummary" TEXT,
ADD COLUMN     "lensWidthMm" INTEGER,
ADD COLUMN     "listPrice" INTEGER NOT NULL,
ADD COLUMN     "nosePadType" TEXT,
ADD COLUMN     "productType" "ProductType" NOT NULL DEFAULT 'FRAME',
ADD COLUMN     "returnWindowDays" INTEGER,
ADD COLUMN     "salePrice" INTEGER,
ADD COLUMN     "shortDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "templeLengthMm" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weightG" INTEGER,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "warrantyYears" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "description" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 99,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "sku" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'Standard',
    "colorFamily" TEXT,
    "hex" TEXT,
    "lensTint" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorInitials" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "featuredOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ShippingRate" (
    "method" "ShippingMethod" NOT NULL,
    "label" TEXT NOT NULL,
    "fee" INTEGER NOT NULL,
    "minDays" INTEGER NOT NULL,
    "maxDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShippingRate_pkey" PRIMARY KEY ("method")
);

-- CreateTable
CREATE TABLE "FrameMaterialInfo" (
    "material" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL DEFAULT '',
    "weight" TEXT NOT NULL DEFAULT '',
    "composition" TEXT NOT NULL DEFAULT '',
    "performance" TEXT NOT NULL DEFAULT '',
    "nosePad" TEXT NOT NULL DEFAULT '',
    "isHypoallergenic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FrameMaterialInfo_pkey" PRIMARY KEY ("material")
);

-- CreateTable
CREATE TABLE "LensOptionInfo" (
    "lensOption" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metric" TEXT,
    "upgradeMinPrice" INTEGER,
    "upgradeMaxPrice" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LensOptionInfo_pkey" PRIMARY KEY ("lensOption")
);

-- CreateTable
CREATE TABLE "FilterOption" (
    "kind" "FilterKind" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hex" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FilterOption_pkey" PRIMARY KEY ("kind","value")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "badge" TEXT NOT NULL DEFAULT 'Offer',
    "kind" "OfferKind" NOT NULL DEFAULT 'PERCENT',
    "value" INTEGER NOT NULL DEFAULT 0,
    "eligibility" "OfferEligibility" NOT NULL DEFAULT 'NONE',
    "requiresCode" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BundleItem" (
    "id" TEXT NOT NULL,
    "bundleSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "componentSlug" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariant_productSlug_idx" ON "ProductVariant"("productSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productSlug_color_key" ON "ProductVariant"("productSlug", "color");

-- CreateIndex
CREATE INDEX "StockMovement_sku_createdAt_idx" ON "StockMovement"("sku", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "Review_productSlug_status_idx" ON "Review"("productSlug", "status");

-- CreateIndex
CREATE INDEX "BundleItem_bundleSlug_idx" ON "BundleItem"("bundleSlug");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productSlug_fkey" FOREIGN KEY ("productSlug") REFERENCES "Product"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productSlug_fkey" FOREIGN KEY ("productSlug") REFERENCES "Product"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BundleItem" ADD CONSTRAINT "BundleItem_bundleSlug_fkey" FOREIGN KEY ("bundleSlug") REFERENCES "Product"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- Stock can never go negative, whatever code path changes it.
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stockQuantity_nonnegative" CHECK ("stockQuantity" >= 0);

-- Star ratings are 1 to 5.
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
