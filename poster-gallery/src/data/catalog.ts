import raw from "./collections.json";

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Base price in EUR for the paperback. */
  price: number;
  cover: string;
  spine: string;
  collection: string;
  pages: number;
  year: number;
  /** Main cover colour (used for the 3D book) and accent colour. */
  color: string;
  accent: string;
  description: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  books: Book[];
}

export const collections = raw.collections as Collection[];
export const books: Book[] = collections.flatMap((c) => c.books);

const byId = new Map(books.map((b) => [b.id, b]));
const collectionById = new Map(collections.map((c) => [c.id, c]));

export const getBook = (id: string | null | undefined) => (id ? byId.get(id) : undefined);
export const getCollection = (id: string) => collectionById.get(id)!;

/** Book proportions used by the 3D gallery. */
export const COVER_ASPECT = 2 / 3; // width / height
export const thicknessRatio = (b: Book) => 0.07 + Math.min(b.pages, 650) / 650 * 0.16; // depth / width

// options & pricing
export const FORMATS = [
  { id: "paperback", label: "Paperback", factor: 1, extra: 0 },
  { id: "hardcover", label: "Hardcover", factor: 1.55, extra: 0 },
  { id: "collector", label: "Collector's", factor: 1.55, extra: 18 },
] as const;

export const EDGES = [
  { id: "plain", label: "Plain", swatch: "#efe6d2", extra: 0 },
  { id: "black", label: "Black", swatch: "#121212", extra: 6 },
  { id: "gold", label: "Gold", swatch: "#d4a537", extra: 9 },
  { id: "red", label: "Red", swatch: "#b3261e", extra: 6 },
] as const;

export type FormatId = (typeof FORMATS)[number]["id"];
export type EdgeId = (typeof EDGES)[number]["id"];

export function unitPrice(book: Book, format: FormatId, edges: EdgeId) {
  const f = FORMATS.find((x) => x.id === format)!;
  const e = EDGES.find((x) => x.id === edges)!;
  return Math.round(book.price * f.factor) + f.extra + e.extra;
}

export type Currency = "EUR" | "GBP";
const GBP_RATE = 0.86;

export function formatPrice(eur: number, currency: Currency) {
  const value = currency === "EUR" ? eur : Math.round(eur * GBP_RATE * 100) / 100;
  return new Intl.NumberFormat(currency === "EUR" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function searchBooks(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return books.filter((b) =>
    [b.title, b.author, getCollection(b.collection).name].some((s) => s.toLowerCase().includes(q)),
  );
}
