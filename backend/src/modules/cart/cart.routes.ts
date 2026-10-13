import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/auth.js";
import * as cartService from "./cart.service.js";

export const cartRouter = Router();
cartRouter.use(requireAuth);

const variantParam = z.object({ variantId: z.coerce.number().int().positive() });
const quantitySchema = z.number().int().min(1);

cartRouter.get("/", async (req, res) => {
  res.json(await cartService.getCart(req.user!.id));
});

cartRouter.post("/items", async (req, res) => {
  const { variantId, quantity } = z
    .object({ variantId: z.number().int().positive(), quantity: quantitySchema.default(1) })
    .parse(req.body);
  res.status(201).json(await cartService.addItem(req.user!.id, variantId, quantity));
});

cartRouter.patch("/items/:variantId", async (req, res) => {
  const { variantId } = variantParam.parse(req.params);
  const { quantity } = z.object({ quantity: quantitySchema }).parse(req.body);
  res.json(await cartService.setItemQuantity(req.user!.id, variantId, quantity));
});

cartRouter.delete("/items/:variantId", async (req, res) => {
  const { variantId } = variantParam.parse(req.params);
  res.json(await cartService.removeItem(req.user!.id, variantId));
});

cartRouter.delete("/", async (req, res) => {
  await cartService.clearCart(req.user!.id);
  res.status(204).end();
});
