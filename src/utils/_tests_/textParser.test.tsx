/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseTaggedText } from "@/src/utils/textParser";

describe("parseTaggedText", () => {
  it("preserves plain text and renders known 5etools tags as accessible controls", () => {
    render(
      <p>
        {parseTaggedText("Cast {@spell Fireball|XPHB} for {@damage 8d6} damage.")}
      </p>,
    );

    expect(screen.getByText(/Cast/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "spell: Fireball" })).toBeInTheDocument();
    expect(screen.getByLabelText("damage: 8d6")).toBeInTheDocument();
  });

  it("falls back to accessible text for unknown tags", () => {
    render(<p>{parseTaggedText("Gain {@unknown Mystery Value}.")}</p>);

    expect(screen.getByLabelText("unknown: Mystery Value")).toBeInTheDocument();
  });
});
