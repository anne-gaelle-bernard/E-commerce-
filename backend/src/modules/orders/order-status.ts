import type { OrderStatus } from "@prisma/client";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export const SHIPPING_FREE_THRESHOLD_CENTS = 8000;
export const SHIPPING_COST_CENTS = 590;

export function shippingCost(subtotalCents: number): number {
  return subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
}
