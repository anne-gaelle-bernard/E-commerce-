import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

export const app = createApp();
export const PASSWORD = "Motdepasse123";

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "order_items", "orders", "cart_items", "product_variants", "products", "categories", "users" RESTART IDENTITY CASCADE',
  );
}

export async function createUser(email: string, role: "CUSTOMER" | "ADMIN" = "CUSTOMER") {
  return prisma.user.create({
    data: { email, passwordHash: await bcrypt.hash(PASSWORD, 4), firstName: "Test", lastName: "User", role },
  });
}

export async function loginAs(email: string) {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send({ email, password: PASSWORD }).expect(200);
  return agent;
}

export async function createProduct(stock = 5, priceCents = 2500) {
  const category = await prisma.category.upsert({
    where: { slug: "t-shirts" },
    update: {},
    create: { name: "T-shirts", slug: "t-shirts" },
  });
  return prisma.product.create({
    data: {
      name: `Produit ${Math.random().toString(36).slice(2, 8)}`,
      slug: `produit-${Math.random().toString(36).slice(2, 10)}`,
      description: "Un produit de test bien décrit.",
      priceCents,
      imageUrl: "https://example.com/image.jpg",
      gender: "UNISEXE",
      categoryId: category.id,
      variants: { create: [{ size: "M", color: "Noir", stock }] },
    },
    include: { variants: true, category: true },
  });
}
