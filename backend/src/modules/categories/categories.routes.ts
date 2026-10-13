import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../lib/slug.js";
import { idParam } from "../../lib/params.js";
import { requireAdmin } from "../../middlewares/auth.js";

export const categoriesRouter = Router();

const categorySchema = z.object({ name: z.string().trim().min(2).max(60) });

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
});

categoriesRouter.post("/", requireAdmin, async (req, res) => {
  const { name } = categorySchema.parse(req.body);
  const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
  res.status(201).json(category);
});

categoriesRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { name } = categorySchema.parse(req.body);
  const category = await prisma.category.update({ where: { id }, data: { name, slug: slugify(name) } });
  res.json(category);
});

categoriesRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = idParam.parse(req.params);
  await prisma.category.delete({ where: { id } });
  res.status(204).end();
});
