/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TraitText } from "@/src/components/atoms/TraitText";

describe("TraitText", () => {
  afterEach(cleanup);

  it("renders its children inside an accent serif span", () => {
    render(<TraitText>Darkvision</TraitText>);

    const trait = screen.getByText("Darkvision");
    expect(trait.tagName).toBe("SPAN");
    expect(trait).toHaveClass("text-accent");
  });
});
