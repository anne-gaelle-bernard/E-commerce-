import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/http-error.js";
import { slugify } from "../../lib/slug.js";
import type { ProductInput, ProductQuery } from "./products.schemas.js";

const ORDER_BY: Record<ProductQuery["sort"], Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { priceCents: "asc" },
  price_desc: { priceCents: "desc" },
  name: { name: "asc" },
};

const productInclude = {
  category: true,
  variants: { orderBy: { id: "asc" } },
} satisfies Prisma.ProductInclude;

export async function listProducts(query: ProductQuery, isAdmin: boolean) {
  const variantFilter: Prisma.ProductVariantWhereInput = { stock: { gt: 0 } };
  if (query.size) variantFilter.size = query.size;
  if (query.color) variantFilter.color = { equals: query.color, mode: "insensitive" };
  const filterOnVariant = Boolean(query.size || query.color);

  const where: Prisma.ProductWhereInput = {
    isActive: isAdmin && query.includeInactive === "true" ? undefined : true,
    gender: query.gender ? { in: [query.gender, "UNISEXE"] } : undefined,
    category: query.category ? { slug: query.category } : undefined,
    priceCents: { gte: query.minPrice, lte: query.maxPrice },
    variants: filterOnVariant ? { some: variantFilter } : undefined,
    OR: query.search
      ? [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ]
      : undefined,
  };

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: ORDER_BY[query.sort],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: query.page, pages: Math.max(1, Math.ceil(total / query.limit)) };
}

export async function getFilters() {
  const variants = await prisma.productVariant.findMany({
    where: { product: { isActive: true } },
    select: { size: true, color: true },
    distinct: ["size", "color"],
  });
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color))].sort();
  return { sizes, colors };
}

export async function getProductBySlug(slug: string, isAdmin: boolean) {
  const product = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  if (!product || (!product.isActive && !isAdmin)) throw notFound("Produit introuvable");
  return product;
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) throw notFound("Produit introuvable");
  return product;
}

async function uniqueSlug(name: string, excludeId?: number) {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
}

export async function createProduct(data: ProductInput) {
  const { variants, ...fields } = data;
  return prisma.product.create({
    data: { ...fields, slug: await uniqueSlug(fields.name), variants: { create: variants } },
    include: productInclude,
  });
}

// les déclinaisons absentes du formulaire sont supprimées, les autres créées ou mises à jour
export async function updateProduct(id: number, data: ProductInput) {
  const existing = await getProductById(id);
  const { variants, ...fields } = data;
  const key = (v: { size: string; color: string }) => `${v.size}|${v.color}`;
  const wanted = new Set(variants.map(key));
  const toDelete = existing.variants.filter((v) => !wanted.has(key(v))).map((v) => v.id);
  const slug = await uniqueSlug(fields.name, id);

  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { ...fields, slug } }),
    prisma.productVariant.deleteMany({ where: { id: { in: toDelete } } }),
    ...variants.map((v) =>
      prisma.productVariant.upsert({
        where: { productId_size_color: { productId: id, size: v.size, color: v.color } },
        update: { stock: v.stock },
        create: { ...v, productId: id },
      }),
    ),
  ]);
  return getProductById(id);
}

// soft delete : le produit reste lié aux anciennes commandes
export async function archiveProduct(id: number) {
  await getProductById(id);
  await prisma.product.update({ where: { id }, data: { isActive: false } });
}
