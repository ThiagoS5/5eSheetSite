/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterRoster } from "@/src/components/organisms/CharacterRoster";
import type { Character } from "@/src/types/Character";

const characters: Character[] = [
  {
    id: "wizard-1",
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
  } as Character,
  {
    id: "fighter-1",
    nome: "Brakka",
    classe: "Fighter",
    species: "Human",
    atributos: {
      forca: 16,
      destreza: 12,
      constituicao: 14,
      inteligencia: 10,
      sabedoria: 11,
      carisma: 9,
    },
  } as Character,
];

describe("CharacterRoster", () => {
  afterEach(cleanup);

  it("filters characters by class through the search field", () => {
    render(<CharacterRoster characters={characters} />);

    fireEvent.change(screen.getByLabelText("Search character"), {
      target: { value: "fighter" },
    });

    expect(screen.getByText("1 character found")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brakka" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Aramil" })).not.toBeInTheDocument();
  });

  it("renders an empty result state when no character matches", () => {
    render(<CharacterRoster characters={characters} />);

    fireEvent.change(screen.getByLabelText("Search character"), {
      target: { value: "cleric" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "No character matches the current search.",
    );
  });
});
