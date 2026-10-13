import type { Gender, OrderStatus } from "../api/types";

const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export const formatPrice = (cents: number) => priceFormatter.format(cents / 100);
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const GENDER_LABELS: Record<Gender, string> = {
  FEMME: "Femme",
  HOMME: "Homme",
  UNISEXE: "Unisexe",
};

// affichage seulement, le serveur recalcule
export const FREE_SHIPPING_THRESHOLD_CENTS = 8000;
export const SHIPPING_COST_CENTS = 590;
export const shippingCost = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
