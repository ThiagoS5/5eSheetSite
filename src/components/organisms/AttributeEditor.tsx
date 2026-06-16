"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import {
  canDecreasePointBuyAttribute,
  canIncreasePointBuyAttribute,
  decreasePointBuyAttribute,
  getPointBuyRemaining,
  getPointBuySpent,
  increasePointBuyAttribute,
} from "@/rules/pointBuyRules";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { ATTRIBUTE_ICON_CLASS } from "@/src/components/atoms/attributeIcons";
import { FontAwesomeIcon } from "@/src/components/atoms/FontAwesomeIcon";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
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
const MANUAL_MIN = 3;
const MANUAL_MAX = 20;

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
  const [otherModifiers, setOtherModifiers] = useState<AttributeBonuses>({});
  const pointBuySpent = getPointBuySpent(baseAttributes);
  const pointBuyRemaining = getPointBuyRemaining(baseAttributes);

  function setOtherModifier(attribute: AttributeKey, value: number) {
    setOtherModifiers((previous) => ({ ...previous, [attribute]: value }));
  }

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

      <div className="rounded-md border border-white/10 bg-[#10121b]">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-[#7a7e99]">
                Atributo
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-[#7a7e99]">
                Valor Base
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-[#7a7e99]">
                Bonus
              </TableHead>
              <TableHead className="hidden text-center text-xs font-bold uppercase tracking-wider text-[#7a7e99] md:table-cell">
                Outros Modificadores
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-[#7a7e99]">
                Total
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-[#7a7e99]">
                Modificador
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attribute) => {
              const bonus = backgroundBonuses[attribute] ?? 0;
              const other = otherModifiers[attribute] ?? 0;
              const total = baseAttributes[attribute] + bonus + other;
              const modifier = getAbilityModifier(total);
              const label = ATTRIBUTE_LABELS[attribute];

              return (
                <TableRow
                  key={attribute}
                  className="border-white/[0.06] hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <span className="flex items-center gap-2.5 font-semibold text-[#e8e9f0]">
                      <FontAwesomeIcon
                        iconClassName={ATTRIBUTE_ICON_CLASS[attribute]}
                        className="w-5 text-center text-[#e61c23]"
                      />
                      {label}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <BaseValueControl
                      method={method}
                      attribute={attribute}
                      label={label}
                      baseAttributes={baseAttributes}
                      onAttributeChange={onAttributeChange}
                    />
                  </TableCell>
                  <TableCell className="text-center font-semibold text-[#b0b5cc]">
                    {bonus === 0 ? "—" : formatSigned(bonus)}
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    <Input
                      type="number"
                      aria-label={`Outros modificadores de ${label}`}
                      value={other}
                      onChange={(event) =>
                        setOtherModifier(
                          attribute,
                          Number(event.target.value) || 0,
                        )
                      }
                      className="mx-auto w-16 border-white/10 bg-[#12131a] text-center text-white"
                    />
                  </TableCell>
                  <TableCell className="text-center font-serif text-lg font-bold text-white">
                    {total}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-serif text-2xl font-bold text-[#e61c23]">
                      {formatSigned(modifier)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function BaseValueControl({
  method,
  attribute,
  label,
  baseAttributes,
  onAttributeChange,
}: {
  method: AttributeGenerationMethod;
  attribute: AttributeKey;
  label: string;
  baseAttributes: CharacterAttributes;
  onAttributeChange: (attribute: AttributeKey, value: number) => void;
}) {
  const value = baseAttributes[attribute];

  if (method === "standard-array") {
    return (
      <select
        aria-label={`Valor base de ${label}`}
        value={value}
        onChange={(event) =>
          onAttributeChange(attribute, Number(event.target.value))
        }
        className="mx-auto w-20 rounded-md border border-white/10 bg-[#12131a] px-2 py-1.5 text-center text-white outline-none focus:border-[#c41e1e] focus:ring-2 focus:ring-[#c41e1e]/50"
      >
        {standardArrayValues.map((arrayValue) => {
          const valueUsed = attributes.some(
            (candidate) =>
              candidate !== attribute &&
              baseAttributes[candidate] === arrayValue,
          );

          return (
            <option key={arrayValue} value={arrayValue} disabled={valueUsed}>
              {arrayValue}
            </option>
          );
        })}
      </select>
    );
  }

  const canDecrease =
    method === "point-buy"
      ? canDecreasePointBuyAttribute(baseAttributes, attribute)
      : value > MANUAL_MIN;
  const canIncrease =
    method === "point-buy"
      ? canIncreasePointBuyAttribute(baseAttributes, attribute)
      : value < MANUAL_MAX;

  function handleDecrease() {
    if (method === "point-buy") {
      onAttributeChange(
        attribute,
        decreasePointBuyAttribute(baseAttributes, attribute)[attribute],
      );
      return;
    }

    onAttributeChange(attribute, value - 1);
  }

  function handleIncrease() {
    if (method === "point-buy") {
      onAttributeChange(
        attribute,
        increasePointBuyAttribute(baseAttributes, attribute)[attribute],
      );
      return;
    }

    onAttributeChange(attribute, value + 1);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Diminuir ${label}`}
        disabled={!canDecrease}
        onClick={handleDecrease}
        className="text-white"
      >
        <Minus aria-hidden="true" />
      </Button>
      <output
        aria-label={`${label} ${value}`}
        className="w-8 text-center font-serif text-lg font-bold text-white"
      >
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Aumentar ${label}`}
        disabled={!canIncrease}
        onClick={handleIncrease}
        className="text-white"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
