import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { conflict, notFound, unauthorized } from "../../lib/http-error.js";
import type { z } from "zod";
import type { loginSchema, registerSchema, updateProfileSchema } from "./auth.schemas.js";

const BCRYPT_ROUNDS = 12;

export function toPublicUser(user: User) {
  const { passwordHash: _hash, ...publicUser } = user;
  return publicUser;
}

export async function register(data: z.infer<typeof registerSchema>) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw conflict("Un compte existe déjà avec cet email");

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash, firstName: data.firstName, lastName: data.lastName },
  });
  return toPublicUser(user);
}

export async function login(data: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  // même message dans les deux cas pour ne pas révéler les emails existants
  const valid = user && (await bcrypt.compare(data.password, user.passwordHash));
  if (!user || !valid) throw unauthorized("Email ou mot de passe incorrect");
  return toPublicUser(user);
}

export async function getUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound("Utilisateur introuvable");
  return toPublicUser(user);
}

export async function updateProfile(id: number, data: z.infer<typeof updateProfileSchema>) {
  const user = await prisma.user.update({ where: { id }, data });
  return toPublicUser(user);
}

// RGPD : les commandes sont gardées (compta) mais détachées du compte (onDelete: SetNull)
export async function deleteAccount(id: number, password: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized("Mot de passe incorrect");
  }
  await prisma.user.delete({ where: { id } });
}

export async function exportData(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { orders: { include: { items: true } }, cartItems: true },
  });
  if (!user) throw notFound("Utilisateur introuvable");
  return toPublicUser(user);
}
