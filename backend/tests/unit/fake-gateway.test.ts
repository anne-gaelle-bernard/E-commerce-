import { describe, expect, it } from "vitest";
import { TEST_CARDS, cardSchema, charge, detectBrand, isExpired, luhnCheck } from "../../src/modules/payments/fake-gateway.js";

const validCard = { holder: "Camille Martin", number: TEST_CARDS.success, expMonth: 12, expYear: 2099, cvc: "123" };

describe("algorithme de Luhn", () => {
  it.each(["4242424242424242", "5555555555554444", "378282246310005"])("accepte %s", (n) => {
    expect(luhnCheck(n)).toBe(true);
  });
  it("détecte une faute de frappe", () => {
    expect(luhnCheck("4242424242424241")).toBe(false);
  });
});

describe("marque de la carte", () => {
  it("reconnaît Visa, Mastercard et American Express", () => {
    expect(detectBrand("4242424242424242")).toBe("VISA");
    expect(detectBrand("5555555555554444")).toBe("MASTERCARD");
    expect(detectBrand("2223003122003222")).toBe("MASTERCARD");
    expect(detectBrand("378282246310005")).toBe("AMEX");
  });
});

describe("date d'expiration", () => {
  const now = new Date(2026, 9, 13); // 13 octobre 2026
  it("reste valable jusqu'à la fin du mois d'expiration", () => {
    expect(isExpired(10, 2026, now)).toBe(false);
    expect(isExpired(9, 2026, now)).toBe(true);
    expect(isExpired(1, 2027, now)).toBe(false);
  });
});

describe("validation de la carte", () => {
  it("accepte un numéro saisi avec des espaces", () => {
    const card = cardSchema.parse({ ...validCard, number: "4242 4242 4242 4242" });
    expect(card.number).toBe("4242424242424242");
  });
  it("exige un CVC à 4 chiffres pour American Express", () => {
    expect(cardSchema.safeParse({ ...validCard, number: "378282246310005", cvc: "123" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...validCard, number: "378282246310005", cvc: "1234" }).success).toBe(true);
  });
});

describe("débit simulé", () => {
  it("renvoie une référence, la marque et les 4 derniers chiffres", () => {
    expect(charge(validCard, 2500)).toMatchObject({ brand: "VISA", last4: "4242", reference: expect.stringMatching(/^sim_/) });
  });
  it("refuse les cartes de test de refus avec un code 402", () => {
    expect(() => charge({ ...validCard, number: TEST_CARDS.declined }, 2500)).toThrow(expect.objectContaining({ status: 402 }));
    expect(() => charge({ ...validCard, number: TEST_CARDS.insufficientFunds }, 2500)).toThrow(/fonds insuffisants/);
  });
});
