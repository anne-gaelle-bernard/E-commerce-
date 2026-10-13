import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { requireAuth } from "../../middlewares/auth.js";
import { idParam } from "../../lib/params.js";
import * as ordersService from "./orders.service.js";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: "Trop de tentatives de paiement, réessayez dans 15 minutes" },
});

ordersRouter.post("/", paymentLimiter, async (req, res) => {
  const checkout = ordersService.checkoutSchema.parse(req.body);
  res.status(201).json(await ordersService.createOrder(req.user!.id, checkout));
});

ordersRouter.get("/", async (req, res) => {
  res.json(await ordersService.listUserOrders(req.user!.id));
});

ordersRouter.get("/:id", async (req, res) => {
  const { id } = idParam.parse(req.params);
  res.json(await ordersService.getOrder(id, req.user!));
});
