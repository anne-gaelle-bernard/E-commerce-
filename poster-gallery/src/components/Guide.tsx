"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    title: "Walk through the gallery",
    text: "Use the arrow buttons at the bottom of the screen. You can also scroll with your mouse, swipe on a phone, or press the arrow keys.",
  },
  {
    title: "Change room",
    text: "Each room is a collection. Click a room name in the bottom bar to go straight to it.",
  },
  {
    title: "Look at a book",
    text: "Point at a book to lift it, then click it to open its page. There you can pick a format and add it to your bag.",
  },
  {
    title: "Go back",
    text: "Click Back to the gallery, or press Esc. You return to the same spot.",
  },
  {
    title: "Prefer a list?",
    text: "Open Shop in the menu to see every book in a simple grid.",
  },
];

/** "How to visit" dialog. Shown on the first visit and from the ? button. */
export function Guide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    button.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="max-h-[90dvh] w-full max-w-[460px] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="guide-title" className="font-display text-3xl uppercase">
          How to visit
        </h2>
        <ol className="mt-5 flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-neutral-950 text-[13px] font-semibold text-white">{i + 1}</span>
              <span>
                <strong className="block text-[15px] font-semibold">{s.title}</strong>
                <span className="text-[14px] leading-relaxed text-neutral-600">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <button
          ref={button}
          type="button"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-full bg-neutral-950 text-[14px] font-semibold text-white hover:bg-neutral-700"
        >
          Start the visit
        </button>
        <p className="mt-3 text-center text-[13px] text-neutral-500">You can open this again with the ? button.</p>
      </div>
    </div>
  );
}
