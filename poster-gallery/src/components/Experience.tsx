"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { getBook } from "@/data/catalog";
import { bookItem, cameraSFor } from "@/lib/corridor";
import { bookRects, nav } from "@/lib/nav";
import { stageRect } from "@/lib/stage";
import { useStore, type Rect } from "@/store/useStore";
import { CollectionLabel } from "./CollectionLabel";
import { ProductPanel } from "./ProductPanel";

const Gallery3D = dynamic(() => import("./gallery/Gallery3D"), {
  ssr: false,
  loading: () => <p className="absolute inset-0 grid place-items-center text-sm text-neutral-500">Loading the gallery</p>,
});

const DURATION = 0.7;

const place = (el: HTMLElement, r: Rect) => gsap.set(el, { x: r.x, y: r.y, width: r.width, height: r.height });

/** Moves the camera so a book is in view (deep links and in-panel navigation). */
function focusBook(id: string, instant = false) {
  const item = bookItem(id);
  if (!item) return;
  if (instant) nav.jump(cameraSFor(item.s));
  else nav.target = cameraSFor(item.s);
}

export function Experience() {
  const phase = useStore((s) => s.phase);
  const selectedId = useStore((s) => s.selectedId);
  const canvas = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const book = getBook(selectedId);

  // The home page is a fixed, full-screen experience.
  useEffect(() => {
    document.documentElement.classList.add("no-scroll");
    return () => document.documentElement.classList.remove("no-scroll");
  }, []);

  // Deep link (?b=id) on first load, and browser back/forward.
  useEffect(() => {
    const syncFromUrl = () => {
      const id = new URLSearchParams(window.location.search).get("b");
      const { phase, selectedId, openBook, closeBook } = useStore.getState();
      if (id && getBook(id)) {
        if (id !== selectedId || phase === "gallery") {
          focusBook(id, true);
          openBook(id, null);
        }
      } else if (phase === "product") {
        closeBook(selectedId ? (bookRects.get(selectedId)?.() ?? null) : null);
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Keep the URL in step with the product view (so it can be shared and the back button works).
  useEffect(() => {
    const current = new URLSearchParams(window.location.search).get("b");
    if ((phase === "opening" || phase === "product") && selectedId && current !== selectedId) {
      window.history.pushState(null, "", `/?b=${selectedId}`);
    } else if (phase === "gallery" && current) {
      window.history.pushState(null, "", "/");
    }
  }, [phase, selectedId]);

  // Opening / closing: the cover moves between the shelf and the product view.
  useLayoutEffect(() => {
    const el = art.current;
    if (!el || !book) return;
    const target = stageRect();
    const { fromRect, setPhase } = useStore.getState();

    if (phase === "opening") {
      gsap.killTweensOf([el, canvas.current, veil.current]);
      if (fromRect) place(el, fromRect);
      gsap.set(el, { autoAlpha: 1 });
      gsap.to(el, { ...target, duration: DURATION, ease: "power2.inOut", onComplete: () => setPhase("product") });
      gsap.to(canvas.current, { filter: "blur(8px)", duration: DURATION });
      gsap.to(veil.current, { autoAlpha: 1, duration: DURATION });
    }

    if (phase === "product") {
      gsap.set(veil.current, { autoAlpha: 1 });
      gsap.set(canvas.current, { filter: "blur(8px)" });
      if (gsap.getProperty(el, "opacity") === 0) {
        place(el, target);
        gsap.to(el, { autoAlpha: 1, duration: 0.35 });
      }
    }

    if (phase === "closing") {
      gsap.killTweensOf([el, canvas.current, veil.current]);
      const finish = () => {
        gsap.set(el, { autoAlpha: 0 });
        useStore.setState({ phase: "gallery", selectedId: null, fromRect: null });
      };
      if (fromRect) {
        gsap.timeline({ onComplete: finish }).to(el, { ...fromRect, duration: DURATION, ease: "power2.inOut" }).to(el, { autoAlpha: 0, duration: 0.15 });
      } else {
        gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: finish });
      }
      gsap.to(canvas.current, { filter: "blur(0px)", duration: DURATION, clearProps: "filter" });
      gsap.to(veil.current, { autoAlpha: 0, duration: DURATION });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Another book chosen from the panel: move the camera to it behind the blur.
  useEffect(() => {
    if (phase === "product" && book) focusBook(book.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Keep the cover in place on resize.
  useEffect(() => {
    const onResize = () => {
      if (useStore.getState().phase === "product" && art.current) place(art.current, stageRect());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 top-11 overflow-hidden bg-[#f2f2f2]">
      <div ref={canvas} className="absolute inset-0">
        <Gallery3D />
      </div>

      <div ref={veil} className="invisible absolute inset-0 opacity-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[#f2f2f2]/85" />
        <div className="absolute left-0 top-0 h-[52vh] w-full bg-[#e8e7e4] min-[900px]:bottom-0 min-[900px]:h-auto min-[900px]:w-1/2" />
      </div>

      {/* the cover that moves between the shelf and the product view */}
      <div ref={art} className="invisible pointer-events-none fixed left-0 top-0 z-20 opacity-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)]">
        {book && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={book.id} src={book.cover} alt={`${book.title} by ${book.author}`} className="block h-full w-full rounded-[2px] object-fill" />
        )}
      </div>

      <CollectionLabel hidden={phase !== "gallery"} />
      {/* keyed by book so quantity and scroll reset when another title is chosen */}
      {book && <ProductPanel key={book.id} book={book} visible={phase === "product"} mounted={phase !== "gallery"} />}
    </div>
  );
}
