/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatFrame } from "@/src/components/atoms/sheet/frames/StatFrame";

describe("StatFrame", () => {
  afterEach(cleanup);

  it("renders children inside the ornamented frame with default dimensions", () => {
    const { container } = render(
      <StatFrame>
        <span>18</span>
      </StatFrame>,
    );

    expect(screen.getByText("18")).toBeInTheDocument();
    const frame = container.firstElementChild as HTMLElement;
    expect(frame).toHaveStyle({ width: "96px", height: "120px" });
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("honors custom dimensions and accent color", () => {
    const { container } = render(
      <StatFrame width={64} height={80} accentColor="#00ff00">
        <span>DEX</span>
      </StatFrame>,
    );

    const frame = container.firstElementChild as HTMLElement;
    expect(frame).toHaveStyle({ width: "64px", height: "80px" });
    expect(container.querySelector('svg path[stroke="#00ff00"]')).not.toBeNull();
  });
});
