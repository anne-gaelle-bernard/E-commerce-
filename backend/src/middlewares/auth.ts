import type { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../lib/http-error.js";
import { TOKEN_COOKIE, verifyToken } from "../lib/jwt.js";

function readUser(req: Request) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) return undefined;
  try {
    const payload = verifyToken(token);
    return { id: payload.sub, role: payload.role };
  } catch {
    return undefined;
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = readUser(req);
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = readUser(req);
  if (!req.user) return next(unauthorized());
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.user?.role !== "ADMIN") return next(forbidden());
    next();
  });
}
