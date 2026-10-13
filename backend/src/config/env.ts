import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET doit contenir au moins 32 caractères");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  port: Number(process.env.PORT ?? 3000),
  jwtSecret,
  // 1 derrière Nginx, 2 derrière Vercel + Railway
  trustProxy: Number(process.env.TRUST_PROXY ?? 1),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
};
