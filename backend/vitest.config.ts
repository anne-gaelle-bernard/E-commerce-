import "dotenv/config";
import { defineConfig } from "vitest/config";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) throw new Error("TEST_DATABASE_URL doit être défini pour lancer les tests");

export default defineConfig({
  test: {
    globalSetup: "./tests/global-setup.ts",
    env: { NODE_ENV: "test", DATABASE_URL: testDatabaseUrl },
    // Les tests d'intégration partagent la même base : on les exécute un fichier à la fois.
    fileParallelism: false,
    testTimeout: 20000,
  },
});
