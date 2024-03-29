/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["text", "json-summary", "html"],
      exclude: ["src/main.ts", "**/types.ts", "**/*.d.ts"],
    },
  },
});
