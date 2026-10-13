import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from "../../lib/http-error.js";

// Faux prestataire de paiement : aucune banque n'est appelée.
// On ne garde jamais le numéro complet ni le CVC, seulement la marque et les 4 derniers chiffres.

export type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "CB";

// mêmes numéros de test que Stripe
export const TEST_CARDS = {
  success: "4242424242424242",
  declined: "4000000000000002",
  insufficientFunds: "4000000000009995",
} as const;

const DECLINES: Record<string, string> = {
  [TEST_CARDS.declined]: "Paiement refusé par la banque",
  [TEST_CARDS.insufficientFunds]: "Paiement refusé : fonds insuffisants",
};

export function luhnCheck(number: string): boolean {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let digit = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function detectBrand(number: string): CardBrand {
  if (/^3[47]/.test(number)) return "AMEX";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "MASTERCARD";
  if (/^4/.test(number)) return "VISA";
  return "CB";
}

export function isExpired(month: number, year: number, now = new Date()): boolean {
  return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
}

export const cardSchema = z
  .object({
    holder: z.string().trim().min(2, "Nom du titulaire requis").max(100),
    number: z
      .string()
      .transform((v) => v.replace(/[\s-]/g, ""))
      .pipe(
        z
          .string()
          .regex(/^[0-9]{13,19}$/, "Numéro de carte invalide")
          .refine(luhnCheck, "Numéro de carte invalide"),
      ),
    expMonth: z.number().int().min(1, "Mois invalide").max(12, "Mois invalide"),
    expYear: z.number().int().min(2000).max(2100),
    cvc: z.string().regex(/^[0-9]{3,4}$/, "CVC invalide"),
  })
  .superRefine((card, ctx) => {
    if (isExpired(card.expMonth, card.expYear)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["expMonth"], message: "Carte expirée" });
    }
    const expectedCvcLength = detectBrand(card.number) === "AMEX" ? 4 : 3;
    if (card.cvc.length !== expectedCvcLength) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cvc"], message: "CVC invalide" });
    }
  });

export type CardInput = z.infer<typeof cardSchema>;

export interface PaymentResult {
  reference: string;
  brand: CardBrand;
  last4: string;
}

export function charge(card: CardInput, amountCents: number): PaymentResult {
  if (amountCents <= 0) throw new HttpError(400, "Montant invalide");
  const decline = DECLINES[card.number];
  if (decline) throw new HttpError(402, decline);
  return {
    reference: `sim_${randomUUID()}`,
    brand: detectBrand(card.number),
    last4: card.number.slice(-4),
  };
}
