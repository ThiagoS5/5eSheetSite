"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ChoiceCounter } from "@/src/components/molecules/ChoiceCounter";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import type { CharacterSpellcastingChoices, BuilderSpell, SpellSchool } from "@/types/spells";

interface SpellCatalogPickerProps {
  className: string;
  activeSources: string[];
  value?: CharacterSpellcastingChoices;
  cantripLimit: number;
  spellLimit: number;
  spellMode: "prepared" | "known";
  maxSpellLevel: number;
  disabled?: boolean;
  onChange: (choices: CharacterSpellcastingChoices) => void;
}

const EMPTY_CHOICES: CharacterSpellcastingChoices = {
  cantripIds: [],
  knownSpellIds: [],
  preparedSpellIds: [],
};

export function SpellCatalogPicker({
  className,
  activeSources,
  value,
  cantripLimit,
  spellLimit,
  spellMode,
  maxSpellLevel,
  disabled = false,
  onChange,
}: SpellCatalogPickerProps) {
  const choices = value ?? EMPTY_CHOICES;
  const [spells, setSpells] = useState<BuilderSpell[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [school, setSchool] = useState("all");
  const [source, setSource] = useState("all");

  const requestKey = `${className}:${activeSources.join("|")}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    void import("@/src/services/spellService").then((module) => {
      if (cancelled) return;
      setSpells(module.getSpellCatalogForClass({ className, activeSources }));
      setLoadedKey(requestKey);
    });
    return () => {
      cancelled = true;
    };
  }, [className, activeSources, requestKey]);

  const filtered = useMemo(() => {
    const queryText = query.trim().toLowerCase();
    return spells.filter((spell) => {
      if (queryText && !spell.name.toLowerCase().includes(queryText)) return false;
      if (level !== "all" && spell.level !== Number(level)) return false;
      if (school !== "all" && spell.school !== school) return false;
      if (source !== "all" && spell.source !== source) return false;
      return true;
    });
  }, [spells, query, level, school, source]);

  const sources = Array.from(new Set(spells.map((spell) => spell.source))).sort();
  const schools = Array.from(new Set(spells.map((spell) => spell.school))).sort();
  const cantrips = filtered.filter((spell) => spell.level === 0);
  const levelledSpells = filtered.filter(
    (spell) => spell.level > 0 && spell.level <= maxSpellLevel,
  );
  const selectedSpellIds =
    spellMode === "prepared" ? choices.preparedSpellIds : choices.knownSpellIds;
  const levelOptions = [
    "all",
    "0",
    ...Array.from({ length: maxSpellLevel }, (_entry, index) => String(index + 1)),
  ];

  function toggleSpell(spell: BuilderSpell) {
    if (spell.level === 0) {
      const selected = choices.cantripIds.includes(spell.id);
      const cantripIds = selected
        ? choices.cantripIds.filter((id) => id !== spell.id)
        : choices.cantripIds.length < cantripLimit
          ? [...choices.cantripIds, spell.id]
          : choices.cantripIds;
      onChange({ ...choices, cantripIds });
      return;
    }

    const selected = selectedSpellIds.includes(spell.id);
    const nextIds = selected
      ? selectedSpellIds.filter((id) => id !== spell.id)
      : selectedSpellIds.length < spellLimit
        ? [...selectedSpellIds, spell.id]
        : selectedSpellIds;
    onChange(
      spellMode === "prepared"
        ? { ...choices, preparedSpellIds: nextIds }
        : { ...choices, knownSpellIds: nextIds },
    );
  }

  return (
    <section className="grid gap-4 rounded-lg border border-white/[0.06] bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground">Spellcasting</h3>
          <p className="mt-1 text-sm leading-6 text-subdued">
            Choose spells for your class list. Slots refresh on a long rest and cantrips never spend slots.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ChoiceCounter selected={choices.cantripIds.length} total={cantripLimit} label="cantrips" />
          <ChoiceCounter selected={selectedSpellIds.length} total={spellLimit} label={`${spellMode} spells`} />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search spells</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search spells"
            className={cn("h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none", focusRing)}
          />
        </label>
        <SelectFilter label="Level" value={level} onChange={setLevel} options={levelOptions} />
        <SelectFilter label="School" value={school} onChange={setSchool} options={["all", ...schools]} />
        <SelectFilter label="Source" value={source} onChange={setSource} options={["all", ...sources]} />
      </div>

      {loading ? (
        <div className="grid gap-2 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5">
          <SpellGrid
            title="Cantrips"
            spells={cantrips}
            selectedIds={choices.cantripIds}
            disabled={disabled}
            onToggle={toggleSpell}
          />
          <SpellGrid
            title={spellMode === "prepared" ? "Prepared spells" : "Known spells"}
            spells={levelledSpells}
            selectedIds={selectedSpellIds}
            disabled={disabled}
            onToggle={toggleSpell}
          />
        </div>
      )}
    </section>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("h-10 rounded-md border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none", focusRing)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SpellGrid({
  title,
  spells,
  selectedIds,
  disabled,
  onToggle,
}: {
  title: string;
  spells: BuilderSpell[];
  selectedIds: string[];
  disabled: boolean;
  onToggle: (spell: BuilderSpell) => void;
}) {
  if (spells.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        No spells match these filters.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</h4>
      <div className="grid gap-2 md:grid-cols-2">
        {spells.map((spell) => {
          const selected = selectedIds.includes(spell.id);
          return (
            <button
              key={spell.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onToggle(spell)}
              className={cn(
                "min-h-[92px] rounded-lg border p-3 text-left transition-colors",
                focusRing,
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-surface-nested text-subdued hover:bg-card",
              )}
            >
              <span className="flex items-start justify-between gap-2">
                <span translate="no" className="notranslate font-serif text-base font-bold text-foreground">{spell.name}</span>
                <span className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                  {spell.source}
                </span>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} · {spell.school as SpellSchool}
              </span>
              <span className="mt-2 line-clamp-2 block text-xs leading-5 text-subdued">
                {spell.description || `${spell.castingTime} · ${spell.range} · ${spell.duration}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
