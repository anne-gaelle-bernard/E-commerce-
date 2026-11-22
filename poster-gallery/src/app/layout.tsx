import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Lamplight bookshop",
  description: "Walk through a simple 3D gallery of books and order the ones you like.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} antialiased`}>
      <body className="min-h-dvh bg-[#f2f2f2] font-sans text-neutral-950">
        <Providers>
          <Navbar />
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
