/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("keeps the normal maximum blocking in rules mode", async () => {
    const onChange = vi.fn();
    const onAdditionalChange = vi.fn();
    render(
      <SpellCatalogPicker
        className="Wizard"
        activeSources={["XPHB"]}
        value={{ cantripIds: [], knownSpellIds: [], preparedSpellIds: ["shield-xphb"] }}
        cantripLimit={0}
        spellLimit={1}
        spellMode="prepared"
        maxSpellLevel={1}
        onChange={onChange}
        onAdditionalChange={onAdditionalChange}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: /alarm/i }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onAdditionalChange).not.toHaveBeenCalled();
  });

  it("stores selections above the normal maximum as isolated flexible extras", async () => {
    const onAdditionalChange = vi.fn();
    render(
      <SpellCatalogPicker
        className="Wizard"
        activeSources={["XPHB"]}
        value={{ cantripIds: [], knownSpellIds: [], preparedSpellIds: ["shield-xphb"] }}
        additionalValue={{ cantripIds: [], knownSpellIds: [], preparedSpellIds: [] }}
        cantripLimit={0}
        spellLimit={1}
        spellMode="prepared"
        maxSpellLevel={1}
        allowExtraChoices
        onChange={vi.fn()}
        onAdditionalChange={onAdditionalChange}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: /alarm/i }));

    expect(onAdditionalChange).toHaveBeenCalledWith({
      cantripIds: [],
      knownSpellIds: [],
      preparedSpellIds: ["alarm-xphb"],
    });
  });

  it("preserves and permits removing existing extras after flexible mode is disabled", async () => {
    const onAdditionalChange = vi.fn();
    render(
      <SpellCatalogPicker
        className="Wizard"
        activeSources={["XPHB"]}
        value={{ cantripIds: [], knownSpellIds: [], preparedSpellIds: ["shield-xphb"] }}
        additionalValue={{ cantripIds: [], knownSpellIds: [], preparedSpellIds: ["alarm-xphb"] }}
        cantripLimit={0}
        spellLimit={1}
        spellMode="prepared"
        maxSpellLevel={1}
        onChange={vi.fn()}
        onAdditionalChange={onAdditionalChange}
      />,
    );

    expect(await screen.findByText("1 of 1 prepared spells + 1 extra")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /alarm/i }));

    expect(onAdditionalChange).toHaveBeenCalledWith({
      cantripIds: [],
      knownSpellIds: [],
      preparedSpellIds: [],
    });
  });
});
