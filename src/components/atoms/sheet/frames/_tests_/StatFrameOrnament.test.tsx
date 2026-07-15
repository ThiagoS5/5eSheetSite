/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatFrameOrnament } from "@/src/components/atoms/sheet/frames/StatFrameOrnament";

describe("StatFrameOrnament", () => {
  afterEach(cleanup);

  it("renders a decorative svg sized to the given dimensions", () => {
    const { container } = render(
      <StatFrameOrnament width={96} height={120} accentColor="#e61c23" />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 96 120");
    expect(svg).toHaveAttribute("width", "96");
    expect(svg).toHaveAttribute("height", "120");
  });

  it("draws the frame with the accent color and custom fill", () => {
    const { container } = render(
      <StatFrameOrnament width={88} height={88} accentColor="#7a7e99" fillColor="#000000" />,
    );

    expect(container.querySelector('path[fill="#000000"]')).not.toBeNull();
    expect(container.querySelectorAll('path[stroke="#7a7e99"]').length).toBeGreaterThan(0);
  });
});
