import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middlewares/auth.js";
import { TOKEN_COOKIE, cookieOptions, signToken } from "../../lib/jwt.js";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";
import { deleteAccountSchema, loginSchema, registerSchema, updateProfileSchema } from "./auth.schemas.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes" },
});

authRouter.post("/register", authLimiter, async (req, res) => {
  const data = registerSchema.parse(req.body);
  const user = await authService.register(data);
  res.cookie(TOKEN_COOKIE, signToken({ sub: user.id, role: user.role }), cookieOptions);
  res.status(201).json(user);
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await authService.login(data);
  res.cookie(TOKEN_COOKIE, signToken({ sub: user.id, role: user.role }), cookieOptions);
  res.json(user);
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json(await authService.getUser(req.user!.id));
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  const data = updateProfileSchema.parse(req.body);
  res.json(await authService.updateProfile(req.user!.id, data));
});

authRouter.get("/me/export", requireAuth, async (req, res) => {
  const data = await authService.exportData(req.user!.id);
  res.attachment("mes-donnees.json").json(data);
});

authRouter.delete("/me", requireAuth, async (req, res) => {
  const { password } = deleteAccountSchema.parse(req.body);
  await authService.deleteAccount(req.user!.id, password);
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
});
