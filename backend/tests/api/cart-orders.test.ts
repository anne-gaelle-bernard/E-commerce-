import { beforeEach, describe, expect, it } from "vitest";
import { createProduct, createUser, loginAs, resetDatabase } from "../helpers.js";
import { prisma } from "../../src/lib/prisma.js";

beforeEach(resetDatabase);

const shipping = {
  fullName: "Camille Martin",
  street: "12 rue des Lilas",
  postalCode: "13001",
  city: "Marseille",
  country: "France",
};

const card = {
  holder: "Camille Martin",
  number: "4242 4242 4242 4242",
  expMonth: 12,
  expYear: new Date().getFullYear() + 2,
  cvc: "123",
};
const checkout = { shipping, card };

async function customer() {
  await createUser("client@test.fr");
  return loginAs("client@test.fr");
}

describe("panier", () => {
  it("ajoute un article, cumule les quantités et calcule le total", async () => {
    const product = await createProduct(5, 2500);
    const agent = await customer();
    const variantId = product.variants[0].id;

    await agent.post("/api/cart/items").send({ variantId, quantity: 1 }).expect(201);
    const res = await agent.post("/api/cart/items").send({ variantId, quantity: 2 }).expect(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.count).toBe(3);
    expect(res.body.totalCents).toBe(7500);
  });

  it("refuse une quantité supérieure au stock", async () => {
    const product = await createProduct(2);
    const agent = await customer();
    await agent.post("/api/cart/items").send({ variantId: product.variants[0].id, quantity: 3 }).expect(409);
  });

  it("modifie puis retire un article", async () => {
    const product = await createProduct(5);
    const agent = await customer();
    const variantId = product.variants[0].id;
    await agent.post("/api/cart/items").send({ variantId }).expect(201);
    const updated = await agent.patch(`/api/cart/items/${variantId}`).send({ quantity: 4 }).expect(200);
    expect(updated.body.count).toBe(4);
    const removed = await agent.delete(`/api/cart/items/${variantId}`).expect(200);
    expect(removed.body.items).toHaveLength(0);
  });
});

describe("commande", () => {
  it("transforme le panier en commande, décrémente le stock et vide le panier", async () => {
    const product = await createProduct(5, 3000);
    const agent = await customer();
    const variantId = product.variants[0].id;
    await agent.post("/api/cart/items").send({ variantId, quantity: 2 }).expect(201);

    const res = await agent.post("/api/orders").send(checkout).expect(201);
    expect(res.body.status).toBe("PAID");
    expect(res.body.shippingCents).toBe(590); // 60 € < seuil de livraison offerte
    expect(res.body.totalCents).toBe(6590);
    expect(res.body.items[0]).toMatchObject({ productName: product.name, quantity: 2, unitPriceCents: 3000 });

    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stock).toBe(3);
    const cart = await agent.get("/api/cart").expect(200);
    expect(cart.body.items).toHaveLength(0);
  });

  it("refuse une commande avec un panier vide", async () => {
    const agent = await customer();
    await agent.post("/api/orders").send(checkout).expect(400);
  });

  it("annule toute la commande si le stock est devenu insuffisant (transaction)", async () => {
    const productA = await createProduct(5);
    const productB = await createProduct(5);
    const agent = await customer();
    await agent.post("/api/cart/items").send({ variantId: productA.variants[0].id, quantity: 2 }).expect(201);
    await agent.post("/api/cart/items").send({ variantId: productB.variants[0].id, quantity: 2 }).expect(201);
    // Un autre client a acheté le produit B entre-temps.
    await prisma.productVariant.update({ where: { id: productB.variants[0].id }, data: { stock: 1 } });

    await agent.post("/api/orders").send(checkout).expect(409);

    const variantA = await prisma.productVariant.findUniqueOrThrow({ where: { id: productA.variants[0].id } });
    expect(variantA.stock).toBe(5); // rollback : le stock de A n'a pas bougé
    expect(await prisma.order.count()).toBe(0);
  });

  it("valide l'adresse de livraison", async () => {
    const agent = await customer();
    await agent.post("/api/orders").send({ shipping: { ...shipping, postalCode: "ABC" }, card }).expect(400);
  });

  it("empêche un client de lire la commande d'un autre (IDOR)", async () => {
    const product = await createProduct(5);
    const alice = await customer();
    await alice.post("/api/cart/items").send({ variantId: product.variants[0].id }).expect(201);
    const order = await alice.post("/api/orders").send(checkout).expect(201);

    await createUser("bob@test.fr");
    const bob = await loginAs("bob@test.fr");
    await bob.get(`/api/orders/${order.body.id}`).expect(404);
    await alice.get(`/api/orders/${order.body.id}`).expect(200);
  });
});

describe("paiement par carte (passerelle simulée)", () => {
  it("enregistre uniquement la marque et les 4 derniers chiffres de la carte", async () => {
    const product = await createProduct(5);
    const agent = await customer();
    await agent.post("/api/cart/items").send({ variantId: product.variants[0].id }).expect(201);

    const res = await agent.post("/api/orders").send(checkout).expect(201);
    expect(res.body).toMatchObject({ paymentBrand: "VISA", paymentLast4: "4242" });
    expect(res.body.paymentRef).toMatch(/^sim_/);

    const stored = JSON.stringify(await prisma.order.findMany({ include: { items: true } }));
    expect(stored).not.toContain("4242424242424242");
    expect(stored).not.toMatch(/cvc/i);
  });

  it.each([
    ["4000 0000 0000 0002", "refusé par la banque"],
    ["4000 0000 0000 9995", "fonds insuffisants"],
  ])("refuse la carte %s (402) sans créer de commande ni toucher au stock", async (number, message) => {
    const product = await createProduct(5);
    const agent = await customer();
    await agent.post("/api/cart/items").send({ variantId: product.variants[0].id, quantity: 2 }).expect(201);

    const res = await agent.post("/api/orders").send({ shipping, card: { ...card, number } }).expect(402);
    expect(res.body.error).toContain(message);

    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: product.variants[0].id } });
    expect(variant.stock).toBe(5);
    expect(await prisma.order.count()).toBe(0);
    const cart = await agent.get("/api/cart").expect(200);
    expect(cart.body.count).toBe(2); // le panier est conservé pour réessayer
  });

  it("rejette une carte invalide ou expirée (400)", async () => {
    const product = await createProduct(5);
    const agent = await customer();
    await agent.post("/api/cart/items").send({ variantId: product.variants[0].id }).expect(201);

    const badNumber = await agent.post("/api/orders").send({ shipping, card: { ...card, number: "4242 4242 4242 4241" } }).expect(400);
    expect(badNumber.body.details[0].field).toBe("card.number");
    const expired = await agent.post("/api/orders").send({ shipping, card: { ...card, expYear: 2020 } }).expect(400);
    expect(expired.body.details[0].message).toBe("Carte expirée");
  });
});

describe("gestion des commandes (admin)", () => {
  it("fait évoluer le statut et remet en stock en cas d'annulation", async () => {
    const product = await createProduct(5);
    const client = await customer();
    await client.post("/api/cart/items").send({ variantId: product.variants[0].id, quantity: 2 }).expect(201);
    const order = await client.post("/api/orders").send(checkout).expect(201);

    await client.patch(`/api/admin/orders/${order.body.id}/status`).send({ status: "SHIPPED" }).expect(403);

    await createUser("admin@test.fr", "ADMIN");
    const admin = await loginAs("admin@test.fr");
    await admin.patch(`/api/admin/orders/${order.body.id}/status`).send({ status: "CANCELLED" }).expect(200);
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: product.variants[0].id } });
    expect(variant.stock).toBe(5);

    await admin.patch(`/api/admin/orders/${order.body.id}/status`).send({ status: "SHIPPED" }).expect(400);
  });

  it("conserve les commandes quand le client supprime son compte", async () => {
    const product = await createProduct(5);
    const client = await customer();
    await client.post("/api/cart/items").send({ variantId: product.variants[0].id }).expect(201);
    await client.post("/api/orders").send(checkout).expect(201);
    await client.delete("/api/auth/me").send({ password: "Motdepasse123" }).expect(204);

    const orders = await prisma.order.findMany();
    expect(orders).toHaveLength(1);
    expect(orders[0].userId).toBeNull();
  });
});
