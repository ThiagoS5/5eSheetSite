/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterCard } from "@/src/components/molecules/CharacterCard";
import type { Character } from "@/src/types/Character";

const character: Character = {
  id: "char-1",
  nome: "Aramil",
  classe: "Wizard",
  species: "Elf",
  atributos: {
    forca: 8,
    destreza: 14,
    constituicao: 12,
    inteligencia: 17,
    sabedoria: 13,
    carisma: 10,
  },
} as Character;

describe("CharacterCard", () => {
  afterEach(cleanup);

  it("renders name, class, and species", () => {
    render(<CharacterCard character={character} />);

    expect(screen.getByRole("heading", { name: "Aramil" })).toBeInTheDocument();
    expect(screen.getByText("Wizard")).toBeInTheDocument();
    expect(screen.getByText("Elf")).toBeInTheDocument();
  });

  it("lists all six ability scores with their values", () => {
    render(<CharacterCard character={character} />);

    const scores = screen.getByLabelText("Ability scores for Aramil");
    expect(scores).toBeInTheDocument();
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("omits the portrait when no url is provided", () => {
    render(<CharacterCard character={character} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
