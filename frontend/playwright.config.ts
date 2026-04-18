import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  reporter: [["list"]],
  webServer: [
    {
      command: "cmd /c .venv\\Scripts\\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000",
      cwd: "../backend",
      env: {
        ...process.env,
        FVS_MARKET_DATA_PROVIDER: "fixture",
      },
      name: "Backend",
      url: "http://127.0.0.1:8000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "cmd /c npm.cmd run dev -- --hostname 127.0.0.1",
      env: {
        ...process.env,
        BACKEND_BASE_URL: "http://127.0.0.1:8000",
      },
      name: "Frontend",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
