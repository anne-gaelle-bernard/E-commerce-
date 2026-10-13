import type { OrderStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { canTransition, shippingCost } from "./order-status.js";
import { cardSchema, charge } from "../payments/fake-gateway.js";

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  street: z.string().trim().min(3).max(200),
  postalCode: z.string().trim().regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres)"),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(2).max(60).default("France"),
});

export const checkoutSchema = z.object({ shipping: shippingSchema, card: cardSchema });

const orderInclude = { items: { orderBy: { id: "asc" } } } satisfies Prisma.OrderInclude;

export async function createOrder(userId: number, { shipping, card }: z.infer<typeof checkoutSchema>) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({
      where: { userId },
      include: { variant: { include: { product: true } } },
    });
    if (cart.length === 0) throw badRequest("Le panier est vide");

    for (const item of cart) {
      if (!item.variant.product.isActive) {
        throw conflict(`« ${item.variant.product.name} » n'est plus disponible`);
      }
      // le WHERE stock >= quantité évite la survente en cas de commandes simultanées
      const { count } = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) {
        throw conflict(
          `Stock insuffisant pour « ${item.variant.product.name} » (${item.variant.size}, ${item.variant.color})`,
        );
      }
    }

    const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.variant.product.priceCents, 0);
    const shippingCents = shippingCost(subtotal);

    // si le paiement échoue, l'exception fait un rollback (stock restauré)
    const payment = charge(card, subtotal + shippingCents);

    const order = await tx.order.create({
      data: {
        userId,
        status: "PAID",
        shippingCents,
        paymentRef: payment.reference,
        paymentBrand: payment.brand,
        paymentLast4: payment.last4,
        totalCents: subtotal + shippingCents,
        shippingFullName: shipping.fullName,
        shippingStreet: shipping.street,
        shippingPostal: shipping.postalCode,
        shippingCity: shipping.city,
        shippingCountry: shipping.country,
        items: {
          create: cart.map((i) => ({
            variantId: i.variantId,
            productName: i.variant.product.name,
            size: i.variant.size,
            color: i.variant.color,
            unitPriceCents: i.variant.product.priceCents,
            quantity: i.quantity,
          })),
        },
      },
      include: orderInclude,
    });

    await tx.cartItem.deleteMany({ where: { userId } });
    return order;
  });
}

export async function listUserOrders(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

export async function getOrder(id: number, user: { id: number; role: string }) {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  // 404 plutôt que 403 : on ne confirme pas l'existence de la commande
  if (!order || (user.role !== "ADMIN" && order.userId !== user.id)) {
    throw notFound("Commande introuvable");
  }
  return order;
}

export async function listAllOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: { ...orderInclude, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
  });
}

export async function updateStatus(id: number, status: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw notFound("Commande introuvable");
    if (!canTransition(order.status, status)) {
      throw badRequest(`Transition impossible : ${order.status} → ${status}`);
    }
    if (status === "CANCELLED") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
    return tx.order.update({ where: { id }, data: { status }, include: orderInclude });
  });
}
