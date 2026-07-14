/// <reference types="vitest/config" />

import { fileURLToPath } from "node:url";
import { getViteConfig } from "astro/config";

export default getViteConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.astro/**"],
  },
});
