import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères")
  .max(100)
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide").max(255),
  password: passwordSchema,
  firstName: z.string().trim().min(1, "Prénom requis").max(100),
  lastName: z.string().trim().min(1, "Nom requis").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});
