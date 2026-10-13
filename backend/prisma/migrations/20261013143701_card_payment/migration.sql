-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_brand" TEXT,
ADD COLUMN     "payment_last4" TEXT,
ADD COLUMN     "payment_ref" TEXT;
