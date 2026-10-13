export type CardBrand = "VISA" | "MASTERCARD" | "AMEX" | "CB";

export const BRAND_LABELS: Record<CardBrand, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  AMEX: "American Express",
  CB: "Carte bancaire",
};

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

export function detectBrand(number: string): CardBrand {
  if (/^3[47]/.test(number)) return "AMEX";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "MASTERCARD";
  if (/^4/.test(number)) return "VISA";
  return "CB";
}

export function luhnCheck(number: string): boolean {
  if (!/^[0-9]{13,19}$/.test(number)) return false;
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

// Amex : groupes 4-6-5
export function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  if (detectBrand(digits) === "AMEX") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function parseExpiry(value: string): { expMonth: number; expYear: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return null;
  return { expMonth: Number(match[1]), expYear: 2000 + Number(match[2]) };
}
