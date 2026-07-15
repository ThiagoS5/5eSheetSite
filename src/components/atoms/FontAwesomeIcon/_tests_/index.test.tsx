/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  FontAwesomeIcon,
  getHitDieIconClass,
} from "@/src/components/atoms/FontAwesomeIcon";

describe("FontAwesomeIcon", () => {
  afterEach(cleanup);

  it("renders a decorative icon hidden from assistive technology", () => {
    const { container } = render(<FontAwesomeIcon iconClassName="fa-solid fa-brain" />);

    const icon = container.querySelector("i");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveClass("fa-solid", "fa-brain");
  });

  it("appends extra class names without leaving trailing whitespace", () => {
    const { container } = render(
      <FontAwesomeIcon iconClassName="fa-solid fa-brain" className="text-accent" />,
    );

    expect(container.querySelector("i")?.className).toBe("fa-solid fa-brain text-accent");
  });
});

describe("getHitDieIconClass", () => {
  it.each([
    [6, "fa-regular fa-dice-d6"],
    [8, "fa-regular fa-dice-d8"],
    [10, "fa-regular fa-dice-d10"],
    [12, "fa-regular fa-dice-d12"],
  ])("maps a d%i hit die to its dice icon", (hitDie, expected) => {
    expect(getHitDieIconClass(hitDie)).toBe(expected);
  });

  it("falls back to the d20 icon for unknown hit dice", () => {
    expect(getHitDieIconClass(20)).toBe("fa-regular fa-dice-d20");
    expect(getHitDieIconClass(0)).toBe("fa-regular fa-dice-d20");
  });
});
