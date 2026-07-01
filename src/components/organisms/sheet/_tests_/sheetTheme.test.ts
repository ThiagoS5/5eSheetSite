import { describe, it, expect } from "vitest";
import { SHEET_THEME_VARS, originColor, originColorVars } from "@/src/components/organisms/sheet/sheetTheme";

describe("sheetTheme", () => {
  it("exposes the crimson override vars", () => {
    expect(SHEET_THEME_VARS["--primary" as keyof typeof SHEET_THEME_VARS]).toBe("oklch(0.59 0.23 27)");
    expect(SHEET_THEME_VARS["--brand-crimson-alt" as keyof typeof SHEET_THEME_VARS]).toBe("oklch(0.53 0.2 28)");
  });

  it("maps each origin source to its brand color", () => {
    expect(originColor("class")).toBe("var(--brand-gold-alt)");
    expect(originColor("species")).toBe("var(--brand-green)");
    expect(originColor("background")).toBe("var(--brand-blue)");
  });

  it("derives soft/bg mixes from the base color", () => {
    const v = originColorVars("class");
    expect(v.color).toBe("var(--brand-gold-alt)");
    expect(v.colorSoft).toBe("color-mix(in oklab, var(--brand-gold-alt) 45%, transparent)");
    expect(v.colorBg).toBe("color-mix(in oklab, var(--brand-gold-alt) 13%, transparent)");
  });
});
