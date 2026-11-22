import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Help | Lamplight" };

const FAQ = [
  { q: "How do I move through the gallery?", a: "Use the ← → buttons at the bottom of the screen, scroll with a mouse or trackpad, swipe on a phone, or press the arrow keys. Click a room name to jump to it, and click a book to see its details. Prefer a plain list? Open Shop." },
  { q: "What's the difference between the formats?", a: "Paperbacks are lightweight and affordable. Hardcovers are cloth-bound with a printed jacket and ribbon. Collector's editions add foil-stamped boards, a numbered bookplate and a slipcase." },
  { q: "How long does delivery take?", a: "Books ship within 1 to 2 working days. Shipping is free over €40." },
  { q: "Can I return a book?", a: "Unread books can be returned within 30 days." },
];

export default function HelpPage() {
  return (
    <PageShell eyebrow="Support" title="Help">
      <dl className="max-w-3xl divide-y divide-neutral-300 border-y border-neutral-300">
        {FAQ.map((f) => (
          <div key={f.q} className="py-6">
            <dt className="text-[15px] font-medium">{f.q}</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-neutral-600">{f.a}</dd>
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
