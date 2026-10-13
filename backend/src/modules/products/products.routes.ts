import { Router } from "express";
import { z } from "zod";
import { optionalAuth, requireAdmin } from "../../middlewares/auth.js";
import { idParam } from "../../lib/params.js";
import { productQuerySchema, productSchema } from "./products.schemas.js";
import * as productsService from "./products.service.js";

export const productsRouter = Router();

productsRouter.get("/", optionalAuth, async (req, res) => {
  const query = productQuerySchema.parse(req.query);
  res.json(await productsService.listProducts(query, req.user?.role === "ADMIN"));
});

productsRouter.get("/filters", async (_req, res) => {
  res.json(await productsService.getFilters());
});

productsRouter.get("/id/:id", requireAdmin, async (req, res) => {
  const { id } = idParam.parse(req.params);
  res.json(await productsService.getProductById(id));
});

productsRouter.get("/:slug", optionalAuth, async (req, res) => {
  const { slug } = z.object({ slug: z.string().max(150) }).parse(req.params);
  res.json(await productsService.getProductBySlug(slug, req.user?.role === "ADMIN"));
});

productsRouter.post("/", requireAdmin, async (req, res) => {
  const data = productSchema.parse(req.body);
  res.status(201).json(await productsService.createProduct(data));
});

productsRouter.put("/:id", requireAdmin, async (req, res) => {
  const { id } = idParam.parse(req.params);
  const data = productSchema.parse(req.body);
  res.json(await productsService.updateProduct(id, data));
});

productsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = idParam.parse(req.params);
  await productsService.archiveProduct(id);
  res.status(204).end();
});
