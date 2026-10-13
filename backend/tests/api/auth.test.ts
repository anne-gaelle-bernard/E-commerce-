import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createUser, loginAs, PASSWORD, resetDatabase } from "../helpers.js";
import { prisma } from "../../src/lib/prisma.js";

beforeEach(resetDatabase);

describe("POST /api/auth/register", () => {
  it("crée un compte, hache le mot de passe et ouvre une session", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@test.fr", password: "Robuste12345", firstName: "Léa", lastName: "Durand" })
      .expect(201);

    expect(res.body).toMatchObject({ email: "new@test.fr", role: "CUSTOMER" });
    expect(res.body.passwordHash).toBeUndefined();
    const cookie = res.headers["set-cookie"][0];
    expect(cookie).toMatch(/token=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: "new@test.fr" } });
    expect(user.passwordHash).not.toBe("Robuste12345");
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("ignore un rôle envoyé par le client (pas d'élévation de privilèges)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "pirate@test.fr", password: "Robuste12345", firstName: "A", lastName: "B", role: "ADMIN" })
      .expect(201);
    expect(res.body.role).toBe("CUSTOMER");
  });

  it("refuse un email déjà utilisé", async () => {
    await createUser("dup@test.fr");
    await request(app)
      .post("/api/auth/register")
      .send({ email: "dup@test.fr", password: "Robuste12345", firstName: "A", lastName: "B" })
      .expect(409);
  });

  it("refuse un mot de passe faible avec le détail de l'erreur", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "weak@test.fr", password: "123", firstName: "A", lastName: "B" })
      .expect(400);
    expect(res.body.details[0].field).toBe("password");
  });
});

describe("POST /api/auth/login", () => {
  it("connecte avec les bons identifiants", async () => {
    await createUser("camille@test.fr");
    const agent = await loginAs("camille@test.fr");
    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.email).toBe("camille@test.fr");
  });

  it("renvoie le même message que l'email existe ou non", async () => {
    await createUser("camille@test.fr");
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: "camille@test.fr", password: "Mauvais12345" })
      .expect(401);
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "inconnu@test.fr", password: "Mauvais12345" })
      .expect(401);
    expect(wrongPassword.body.error).toBe(unknownEmail.body.error);
  });
});

describe("session", () => {
  it("refuse /me sans cookie", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });

  it("refuse un jeton falsifié", async () => {
    await request(app).get("/api/auth/me").set("Cookie", "token=eyJhbGciOiJIUzI1NiJ9.e30.faux").expect(401);
  });

  it("déconnecte en supprimant le cookie", async () => {
    await createUser("camille@test.fr");
    const agent = await loginAs("camille@test.fr");
    await agent.post("/api/auth/logout").expect(204);
    await agent.get("/api/auth/me").expect(401);
  });
});

describe("RGPD", () => {
  it("exporte les données personnelles sans le hash", async () => {
    await createUser("camille@test.fr");
    const agent = await loginAs("camille@test.fr");
    const res = await agent.get("/api/auth/me/export").expect(200);
    expect(res.body.email).toBe("camille@test.fr");
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.orders).toEqual([]);
  });

  it("supprime le compte après confirmation du mot de passe", async () => {
    await createUser("camille@test.fr");
    const agent = await loginAs("camille@test.fr");
    await agent.delete("/api/auth/me").send({ password: "Mauvais12345" }).expect(401);
    await agent.delete("/api/auth/me").send({ password: PASSWORD }).expect(204);
    expect(await prisma.user.count()).toBe(0);
  });
});
