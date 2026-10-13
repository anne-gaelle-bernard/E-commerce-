import { describe, expect, it } from "vitest";
import { formatPrice, shippingCost } from "./format";

describe("formatPrice", () => {
  it("convertit des centimes en euros au format français", () => {
    // Intl utilise une espace insécable avant le symbole €
    expect(formatPrice(2590).replace(/\s/g, " ")).toBe("25,90 €");
  });
});

describe("shippingCost", () => {
  it("applique les mêmes règles que l'API", () => {
    expect(shippingCost(7999)).toBe(590);
    expect(shippingCost(8000)).toBe(0);
  });
});
