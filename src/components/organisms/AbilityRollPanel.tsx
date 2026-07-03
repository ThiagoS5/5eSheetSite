"use client";

import { useState } from "react";
import { rollAbilityScoreSet, type AbilityRoll } from "@/rules/abilityRollRules";
import { Button } from "@/src/components/ui/button";
import { ATTRIBUTE_LABELS, type AttributeKey, type CharacterAttributes } from "@/types/dnd";

const attributes = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[];

interface AbilityRollPanelProps {
  onApply: (scores: CharacterAttributes) => void;
  rollFn?: () => AbilityRoll[];
}

type Assignments = Partial<Record<AttributeKey, number>>;

export function AbilityRollPanel({
  onApply,
  rollFn = () => rollAbilityScoreSet(),
}: AbilityRollPanelProps) {
  const [rolls, setRolls] = useState<AbilityRoll[] | null>(null);
  const [assignments, setAssignments] = useState<Assignments>({});

  function handleRoll() {
    setRolls(rollFn());
    setAssignments({});
  }

  function handleAssign(attribute: AttributeKey, rawValue: string) {
    setAssignments((previous) => {
      const next = { ...previous };

      if (rawValue === "") {
        delete next[attribute];
        return next;
      }

      next[attribute] = Number(rawValue);
      return next;
    });
  }

  const assignedIndexes = new Set(
    attributes
      .map((attribute) => assignments[attribute])
      .filter((value): value is number => value !== undefined),
  );

  const allAssigned =
    rolls !== null &&
    attributes.every((attribute) => assignments[attribute] !== undefined);

  function handleApply() {
    if (!allAssigned) {
      return;
    }

    const scores = attributes.reduce((acc, attribute) => {
      acc[attribute] = assignments[attribute] as number;
      return acc;
    }, {} as CharacterAttributes);

    onApply(scores);
  }

  return (
    <section aria-labelledby="ability-roll-title" className="grid gap-4">
      <div>
        <h3
          id="ability-roll-title"
          className="font-serif text-lg font-bold tracking-wide text-foreground"
        >
          Rolagem 4d6 (descarta o menor)
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
          Role seis conjuntos de 4d6 e distribua os totais entre os atributos.
        </p>
      </div>

      <div>
        <Button type="button" onClick={handleRoll}>
          Rolar 4d6
        </Button>
      </div>

      {rolls ? (
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {rolls.map((roll, index) => (
            <li
              key={index}
              className="rounded-md border border-border bg-muted p-3 text-sm text-foreground"
            >
              <div className="flex items-center gap-1.5">
                {roll.dice.map((die, dieIndex) => (
                  <span
                    key={dieIndex}
                    className={
                      die === roll.dropped && !hasEarlierDrop(roll.dice, dieIndex, roll.dropped)
                        ? "line-through text-muted-foreground"
                        : undefined
                    }
                  >
                    {die}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                descartado: {roll.dropped}
              </p>
              <p className="font-serif text-xl font-bold text-foreground">
                Total: {roll.total}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {rolls ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {attributes.map((attribute) => {
            const label = ATTRIBUTE_LABELS[attribute];
            const currentValue = assignments[attribute];

            return (
              <label key={attribute} className="grid gap-1 text-sm text-foreground">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
                <select
                  aria-label={`Valor para ${label}`}
                  value={currentValue ?? ""}
                  onChange={(event) => handleAssign(attribute, event.target.value)}
                  className="rounded-md border border-border bg-surface-nested px-2 py-1.5 text-foreground outline-none focus:border-brand-crimson-alt focus:ring-2 focus:ring-brand-crimson-alt/50"
                >
                  <option value="">—</option>
                  {rolls.map((roll, index) => {
                    const isUsedByAnother =
                      assignedIndexes.has(roll.total) && currentValue !== roll.total;

                    if (isUsedByAnother) {
                      return null;
                    }

                    return (
                      <option key={index} value={roll.total}>
                        {roll.total}
                      </option>
                    );
                  })}
                </select>
              </label>
            );
          })}
        </div>
      ) : null}

      <div>
        <Button type="button" onClick={handleApply} disabled={!allAssigned}>
          Aplicar
        </Button>
      </div>
    </section>
  );
}

function hasEarlierDrop(dice: readonly number[], index: number, dropped: number): boolean {
  for (let i = 0; i < index; i += 1) {
    if (dice[i] === dropped) {
      return true;
    }
  }
  return false;
}
