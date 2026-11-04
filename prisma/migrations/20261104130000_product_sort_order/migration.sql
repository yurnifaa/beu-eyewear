-- Explicit shop order for products (the Sheet's row order); lowest first.
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;
