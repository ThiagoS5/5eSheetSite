/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AttributeEditor } from "@/src/components/organisms/AttributeEditor";
import type { CharacterAttributes } from "@/types/dnd";

const pointBuyAttributes: CharacterAttributes = {
  forca: 15,
  destreza: 15,
  constituicao: 14,
  inteligencia: 9,
  sabedoria: 8,
  carisma: 8,
};

describe("AttributeEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders accessible point buy steppers and blocks invalid increases", () => {
    const onAttributeChange = vi.fn();

    render(
      <AttributeEditor
        method="point-buy"
        baseAttributes={pointBuyAttributes}
        backgroundBonuses={{ forca: 2 }}
        onMethodChange={vi.fn()}
        onAttributeChange={onAttributeChange}
      />,
    );

    expect(screen.getByText("Point Buy: 26 gastos, 1 restantes")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveClass(
      "block",
      "min-w-0",
      "md:table",
    );
    expect(screen.getByRole("row", { name: /Forca/i })).toHaveClass(
      "grid",
      "md:table-row",
    );
    expect(
      screen.getByRole("button", { name: "Aumentar Forca" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Diminuir Inteligencia" }),
    ).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Diminuir Inteligencia" }));

    expect(onAttributeChange).toHaveBeenCalledWith("inteligencia", 8);
  });

  it("renders roll-4d6 base values as read-only, without stepper controls", () => {
    const rolledAttributes: CharacterAttributes = {
      forca: 15,
      destreza: 14,
      constituicao: 13,
      inteligencia: 12,
      sabedoria: 10,
      carisma: 8,
    };

    render(
      <AttributeEditor
        method="roll-4d6"
        baseAttributes={rolledAttributes}
        backgroundBonuses={{}}
        onMethodChange={vi.fn()}
        onAttributeChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Aumentar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Diminuir/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByLabelText("Forca 15")).toBeInTheDocument();
    expect(screen.getByLabelText("Carisma 8")).toBeInTheDocument();
  });
});
