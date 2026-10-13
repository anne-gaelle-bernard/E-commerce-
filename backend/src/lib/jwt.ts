import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export interface TokenPayload {
  sub: number;
  role: Role;
}

export const TOKEN_COOKIE = "token";
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 h

export function signToken(payload: TokenPayload): string {
  return jwt.sign({ role: payload.role }, env.jwtSecret, {
    subject: String(payload.sub),
    expiresIn: TOKEN_TTL_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] }) as jwt.JwtPayload;
  return { sub: Number(decoded.sub), role: decoded.role as Role };
}

export const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict" as const,
  maxAge: TOKEN_TTL_SECONDS * 1000,
  path: "/",
};
