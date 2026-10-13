import { describe, expect, it } from "vitest";
import { passwordSchema, registerSchema } from "../../src/modules/auth/auth.schemas.js";
import { productSchema } from "../../src/modules/products/products.schemas.js";
import { slugify } from "../../src/lib/slug.js";

describe("politique de mot de passe", () => {
  it.each(["court1A", "toutenminuscule1", "TOUTENMAJUSCULE1", "SansChiffreIci"])("refuse %s", (pwd) => {
    expect(passwordSchema.safeParse(pwd).success).toBe(false);
  });
  it("accepte un mot de passe robuste", () => {
    expect(passwordSchema.safeParse("Robuste12345").success).toBe(true);
  });
});

describe("inscription", () => {
  it("normalise l'email en minuscules", () => {
    const data = registerSchema.parse({
      email: "  Camille@Exemple.FR ",
      password: "Robuste12345",
      firstName: "Camille",
      lastName: "Martin",
    });
    expect(data.email).toBe("camille@exemple.fr");
  });
});

describe("produit", () => {
  const base = {
    name: "T-shirt",
    description: "Une description assez longue",
    priceCents: 2500,
    imageUrl: "https://example.com/a.jpg",
    gender: "UNISEXE",
    categoryId: 1,
  };
  it("refuse deux déclinaisons identiques", () => {
    const result = productSchema.safeParse({
      ...base,
      variants: [
        { size: "M", color: "Noir", stock: 1 },
        { size: "M", color: "Noir", stock: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });
  it("refuse un prix négatif", () => {
    const result = productSchema.safeParse({ ...base, priceCents: -1, variants: [{ size: "M", color: "Noir", stock: 1 }] });
    expect(result.success).toBe(false);
  });
});

describe("slugify", () => {
  it("retire accents et caractères spéciaux", () => {
    expect(slugify("Écharpe en laine d'agneau !")).toBe("echarpe-en-laine-d-agneau");
  });
});
