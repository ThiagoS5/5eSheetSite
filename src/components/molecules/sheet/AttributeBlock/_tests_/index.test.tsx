/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AttributeBlock } from "@/src/components/molecules/sheet/AttributeBlock";
import type { SheetAttribute } from "@/src/types/builder";

const strength: SheetAttribute = {
  key: "forca",
  label: "Strength",
  abbr: "STR",
  score: 16,
  modifier: 3,
};

describe("AttributeBlock", () => {
  afterEach(cleanup);

  it("renders abbreviation, signed positive modifier, and score", () => {
    render(<AttributeBlock attribute={strength} />);

    expect(screen.getByText("STR")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("renders a negative modifier without a plus sign", () => {
    render(
      <AttributeBlock
        attribute={{ key: "carisma", label: "Charisma", abbr: "CHA", score: 7, modifier: -2 }}
      />,
    );

    expect(screen.getByText("-2")).toBeInTheDocument();
    expect(screen.queryByText("+-2")).not.toBeInTheDocument();
  });

  it("renders a zero modifier as +0", () => {
    render(
      <AttributeBlock
        attribute={{ key: "sabedoria", label: "Wisdom", abbr: "WIS", score: 10, modifier: 0 }}
      />,
    );

    expect(screen.getByText("+0")).toBeInTheDocument();
  });
});
