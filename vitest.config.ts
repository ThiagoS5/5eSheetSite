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
    exclude: [...configDefaults.exclude, "**/.claude/**", "**/.worktrees/**"],
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
