import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Info | Lamplight" };

export default function InfoPage() {
  return (
    <PageShell eyebrow="About" title="A bookshop you can walk through">
      <div className="grid max-w-5xl gap-10 text-[15px] leading-relaxed text-neutral-700 min-[800px]:grid-cols-2">
        <p>
          Lamplight is an independent bookshop. You can browse the books in a 3D gallery, room by room, or as a simple
          list on the Shop page. Each room has its own theme: science fiction, crime, poetry and nature.
        </p>
        <p>
          Every title is available as a paperback, a cloth hardcover or a collector&apos;s edition with foil-stamped boards
          and a slipcase.
        </p>
      </div>
    </PageShell>
  );
}
