import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    watch: {
      // Zips dropped here are still locked while downloading; watching them crashes the server (EBUSY).
      ignored: ["**/RESEARCH-Study-reference/**", "**/scripts/pitch/.cache/**"],
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
