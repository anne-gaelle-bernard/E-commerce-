import type { Product } from "../api/types";

// photo du coloris choisi, sinon photo principale du produit
export function imageFor(product: Pick<Product, "imageUrl" | "images">, color?: string): string {
  return product.images?.find((img) => img.color === color)?.url ?? product.imageUrl;
}

export function productColors(product: Pick<Product, "variants">): string[] {
  return [...new Set(product.variants.map((v) => v.color))];
}
