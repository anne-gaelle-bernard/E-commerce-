import { z } from "zod";

const variantSchema = z.object({
  size: z.string().trim().min(1).max(10),
  color: z.string().trim().min(1).max(30),
  stock: z.number().int().min(0).max(100000),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(2000),
    priceCents: z.number().int().positive().max(10_000_000),
    imageUrl: z.string().trim().url().max(500),
    gender: z.enum(["FEMME", "HOMME", "UNISEXE"]),
    categoryId: z.number().int().positive(),
    isActive: z.boolean().default(true),
    variants: z.array(variantSchema).min(1, "Au moins une déclinaison est requise").max(100),
  })
  .refine(
    (p) => new Set(p.variants.map((v) => `${v.size}|${v.color}`)).size === p.variants.length,
    { message: "Chaque couple taille / couleur doit être unique", path: ["variants"] },
  );

export const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  gender: z.enum(["FEMME", "HOMME", "UNISEXE"]).optional(),
  size: z.string().trim().max(10).optional(),
  color: z.string().trim().max(30).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  includeInactive: z.enum(["true", "false"]).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
