import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middlewares/auth.js";
import { idParam } from "../../lib/params.js";
import { prisma } from "../../lib/prisma.js";
import * as ordersService from "../orders/orders.service.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const statusSchema = z.enum(["PAID", "SHIPPED", "DELIVERED", "CANCELLED"]);
const LOW_STOCK_THRESHOLD = 3;

adminRouter.get("/stats", async (_req, res) => {
  const [orders, revenue, customers, lowStock] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { totalCents: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { stock: "asc" },
      take: 20,
    }),
  ]);
  res.json({
    ordersByStatus: Object.fromEntries(orders.map((o) => [o.status, o._count])),
    revenueCents: revenue._sum.totalCents ?? 0,
    customers,
    lowStock,
  });
});

adminRouter.get("/orders", async (req, res) => {
  const { status } = z.object({ status: statusSchema.optional() }).parse(req.query);
  res.json(await ordersService.listAllOrders(status));
});

adminRouter.patch("/orders/:id/status", async (req, res) => {
  const { id } = idParam.parse(req.params);
  const { status } = z.object({ status: statusSchema }).parse(req.body);
  res.json(await ordersService.updateStatus(id, status));
});
