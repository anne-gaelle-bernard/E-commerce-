"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collections } from "@/data/catalog";
import { layout } from "@/lib/corridor";
import { nav } from "@/lib/nav";
import { useStore } from "@/store/useStore";
import { Guide } from "./Guide";

const GUIDE_KEY = "lamplight-guide-seen";

const bookStops = layout.items.filter((i) => i.kind === "book").map((i) => i.s - 2.9);
const roomStarts = layout.sections.map((s) => Math.max(0, s.start - 1));

/** Step to the previous or next book from where the visitor is. */
function step(dir: 1 | -1) {
  const here = nav.target;
  const next = dir === 1 ? bookStops.find((s) => s > here + 0.2) : [...bookStops].reverse().find((s) => s < here - 0.2);
  nav.target = Math.max(0, next ?? (dir === 1 ? here : 0));
}

/**
 * Bottom bar: current room, room shortcuts, previous and next buttons, and a link
 * to the list view.
 */
export function CollectionLabel({ hidden }: { hidden: boolean }) {
  const current = useStore((s) => s.currentCollection);
  const index = collections.findIndex((c) => c.id === current);
  const [guideOpen, setGuideOpen] = useState(false);

  // first visit: show the "How to visit" guide once the gallery has appeared
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(GUIDE_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = window.setTimeout(() => setGuideOpen(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const closeGuide = () => {
    setGuideOpen(false);
    try {
      localStorage.setItem(GUIDE_KEY, "1");
    } catch {}
  };

  return (
    <>
      <Guide open={guideOpen} onClose={closeGuide} />
      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-4 transition-opacity duration-300 ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <div className="flex w-full max-w-[760px] flex-col items-center gap-2">
          <p className="rounded-full bg-white/90 px-4 py-1.5 text-[12px] text-neutral-700 shadow-sm" aria-live="polite">
            {index >= 0 ? (
              <>
                Room {index + 1}: <strong className="font-semibold text-neutral-950">{collections[index].name}</strong>
              </>
            ) : (
              "Use the arrows below to walk. Click a book to see it."
            )}
          </p>
  
          <nav aria-label="Gallery controls" className="flex w-full items-center gap-2 rounded-full bg-white p-1.5 shadow-md">
            <button type="button" onClick={() => step(-1)} className="nav-btn" aria-label="Previous book">
              ←
            </button>
            <div className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
              {collections.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => (nav.target = roomStarts[i])}
                  aria-current={i === index ? "true" : undefined}
                  className={`flex-none whitespace-nowrap rounded-full px-3 py-2 text-[12px] font-medium transition ${
                    i === index ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => step(1)} className="nav-btn" aria-label="Next book">
              →
            </button>
            <Link href="/shop" className="hidden flex-none rounded-full px-3 py-2 text-[12px] font-medium text-neutral-600 underline-offset-4 hover:underline min-[700px]:block">
              View as list
            </Link>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="grid h-10 w-10 flex-none place-items-center rounded-full border border-neutral-300 text-[15px] font-semibold hover:border-neutral-950"
              aria-label="How to visit"
              title="How to visit"
            >
              ?
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
