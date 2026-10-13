import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";
import { env } from "../config/env.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route introuvable" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Données invalides",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ error: "Cette valeur existe déjà" });
    if (err.code === "P2025") return res.status(404).json({ error: "Ressource introuvable" });
    if (err.code === "P2003") return res.status(409).json({ error: "Ressource encore utilisée" });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON invalide" });
  }
  if (!env.isTest) console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
}
