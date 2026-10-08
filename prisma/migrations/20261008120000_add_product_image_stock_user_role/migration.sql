-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "stockQuantity" INTEGER NOT NULL DEFAULT 0;

-- Products that existed before stock tracking start with 20 in stock, so the
-- storefront doesn't flip them all to "Out of stock". New products default to 0.
UPDATE "Product" SET "stockQuantity" = 20;
