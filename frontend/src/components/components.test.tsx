import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { FormField } from "./FormField";
import type { Product } from "../api/types";

const product: Product = {
  id: 1,
  name: "Pull mérinos",
  slug: "pull-merinos",
  description: "Pull fin",
  priceCents: 7900,
  imageUrl: "https://example.com/pull.jpg",
  gender: "HOMME",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  categoryId: 1,
  category: { id: 1, name: "Pulls", slug: "pulls" },
  images: [
    { color: "Gris", url: "https://example.com/gris.jpg" },
    { color: "Bleu", url: "https://example.com/bleu.jpg" },
  ],
  variants: [
    { id: 1, size: "M", color: "Gris", stock: 0, productId: 1 },
    { id: 2, size: "L", color: "Bleu", stock: 0, productId: 1 },
  ],
};

describe("ProductCard", () => {
  it("affiche le nom, le lien, le nombre de coloris et le prix", () => {
    render(<ProductCard product={product} />, { wrapper: MemoryRouter });
    expect(screen.getByRole("link", { name: /Pull mérinos/ })).toHaveAttribute("href", "/produit/pull-merinos?couleur=Gris");
    expect(screen.getByLabelText(/2 coloris/)).toBeInTheDocument();
    expect(screen.getByText(/79,00/)).toBeInTheDocument();
  });

  it("change la photo et le lien quand on clique sur un coloris", () => {
    const { container } = render(<ProductCard product={product} />, { wrapper: MemoryRouter });
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/gris.jpg");
    fireEvent.click(screen.getByRole("button", { name: "Voir en Bleu" }));
    expect(container.querySelector("img")).toHaveAttribute("src", "https://example.com/bleu.jpg");
    expect(screen.getByRole("button", { name: "Voir en Bleu" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: /Pull mérinos/ })).toHaveAttribute("href", "/produit/pull-merinos?couleur=Bleu");
  });

  it("signale un produit épuisé", () => {
    render(<ProductCard product={product} />, { wrapper: MemoryRouter });
    expect(screen.getByText("Épuisé")).toBeInTheDocument();
  });
});

describe("FormField", () => {
  it("associe le libellé et le message d'erreur au champ (accessibilité)", () => {
    render(<FormField label="Email" error="Email invalide" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Email invalide");
  });
});
