/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverTooltip } from "@/src/components/molecules/HoverTooltip";

describe("HoverTooltip", () => {
  it("renders a keyboard-focusable trigger with an accessible description", () => {
    render(
      <HoverTooltip content="Restore hit points to a creature.">
        Healing Hands
      </HoverTooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Healing Hands" });

    expect(trigger).toHaveAttribute("aria-describedby");
    expect(trigger).toHaveClass("focus-visible:ring-2");
  });
});
