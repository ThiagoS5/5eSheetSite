/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatBadge } from "@/src/components/atoms/StatBadge";

describe("StatBadge", () => {
  afterEach(cleanup);

  it("renders the label and the value", () => {
    render(<StatBadge label="Armor Class" value={17} />);

    expect(screen.getByText("Armor Class")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
  });

  it("renders the detail text only when provided", () => {
    const { rerender } = render(<StatBadge label="Speed" value="30 ft" detail="walking" />);
    expect(screen.getByText("walking")).toBeInTheDocument();

    rerender(<StatBadge label="Speed" value="30 ft" />);
    expect(screen.queryByText("walking")).not.toBeInTheDocument();
  });

  it("exposes the title tooltip on the label term", () => {
    render(<StatBadge label="PB" value="+2" title="Proficiency Bonus" />);

    expect(screen.getByText("PB")).toHaveAttribute("title", "Proficiency Bonus");
  });
});
