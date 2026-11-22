"use client";

import { useEffect, useState } from "react";
import { FORMATS, formatPrice, getCollection, unitPrice, type Book } from "@/data/catalog";
import { bookRects } from "@/lib/nav";
import { useStore } from "@/store/useStore";

const ACCORDION = [
  { title: "Details", body: (b: Book) => `${b.pages} pages, published ${b.year}. Hardcovers are cloth-bound with a dust jacket; collector's editions add a slipcase.` },
  { title: "Shipping", body: () => "Ships in 1 to 2 working days. Free shipping on orders over €40." },
  { title: "Returns", body: () => "Return any unread book within 30 days for a full refund." },
];

export function ProductPanel({ book, visible, mounted }: { book: Book; visible: boolean; mounted: boolean }) {
  const { currency, format, setFormat, addItem, switchBook, closeBook } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const collection = getCollection(book.collection);
  const others = collection.books.filter((b) => b.id !== book.id);
  const price = unitPrice(book, format, "plain");

  const close = () => {
    if (useStore.getState().phase !== "product") return;
    closeBook(bookRects.get(book.id)?.() ?? null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !useStore.getState().cartOpen && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!mounted) return null;

  const add = () => {
    addItem(book.id, format, "plain", qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <section
      aria-label={`${book.title} details`}
      className={`fixed z-30 overflow-y-auto transition-all duration-500 ease-out
        inset-x-0 bottom-0 top-[calc(44px+52vh)] px-5 pb-10 pt-5
        min-[900px]:left-1/2 min-[900px]:top-11 min-[900px]:px-[6vw] min-[900px]:pb-16 min-[900px]:pt-[5vh]
        ${visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"}`}
    >
      <div className="mx-auto max-w-[480px]">
        <button
          type="button"
          onClick={close}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-[13px] font-medium transition hover:border-neutral-950"
        >
          <span aria-hidden="true">←</span> Back to the gallery
        </button>

        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-500">{collection.name}</p>
        <h1 className="mt-2 font-display text-[clamp(2.4rem,4.5vw,3.8rem)] uppercase leading-[0.95] text-neutral-950">{book.title}</h1>
        <p className="mt-2 text-[15px] text-neutral-600">by {book.author}</p>
        <p className="mt-4 text-2xl font-semibold text-neutral-950">{formatPrice(price * qty, currency)}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">{book.description}</p>

        <fieldset className="mt-7">
          <legend className="mb-2 text-[13px] font-medium">Format</legend>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <button key={f.id} type="button" aria-pressed={format === f.id} onClick={() => setFormat(f.id)} className={`chip ${format === f.id ? "chip-active" : ""}`}>
                {f.label}
                <span className="ml-2 opacity-60">{formatPrice(unitPrice(book, f.id, "plain"), currency)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex items-stretch gap-3">
          <div className="flex items-center rounded-full border border-neutral-300 bg-white" role="group" aria-label="Quantity">
            <button type="button" className="h-12 w-11 text-lg disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
            <span className="w-6 text-center text-[15px] font-semibold" aria-live="polite">{qty}</span>
            <button type="button" className="h-12 w-11 text-lg" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">+</button>
          </div>
          <button
            type="button"
            onClick={add}
            className="flex-1 rounded-full bg-neutral-950 px-6 text-[14px] font-semibold text-white transition hover:bg-neutral-700"
          >
            {added ? "Added to your bag ✓" : "Add to bag"}
          </button>
        </div>

        <div className="mt-8 border-t border-neutral-300">
          {ACCORDION.map((a) => (
            <details key={a.title} className="group border-b border-neutral-300">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[14px] font-medium">
                {a.title}
                <span aria-hidden="true" className="transition group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-[14px] leading-relaxed text-neutral-600">{a.body(book)}</p>
            </details>
          ))}
        </div>

        {others.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-[13px] font-medium">More from {collection.name}</h2>
            <ul className="grid grid-cols-3 gap-3 min-[1300px]:grid-cols-5">
              {others.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => switchBook(b.id)} className="group block w-full text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.cover} alt="" loading="lazy" className="aspect-[2/3] w-full rounded-[2px] object-cover shadow-sm transition group-hover:-translate-y-1" />
                    <span className="mt-1.5 block truncate text-[12px] font-medium">{b.title}</span>
                    <span className="block text-[12px] text-neutral-500">{formatPrice(b.price, currency)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
