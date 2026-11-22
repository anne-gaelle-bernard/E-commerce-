"use client";

import Link from "next/link";
import { collections, formatPrice } from "@/data/catalog";
import { useStore } from "@/store/useStore";

/** Every book, shelf by shelf; each one opens in the 3D library. */
export function ShopGrid({ compact = false }: { compact?: boolean }) {
  const currency = useStore((s) => s.currency);
  return (
    <div className="flex flex-col gap-16">
      {collections.map((col, i) => (
        <section key={col.id} aria-labelledby={`col-${col.id}`}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-neutral-300 pb-4">
            <div>
              <p className="text-[12px] text-neutral-500">Room {String(i + 1).padStart(2, "0")}</p>
              <h2 id={`col-${col.id}`} className="mt-1 font-display text-[clamp(1.8rem,4vw,3rem)] uppercase leading-none">
                {col.name}
              </h2>
            </div>
            <p className="max-w-[44ch] text-sm text-neutral-600">{col.description}</p>
          </div>
          <ul className={`grid gap-x-5 gap-y-10 ${compact ? "grid-cols-3 min-[700px]:grid-cols-6" : "grid-cols-2 min-[700px]:grid-cols-3 min-[1100px]:grid-cols-6"}`}>
            {col.books.map((b) => (
              <li key={b.id}>
                <Link href={`/?b=${b.id}`} className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.cover}
                    alt={`${b.title} by ${b.author}`}
                    loading="lazy"
                    className="aspect-[2/3] w-full rounded-[2px] object-cover shadow-md transition group-hover:-translate-y-1"
                  />
                  <span className="mt-3 block text-[14px] font-medium">{b.title}</span>
                  <span className="block text-[13px] text-neutral-500">{b.author}</span>
                  <span className="block text-[13px] font-medium">{formatPrice(b.price, currency)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
