import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "corepack pnpm exec tsx tests/e2e/seed-dashboard.ts && corepack pnpm build && corepack pnpm exec next start --hostname 127.0.0.1 --port 3000",
    env: {
      DEVBRAIN_DB_FILE: "data/e2e-dashboard.sqlite",
    },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
