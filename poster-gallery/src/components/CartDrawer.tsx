"use client";

import { useEffect, useRef, useState } from "react";
import { FORMATS, formatPrice, getBook, unitPrice } from "@/data/catalog";
import { cartCount, cartSubtotal, useStore } from "@/store/useStore";
import { useHydrated } from "./Providers";

const FREE_SHIPPING = 40;

export function CartDrawer() {
  const hydrated = useHydrated();
  const { cartOpen, setQty, removeItem, currency } = useStore();
  const storeItems = useStore((s) => s.items);
  const items = hydrated ? storeItems : [];
  const panel = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const subtotal = cartSubtotal(items);

  const setCartOpen = (open: boolean) => {
    if (!open) setMessage("");
    useStore.getState().setCartOpen(open);
  };

  useEffect(() => {
    if (!cartOpen) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMessage("");
      useStore.getState().setCartOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${cartOpen ? "" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${cartOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setCartOpen(false)}
      />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-white outline-none transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${cartOpen ? "visible translate-x-0 shadow-2xl" : "invisible translate-x-full"}`}
      >
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 px-5">
          <h2 className="text-[17px] font-semibold">Your bag ({cartCount(items)})</h2>
          <button type="button" onClick={() => setCartOpen(false)} className="text-[13px] text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline">
            Close
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-xl font-semibold">Your bag is empty</p>
            <p className="text-sm text-neutral-500">Click a book in the gallery to add it.</p>
            <button type="button" onClick={() => setCartOpen(false)} className="mt-3 rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-neutral-700">
              Keep browsing
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto px-5">
              {items.map((item) => {
                const b = getBook(item.bookId);
                if (!b) return null;
                const format = FORMATS.find((f) => f.id === item.format)!;
                return (
                  <li key={item.key} className="flex gap-4 py-4">
                    <span className="relative h-24 w-16 flex-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.cover} alt="" className="h-full w-full rounded-[1px_3px_3px_1px] object-cover shadow-lg" />
                                          </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-[14px] font-medium">{b.title}</p>
                      <p className="text-[13px] text-neutral-500">{format.label}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-neutral-300" role="group" aria-label={`Quantity of ${b.title}`}>
                          <button type="button" className="h-7 w-7 disabled:opacity-30" disabled={item.qty <= 1} onClick={() => setQty(item.key, item.qty - 1)} aria-label="Decrease">−</button>
                          <span className="w-5 text-center text-[13px] font-semibold">{item.qty}</span>
                          <button type="button" className="h-7 w-7" onClick={() => setQty(item.key, item.qty + 1)} aria-label="Increase">+</button>
                        </div>
                        <span className="text-[14px] font-semibold">{formatPrice(unitPrice(b, item.format, item.edges) * item.qty, currency)}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(item.key)} className="self-start text-[12px] text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline" aria-label={`Remove ${b.title}`}>
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
            <footer className="border-t border-neutral-200 p-5">
              <div className="mb-1 h-1 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-neutral-950 transition-[width] duration-500" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
              </div>
              <p className="mb-4 text-[13px] text-neutral-500">
                {subtotal >= FREE_SHIPPING ? "Free shipping unlocked." : `${formatPrice(FREE_SHIPPING - subtotal, currency)} away from free shipping.`}
              </p>
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-[14px] font-medium">Subtotal</span>
                <span className="text-xl font-semibold">{formatPrice(subtotal, currency)}</span>
              </div>
              <button
                type="button"
                onClick={() => setMessage("This is a demo store. Checkout is not available.")}
                className="h-12 w-full rounded-full bg-neutral-950 text-[14px] font-semibold text-white hover:bg-neutral-700"
              >
                Checkout
              </button>
              {message && <p className="mt-3 text-center text-[13px] text-neutral-500" role="status">{message}</p>}
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
