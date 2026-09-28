-- CreateTable
CREATE TABLE "Category" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "slug" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Product" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "subcategorySlug" TEXT NOT NULL,
    "frameMaterial" TEXT,
    "lensOption" TEXT,
    "frameShape" TEXT,
    "colors" TEXT[],
    "warrantyYears" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE INDEX "Subcategory_categorySlug_idx" ON "Subcategory"("categorySlug");

-- CreateIndex
CREATE INDEX "Product_categorySlug_idx" ON "Product"("categorySlug");

-- CreateIndex
CREATE INDEX "Product_subcategorySlug_idx" ON "Product"("subcategorySlug");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategorySlug_fkey" FOREIGN KEY ("subcategorySlug") REFERENCES "Subcategory"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
