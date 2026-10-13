import { describe, expect, it } from "vitest";
import { canTransition, shippingCost } from "../../src/modules/orders/order-status.js";

describe("cycle de vie d'une commande", () => {
  it("autorise PAID → SHIPPED → DELIVERED", () => {
    expect(canTransition("PAID", "SHIPPED")).toBe(true);
    expect(canTransition("SHIPPED", "DELIVERED")).toBe(true);
  });

  it("autorise l'annulation d'une commande payée non expédiée", () => {
    expect(canTransition("PAID", "CANCELLED")).toBe(true);
  });

  it("refuse les retours en arrière et l'annulation après expédition", () => {
    expect(canTransition("SHIPPED", "PAID")).toBe(false);
    expect(canTransition("SHIPPED", "CANCELLED")).toBe(false);
    expect(canTransition("DELIVERED", "SHIPPED")).toBe(false);
    expect(canTransition("CANCELLED", "PAID")).toBe(false);
  });
});

describe("frais de livraison", () => {
  it("facture 5,90 € sous 80 €", () => {
    expect(shippingCost(7999)).toBe(590);
  });
  it("offre la livraison à partir de 80 €", () => {
    expect(shippingCost(8000)).toBe(0);
  });
});
