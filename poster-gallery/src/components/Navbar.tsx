"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice, getCollection, searchBooks } from "@/data/catalog";
import { bookItem, cameraSFor } from "@/lib/corridor";
import { nav } from "@/lib/nav";
import { cartCount, useStore } from "@/store/useStore";
import { useHydrated } from "./Providers";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/info", label: "Info" },
  { href: "/archive", label: "Archive" },
  { href: "/help", label: "Help" },
];

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function SearchPill() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currency = useStore((s) => s.currency);
  const results = searchBooks(query).slice(0, 6);

  useEffect(() => {
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  const choose = (id: string) => {
    setOpen(false);
    setQuery("");
    if (pathname === "/") {
      const item = bookItem(id);
      if (item) nav.jump(cameraSFor(item.s));
      useStore.getState().openBook(id, null);
    } else {
      router.push(`/?b=${id}`);
    }
  };

  return (
    <div ref={box} className="relative max-[700px]:hidden">
      <label className="flex h-8 items-center gap-2 rounded-full bg-neutral-100 px-3 focus-within:ring-1 focus-within:ring-neutral-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="sr-only">Search books</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && results[0] && choose(results[0].id)}
          placeholder="Search by title or author"
          className="w-32 bg-transparent text-[13px] outline-none placeholder:text-neutral-500 min-[1000px]:w-44"
        />
      </label>
      {open && query && (
        <ul className="absolute right-0 top-10 w-80 overflow-hidden rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-neutral-500">No book found for &quot;{query}&quot;.</li>}
          {results.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => choose(b.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.cover} alt="" className="h-12 w-8 rounded-[1px_2px_2px_1px] object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{b.title}</span>
                  <span className="block truncate text-[12px] text-neutral-500">
                    {b.author}, {getCollection(b.collection).name}
                  </span>
                </span>
                <span className="text-[13px]">{formatPrice(b.price, currency)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const items = useStore((s) => s.items);
  const currency = useStore((s) => s.currency);
  const toggleCurrency = useStore((s) => s.toggleCurrency);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const count = hydrated ? cartCount(items) : 0;

  const goHome = (e: React.MouseEvent) => {
    // On the home page, "Home" walks back to the entrance (and closes an open book).
    if (pathname !== "/") return;
    e.preventDefault();
    const { phase, closeBook } = useStore.getState();
    if (phase === "product") closeBook(null);
    nav.target = 0;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-11 border-b border-neutral-200 bg-white">
      <div className="flex h-full items-center gap-6 px-4 text-[13px]">
        <Link href="/" onClick={goHome} className="flex items-center gap-2" aria-label="Lamplight, home">
          <Logo />
          <span className="font-display text-[17px] uppercase tracking-[0.04em] max-[500px]:hidden">Lamplight</span>
        </Link>
        <nav aria-label="Main" className="flex items-center max-[400px]:hidden">
          {LINKS.map((l, i) => (
            <span key={l.href} className={`flex items-center px-1 ${i > 2 ? "max-[700px]:hidden" : ""}`}>
              <Link
                href={l.href}
                onClick={l.href === "/" ? goHome : undefined}
                className={`px-1 transition hover:text-neutral-950 ${pathname === l.href ? "font-medium text-neutral-950" : "text-neutral-500"}`}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchPill />
          <button
            type="button"
            onClick={toggleCurrency}
            className="h-8 rounded-full border border-neutral-300 px-3 transition hover:border-neutral-950"
            aria-label={`Currency: ${currency}. Switch currency`}
          >
            {hydrated && currency === "GBP" ? "£ GBP" : "€ EUR"}
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="h-8 rounded-full bg-neutral-950 px-4 font-medium text-white transition hover:bg-neutral-700"
          >
            Bag ({count})
          </button>
        </div>
      </div>
    </header>
  );
}
