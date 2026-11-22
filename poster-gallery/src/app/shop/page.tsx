import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { ShopGrid } from "@/components/ShopGrid";

export const metadata: Metadata = { title: "Shop | Lamplight" };

export default function ShopPage() {
  return (
    <PageShell eyebrow="Every book on every shelf" title="Shop">
      <ShopGrid />
    </PageShell>
  );
}
