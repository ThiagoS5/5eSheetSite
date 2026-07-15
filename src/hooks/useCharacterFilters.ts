"use client";

import { useMemo, useState } from "react";
import type { Character } from "@/src/types/Character";

interface UseCharacterFiltersResult {
  filteredCharacters: readonly Character[];
  query: string;
  setQuery: (query: string) => void;
}

export function useCharacterFilters(
  characters: readonly Character[],
): UseCharacterFiltersResult {
  const [query, setQuery] = useState("");

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedQuery) {
      return characters;
    }

    return characters.filter((character) => {
      const searchableContent = [
        character.nome,
        character.classe,
        character.species,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return searchableContent.includes(normalizedQuery);
    });
  }, [characters, query]);

  return {
    filteredCharacters,
    query,
    setQuery,
  };
}
