import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ShopGrid } from "@/components/ShopGrid";

export const metadata: Metadata = { title: "Archive | Lamplight" };

export default function ArchivePage() {
  return (
    <PageShell eyebrow="Past and present shelves" title="Archive">
      <ShopGrid compact />
    </PageShell>
  );
}
