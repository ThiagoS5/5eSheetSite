"use client";

import { CharacterCard } from "@/src/components/molecules/CharacterCard";
import { useCharacterFilters } from "@/src/hooks/useCharacterFilters";
import type { Character } from "@/src/types/Character";

interface CharacterRosterProps {
  characters: readonly Character[];
}

export function CharacterRoster({ characters }: CharacterRosterProps) {
  const { filteredCharacters, query, setQuery } = useCharacterFilters(characters);
  const resultLabel =
    filteredCharacters.length === 1
      ? "1 character found"
      : `${filteredCharacters.length} characters found`;

  return (
    <section
      aria-labelledby="characters-title"
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40 sm:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="characters-title" className="text-2xl font-semibold text-foreground">
            Registered Characters
          </h2>
          <p id="characters-description" className="mt-2 text-sm text-slate-400">
            Search by name, class, or species.
          </p>
        </div>

        <div className="w-full max-w-md">
          <label
            htmlFor="character-search"
            className="block text-sm font-medium text-slate-200"
          >
            Search character
          </label>
          <input
            id="character-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby="characters-description character-results"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-base text-foreground outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
            placeholder="e.g. paladin"
          />
        </div>
      </div>

      <p
        id="character-results"
        aria-live="polite"
        className="mt-5 text-sm font-medium text-cyan-200"
      >
        {resultLabel}
      </p>

      {filteredCharacters.length > 0 ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2" aria-label={resultLabel}>
          {filteredCharacters.map((character) => (
            <li key={character.id}>
              <CharacterCard character={character} />
            </li>
          ))}
        </ul>
      ) : (
        <p
          role="status"
          className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100"
        >
          No character matches the current search.
        </p>
      )}
    </section>
  );
}
