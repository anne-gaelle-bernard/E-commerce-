import { describe, expect, it } from "vitest";
import { detectBrand, formatCardNumber, formatExpiry, luhnCheck, parseExpiry } from "./card";

describe("saisie de la carte", () => {
  it("formate le numéro par groupes de 4", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });
  it("formate American Express en 4-6-5", () => {
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
  });
  it("formate et lit la date d'expiration", () => {
    expect(formatExpiry("1228")).toBe("12/28");
    expect(parseExpiry("12/28")).toEqual({ expMonth: 12, expYear: 2028 });
    expect(parseExpiry("1/28")).toBeNull();
  });
  it("vérifie le numéro avec l'algorithme de Luhn", () => {
    expect(luhnCheck("4242424242424242")).toBe(true);
    expect(luhnCheck("4242424242424241")).toBe(false);
  });
  it("détecte la marque", () => {
    expect(detectBrand("5555555555554444")).toBe("MASTERCARD");
  });
});
