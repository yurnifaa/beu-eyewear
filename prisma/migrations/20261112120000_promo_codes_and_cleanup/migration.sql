-- Remove STUDENT_ID from OfferEligibility enum
DELETE FROM "Offer" WHERE "eligibility" = 'STUDENT_ID';
ALTER TYPE "OfferEligibility" RENAME TO "OfferEligibility_old";
CREATE TYPE "OfferEligibility" AS ENUM ('NONE', 'FIRST_ORDER');
ALTER TABLE "Offer" ALTER COLUMN "eligibility" DROP DEFAULT;
ALTER TABLE "Offer" ALTER COLUMN "eligibility" TYPE "OfferEligibility" USING ("eligibility"::text::"OfferEligibility");
ALTER TABLE "Offer" ALTER COLUMN "eligibility" SET DEFAULT 'NONE';
DROP TYPE "OfferEligibility_old";

-- Remove isStudentEligible from Product
ALTER TABLE "Product" DROP COLUMN "isStudentEligible";

-- Add promo code fields to Offer
ALTER TABLE "Offer" ADD COLUMN "code" TEXT;
ALTER TABLE "Offer" ADD COLUMN "maxRedemptions" INTEGER;
ALTER TABLE "Offer" ADD COLUMN "currentRedemptions" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Offer" ADD COLUMN "termsAndConditions" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Offer" ADD COLUMN "minOrderAmount" INTEGER;
CREATE UNIQUE INDEX "Offer_code_key" ON "Offer"("code");

-- Add discount tracking to Order
ALTER TABLE "Order" ADD COLUMN "discountAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "offerId" TEXT;
ALTER TABLE "Order" ADD COLUMN "offerCode" TEXT;
