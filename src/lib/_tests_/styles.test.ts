import { describe, expect, it } from "vitest";
import { focusRing } from "@/src/lib/styles";

describe("focusRing", () => {
  it("removes the default outline and shows a visible focus ring", () => {
    expect(focusRing).toContain("outline-none");
    expect(focusRing).toContain("focus-visible:ring-3");
  });
});
