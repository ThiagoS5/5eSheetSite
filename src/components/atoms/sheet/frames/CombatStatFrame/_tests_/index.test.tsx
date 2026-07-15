/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CombatStatFrame } from "@/src/components/atoms/sheet/frames/CombatStatFrame";

describe("CombatStatFrame", () => {
  afterEach(cleanup);

  it("renders the shield variant with the shield path outline", () => {
    const { container } = render(
      <CombatStatFrame variant="shield">
        <span>17</span>
      </CombatStatFrame>,
    );

    expect(screen.getByText("17")).toBeInTheDocument();
    expect(container.querySelector('svg[viewBox="0 0 100 110"]')).not.toBeNull();
  });

  it("renders the square variant as an 88x88 ornamented frame", () => {
    const { container } = render(
      <CombatStatFrame variant="square">
        <span>30 ft</span>
      </CombatStatFrame>,
    );

    expect(screen.getByText("30 ft")).toBeInTheDocument();
    const frame = container.firstElementChild as HTMLElement;
    expect(frame).toHaveStyle({ width: "88px", height: "88px" });
  });

  it("applies a custom accent color to the shield stroke", () => {
    const { container } = render(
      <CombatStatFrame variant="shield" accentColor="#e61c23">
        <span>AC</span>
      </CombatStatFrame>,
    );

    expect(container.querySelector('svg path[stroke="#e61c23"]')).not.toBeNull();
  });
});
