import { configDefaults, defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15000,
    include: [
      "app/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "rules/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "src/**/*.{test,spec}.{ts,tsx,js,jsx}",
    ],
    exclude: configDefaults.exclude,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**", "rules/**", "app/**"],
      exclude: [
        "**/_tests_/**",
        "**/*.test.*",
        "src/_references/**",
        "src/components/ui/**",
      ],
    },
  },
});
