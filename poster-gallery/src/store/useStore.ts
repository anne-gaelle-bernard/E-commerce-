import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getBook, unitPrice, type Currency, type EdgeId, type FormatId } from "@/data/catalog";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CartItem {
  key: string;
  bookId: string;
  format: FormatId;
  edges: EdgeId;
  qty: number;
}

/**
 * gallery  : walking the library
 * opening  : the book flying from its shelf to the product view
 * product  : product page shown
 * closing  : the book flying back to its shelf
 */
export type Phase = "gallery" | "opening" | "product" | "closing";

interface State {
  // bag
  items: CartItem[];
  cartOpen: boolean;
  currency: Currency;
  addItem: (bookId: string, format: FormatId, edges: EdgeId, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  setCartOpen: (open: boolean) => void;
  toggleCurrency: () => void;

  // gallery / product
  phase: Phase;
  selectedId: string | null;
  /** Screen rect the book flies from (and back to). */
  fromRect: Rect | null;
  currentCollection: string | null;
  format: FormatId;
  edges: EdgeId;
  setFormat: (format: FormatId) => void;
  setEdges: (edges: EdgeId) => void;
  setPhase: (phase: Phase) => void;
  openBook: (id: string, rect: Rect | null) => void;
  switchBook: (id: string) => void;
  closeBook: (rect: Rect | null) => void;
  setCurrentCollection: (id: string | null) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      cartOpen: false,
      currency: "EUR",
      addItem: (bookId, format, edges, qty) =>
        set((s) => {
          const key = `${bookId}|${format}|${edges}`;
          const existing = s.items.find((i) => i.key === key);
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
            : [...s.items, { key, bookId, format, edges, qty }];
          return { items, cartOpen: true };
        }),
      setQty: (key, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)) })),
      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      toggleCurrency: () => set((s) => ({ currency: s.currency === "EUR" ? "GBP" : "EUR" })),

      phase: "gallery",
      selectedId: null,
      fromRect: null,
      currentCollection: null,
      format: "hardcover",
      edges: "plain",
      setFormat: (format) => set({ format }),
      setEdges: (edges) => set({ edges }),
      setPhase: (phase) => set({ phase }),
      openBook: (id, rect) =>
        set({ selectedId: id, fromRect: rect, phase: rect ? "opening" : "product", format: "hardcover", edges: "plain" }),
      switchBook: (id) => set({ selectedId: id }),
      closeBook: (rect) => set({ fromRect: rect, phase: "closing" }),
      setCurrentCollection: (currentCollection) => set({ currentCollection }),
    }),
    {
      name: "library-bag",
      // rehydrated after mount by <Providers/>, so server and client first render match
      skipHydration: true,
      partialize: (s) => ({ items: s.items, currency: s.currency }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => {
    const b = getBook(i.bookId);
    return b ? sum + unitPrice(b, i.format, i.edges) * i.qty : sum;
  }, 0);
