import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("RootLayout", () => {
  it("suppresses hydration warnings on body attributes injected by browser extensions", () => {
    const layoutSource = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

    expect(layoutSource).toMatch(/<body[\s\S]*suppressHydrationWarning/);
  });
});
