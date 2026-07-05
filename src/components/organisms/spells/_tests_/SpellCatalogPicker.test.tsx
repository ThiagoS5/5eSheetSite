/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpellCatalogPicker } from "@/src/components/organisms/spells/SpellCatalogPicker";

describe("SpellCatalogPicker", () => {
  afterEach(cleanup);

  it("hides levelled spells above the character's available spell level", async () => {
    render(
      <SpellCatalogPicker
        className="Wizard"
        activeSources={["XPHB"]}
        cantripLimit={3}
        spellLimit={4}
        spellMode="prepared"
        maxSpellLevel={1}
        onChange={vi.fn()}
      />,
    );

    await waitFor(
      () => {
        expect(screen.getByText("Alarm")).toBeInTheDocument();
      },
      { timeout: 10000 },
    );

    expect(screen.queryByText("Fireball")).not.toBeInTheDocument();
  });
});
