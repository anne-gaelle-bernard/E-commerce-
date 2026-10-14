import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createProduct, createUser, loginAs, resetDatabase } from "../helpers.js";
import { prisma } from "../../src/lib/prisma.js";

beforeEach(resetDatabase);

describe("catalogue public", () => {
  it("liste les produits actifs avec pagination", async () => {
    await createProduct();
    const archived = await createProduct();
    await prisma.product.update({ where: { id: archived.id }, data: { isActive: false } });

    const res = await request(app).get("/api/products").expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].variants).toHaveLength(1);
    expect(res.body.pages).toBe(1);
  });

  it("filtre par prix et trie par prix croissant", async () => {
    await createProduct(5, 5000);
    await createProduct(5, 1000);
    await createProduct(5, 9000);
    const res = await request(app).get("/api/products?maxPrice=6000&sort=price_asc").expect(200);
    expect(res.body.items.map((p: { priceCents: number }) => p.priceCents)).toEqual([1000, 5000]);
  });

  it("le filtre par taille ignore les déclinaisons épuisées", async () => {
    await createProduct(0);
    const res = await request(app).get("/api/products?size=M").expect(200);
    expect(res.body.total).toBe(0);
  });

  it("refuse des paramètres de requête invalides", async () => {
    await request(app).get("/api/products?sort=hack").expect(400);
  });

  it("renvoie 404 pour un produit archivé", async () => {
    const product = await createProduct();
    await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });
    await request(app).get(`/api/products/${product.slug}`).expect(404);
  });
});

describe("gestion des produits (admin)", () => {
  const payload = (categoryId: number) => ({
    name: "Pull mérinos",
    description: "Pull fin en laine mérinos",
    priceCents: 7900,
    imageUrl: "https://example.com/pull.jpg",
    gender: "HOMME",
    categoryId,
    variants: [
      { size: "M", color: "Gris", stock: 3 },
      { size: "L", color: "Gris", stock: 2 },
    ],
  });

  it("interdit la création à un client (403) et à un visiteur (401)", async () => {
    const { category } = await createProduct();
    await createUser("client@test.fr");
    const client = await loginAs("client@test.fr");
    await client.post("/api/products").send(payload(category.id)).expect(403);
    await request(app).post("/api/products").send(payload(category.id)).expect(401);
  });

  it("crée un produit avec un slug unique puis synchronise ses déclinaisons", async () => {
    const { category } = await createProduct();
    await createUser("admin@test.fr", "ADMIN");
    const admin = await loginAs("admin@test.fr");

    const created = await admin.post("/api/products").send(payload(category.id)).expect(201);
    expect(created.body.slug).toBe("pull-merinos");
    const second = await admin.post("/api/products").send(payload(category.id)).expect(201);
    expect(second.body.slug).toBe("pull-merinos-2");

    const updated = await admin
      .put(`/api/products/${created.body.id}`)
      .send({ ...payload(category.id), variants: [{ size: "M", color: "Gris", stock: 10 }, { size: "S", color: "Gris", stock: 1 }] })
      .expect(200);
    const variants = updated.body.variants.map((v: { size: string; stock: number }) => `${v.size}:${v.stock}`);
    expect(variants.sort()).toEqual(["M:10", "S:1"]);
  });

  it("enregistre une photo par couleur et les remplace à la modification", async () => {
    const { category } = await createProduct();
    await createUser("admin@test.fr", "ADMIN");
    const admin = await loginAs("admin@test.fr");
    const body = {
      ...payload(category.id),
      variants: [
        { size: "M", color: "Gris", stock: 3 },
        { size: "M", color: "Noir", stock: 2 },
      ],
      images: [
        { color: "Gris", url: "https://example.com/gris.jpg" },
        { color: "Noir", url: "https://example.com/noir.jpg" },
      ],
    };
    const created = await admin.post("/api/products").send(body).expect(201);
    expect(created.body.images.map((i: { color: string }) => i.color).sort()).toEqual(["Gris", "Noir"]);

    const updated = await admin
      .put(`/api/products/${created.body.id}`)
      .send({ ...body, images: [{ color: "Noir", url: "https://example.com/noir-2.jpg" }] })
      .expect(200);
    expect(updated.body.images).toHaveLength(1);
    expect(updated.body.images[0].url).toBe("https://example.com/noir-2.jpg");

    const publicView = await request(app).get(`/api/products/${created.body.slug}`).expect(200);
    expect(publicView.body.images).toHaveLength(1);
  });

  it("refuse une photo pour une couleur qui n'existe pas", async () => {
    const { category } = await createProduct();
    await createUser("admin@test.fr", "ADMIN");
    const admin = await loginAs("admin@test.fr");
    const res = await admin
      .post("/api/products")
      .send({ ...payload(category.id), images: [{ color: "Rouge", url: "https://example.com/rouge.jpg" }] })
      .expect(400);
    expect(res.body.details[0].field).toBe("images");
  });

  it("archive un produit au lieu de le supprimer", async () => {
    const product = await createProduct();
    await createUser("admin@test.fr", "ADMIN");
    const admin = await loginAs("admin@test.fr");
    await admin.delete(`/api/products/${product.id}`).expect(204);
    const stored = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(stored.isActive).toBe(false);
  });
});
