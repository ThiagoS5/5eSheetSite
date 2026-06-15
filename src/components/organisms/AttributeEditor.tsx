"use client";

import {
  canDecreasePointBuyAttribute,
  canIncreasePointBuyAttribute,
  decreasePointBuyAttribute,
  getPointBuyCost,
  getPointBuyRemaining,
  getPointBuySpent,
  increasePointBuyAttribute,
} from "@/rules/pointBuyRules";
import {
  calculateFinalAttributes,
  getAbilityModifier,
} from "@/src/adapters/characterDerivedAdapter";
import { getAttributeMethodLabel } from "@/src/store/createCharacterStore";
import type { AttributeGenerationMethod } from "@/src/store/characterStore.types";
import {
  ATTRIBUTE_LABELS,
  type AttributeBonuses,
  type AttributeKey,
  type CharacterAttributes,
} from "@/types/dnd";

const attributes = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[];
const methods: readonly AttributeGenerationMethod[] = [
  "standard-array",
  "point-buy",
  "manual",
];
const standardArrayValues = [15, 14, 13, 12, 10, 8] as const;

interface AttributeEditorProps {
  method: AttributeGenerationMethod;
  baseAttributes: CharacterAttributes;
  backgroundBonuses: AttributeBonuses;
  onMethodChange: (method: AttributeGenerationMethod) => void;
  onAttributeChange: (attribute: AttributeKey, value: number) => void;
}

export function AttributeEditor({
  method,
  baseAttributes,
  backgroundBonuses,
  onMethodChange,
  onAttributeChange,
}: AttributeEditorProps) {
  const finalAttributes = calculateFinalAttributes(
    baseAttributes,
    backgroundBonuses,
  );
  const pointBuySpent = getPointBuySpent(baseAttributes);
  const pointBuyRemaining = getPointBuyRemaining(baseAttributes);

  return (
    <section aria-labelledby="attributes-title" className="grid gap-5">
      <div>
        <h2
          id="attributes-title"
          className="font-serif text-xl font-bold tracking-wide text-white"
        >
          Defina os Atributos
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7a7e99]">
          Valores base ficam separados dos bonus do Antecedente 2024.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Metodo de geracao de atributos</legend>
        <div className="flex flex-wrap gap-2">
          {methods.map((entry) => (
            <button
              key={entry}
              type="button"
              aria-pressed={method === entry}
              onClick={() => onMethodChange(entry)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#7a7e99] outline-none transition hover:border-[#c41e1e]/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 aria-pressed:border-[#c41e1e] aria-pressed:bg-[#c41e1e] aria-pressed:text-white"
            >
              {getAttributeMethodLabel(entry)}
            </button>
          ))}
        </div>
      </fieldset>

      {method === "point-buy" ? (
        <p
          aria-live="polite"
          className="rounded-md border border-white/[0.08] bg-[#1c1e2a] px-3 py-2 text-sm font-semibold text-[#f3c969]"
        >
          Point Buy: {pointBuySpent} gastos, {pointBuyRemaining} restantes
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {attributes.map((attribute) => {
          const bonus = backgroundBonuses[attribute] ?? 0;
          const finalValue = finalAttributes[attribute];

          return (
            <div
              key={attribute}
              className="rounded-lg border border-white/[0.06] bg-[#1c1e2a] p-4"
            >
              <label
                className="text-sm font-semibold text-[#e8e9f0]"
                htmlFor={`attribute-${attribute}`}
              >
                {ATTRIBUTE_LABELS[attribute]}
              </label>
              {method === "standard-array" ? (
                <select
                  id={`attribute-${attribute}`}
                  value={baseAttributes[attribute]}
                  onChange={(event) =>
                    onAttributeChange(attribute, Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-md border border-white/10 bg-[#12131a] px-3 py-2 text-white outline-none focus:border-[#c41e1e] focus:ring-2 focus:ring-[#c41e1e]/50"
                >
                  {standardArrayValues.map((value) => {
                    const valueUsed = attributes.some(
                      (candidate) =>
                        candidate !== attribute && baseAttributes[candidate] === value,
                    );

                    return (
                      <option key={value} value={value} disabled={valueUsed}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              ) : method === "point-buy" ? (
                <PointBuyStepper
                  attribute={attribute}
                  value={baseAttributes[attribute]}
                  attributes={baseAttributes}
                  onAttributeChange={onAttributeChange}
                />
              ) : (
                <input
                  id={`attribute-${attribute}`}
                  type="number"
                  min={3}
                  max={20}
                  value={baseAttributes[attribute]}
                  onChange={(event) =>
                    onAttributeChange(attribute, Number(event.target.value))
                  }
                  className="mt-2 w-full rounded-md border border-white/10 bg-[#12131a] px-3 py-2 text-white outline-none focus:border-[#c41e1e] focus:ring-2 focus:ring-[#c41e1e]/50"
                />
              )}
              <span className="mt-2 block text-xs text-[#7a7e99]">
                Bonus BG {formatSigned(bonus)} · Final {finalValue} · Mod{" "}
                {formatSigned(getAbilityModifier(finalValue))}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PointBuyStepper({
  attribute,
  value,
  attributes,
  onAttributeChange,
}: {
  attribute: AttributeKey;
  value: number;
  attributes: CharacterAttributes;
  onAttributeChange: (attribute: AttributeKey, value: number) => void;
}) {
  const label = ATTRIBUTE_LABELS[attribute];
  const increased = increasePointBuyAttribute(attributes, attribute);
  const decreased = decreasePointBuyAttribute(attributes, attribute);

  return (
    <div className="mt-2 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        disabled={!canDecreasePointBuyAttribute(attributes, attribute)}
        onClick={() => onAttributeChange(attribute, decreased[attribute])}
        className="h-10 rounded-md border border-white/10 bg-white/5 text-lg font-bold text-white outline-none transition hover:border-[#c41e1e]/70 focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        -
      </button>
      <output
        id={`attribute-${attribute}`}
        aria-label={`${label} ${value}`}
        className="rounded-md border border-white/10 bg-[#12131a] px-3 py-2 text-center font-serif text-xl font-bold text-white"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        disabled={!canIncreasePointBuyAttribute(attributes, attribute)}
        onClick={() => onAttributeChange(attribute, increased[attribute])}
        className="h-10 rounded-md border border-white/10 bg-white/5 text-lg font-bold text-white outline-none transition hover:border-[#c41e1e]/70 focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
      <span className="col-span-3 text-xs text-[#7a7e99]">
        Custo atual: {getPointBuyCost(value)}
      </span>
    </div>
  );
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
