-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "image_url" TEXT;

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "color" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_images_product_id_color_key" ON "product_images"("product_id", "color");

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
