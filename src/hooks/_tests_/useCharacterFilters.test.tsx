/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useCharacterFilters } from "@/src/hooks/useCharacterFilters";
import type { Character } from "@/src/types/Character";

const characters = [
  { nome: "Aramil", classe: "Wizard", species: "Elf" },
  { nome: "Borin", classe: "Fighter", species: "Dwarf" },
  { nome: "Céu", classe: "Cleric", species: "Human" },
] as unknown as readonly Character[];

describe("useCharacterFilters", () => {
  afterEach(cleanup);

  it("returns all characters when the query is empty", () => {
    const { result } = renderHook(() => useCharacterFilters(characters));

    expect(result.current.query).toBe("");
    expect(result.current.filteredCharacters).toEqual(characters);
  });

  it("filters by name, class, and species, case-insensitively", () => {
    const { result } = renderHook(() => useCharacterFilters(characters));

    act(() => result.current.setQuery("wizard"));
    expect(result.current.filteredCharacters).toHaveLength(1);
    expect(result.current.filteredCharacters[0]?.nome).toBe("Aramil");

    act(() => result.current.setQuery("DWARF"));
    expect(result.current.filteredCharacters[0]?.nome).toBe("Borin");
  });

  it("ignores surrounding whitespace and matches accented names", () => {
    const { result } = renderHook(() => useCharacterFilters(characters));

    act(() => result.current.setQuery("  céu  "));
    expect(result.current.filteredCharacters).toHaveLength(1);
    expect(result.current.filteredCharacters[0]?.nome).toBe("Céu");
  });

  it("returns an empty list when nothing matches", () => {
    const { result } = renderHook(() => useCharacterFilters(characters));

    act(() => result.current.setQuery("paladin"));
    expect(result.current.filteredCharacters).toHaveLength(0);
  });
});
