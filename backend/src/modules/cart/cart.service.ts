import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";

export const MAX_QUANTITY_PER_ITEM = 10;

export async function getCart(userId: number) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { id: "asc" },
    include: { variant: { include: { product: true } } },
  });
  const totalCents = items.reduce((sum, i) => sum + i.quantity * i.variant.product.priceCents, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, totalCents, count };
}

async function getAvailableVariant(variantId: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant || !variant.product.isActive) throw notFound("Article introuvable");
  return variant;
}

function checkQuantity(quantity: number, stock: number) {
  if (quantity > MAX_QUANTITY_PER_ITEM) {
    throw badRequest(`Quantité maximale par article : ${MAX_QUANTITY_PER_ITEM}`);
  }
  if (quantity > stock) throw conflict(`Stock insuffisant (${stock} disponible(s))`);
}

export async function addItem(userId: number, variantId: number, quantity: number) {
  const variant = await getAvailableVariant(variantId);
  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId, variantId } },
  });
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  checkQuantity(newQuantity, variant.stock);

  await prisma.cartItem.upsert({
    where: { userId_variantId: { userId, variantId } },
    update: { quantity: newQuantity },
    create: { userId, variantId, quantity },
  });
  return getCart(userId);
}

export async function setItemQuantity(userId: number, variantId: number, quantity: number) {
  const variant = await getAvailableVariant(variantId);
  checkQuantity(quantity, variant.stock);
  const { count } = await prisma.cartItem.updateMany({
    where: { userId, variantId },
    data: { quantity },
  });
  if (count === 0) throw notFound("Article absent du panier");
  return getCart(userId);
}

export async function removeItem(userId: number, variantId: number) {
  await prisma.cartItem.deleteMany({ where: { userId, variantId } });
  return getCart(userId);
}

export async function clearCart(userId: number) {
  await prisma.cartItem.deleteMany({ where: { userId } });
}
