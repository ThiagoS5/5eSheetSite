"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus } from "lucide-react";
import { defaultCharacterAttributes } from "@/src/store/characterBuildModel";
import { ActionBtn } from "@/src/components/atoms/ActionBtn";
import {
  canDecreasePointBuyAttribute,
  canIncreasePointBuyAttribute,
  decreasePointBuyAttribute,
  getPointBuyRemaining,
  getPointBuySpent,
  increasePointBuyAttribute,
} from "@/rules/pointBuyRules";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { modifierColorClass } from "@/src/utils/modifierColor";
import { cn } from "@/src/lib/utils";
import { ATTRIBUTE_ICON_CLASS } from "@/src/components/atoms/attributeIcons";
import { FontAwesomeIcon } from "@/src/components/atoms/FontAwesomeIcon";
import { AbilityRollPanel } from "@/src/components/organisms/AbilityRollPanel";
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
} from "@/src/types/dnd";

import type { AttributeEditorProps } from "./index.types";
export type { AttributeEditorProps } from "./index.types";
const attributes = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[];
const methods: readonly AttributeGenerationMethod[] = [
  "standard-array",
  "point-buy",
  "manual",
  "roll-4d6",
];
const standardArrayValues = [15, 14, 13, 12, 10, 8] as const;
const MANUAL_MIN = 3;
const MANUAL_MAX = 20;

export function AttributeEditor({
  method,
  baseAttributes,
  backgroundBonuses,
  onMethodChange,
  onAttributeChange,
}: AttributeEditorProps) {
  const [otherModifiers, setOtherModifiers] = useState<AttributeBonuses>({});
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const [rollResetNonce, setRollResetNonce] = useState(0);
  const pointBuySpent = getPointBuySpent(baseAttributes);
  const pointBuyRemaining = getPointBuyRemaining(baseAttributes);

  function setOtherModifier(attribute: AttributeKey, value: number) {
    setOtherModifiers((previous) => ({ ...previous, [attribute]: value }));
  }

  function handleConfirmReset() {
    attributes.forEach((attribute) => {
      onAttributeChange(attribute, defaultCharacterAttributes[attribute]);
    });
    setOtherModifiers({});
    setRollResetNonce((value) => value + 1);
    setConfirmResetOpen(false);
  }

  return (
    <section aria-labelledby="attributes-title" className="grid gap-5">
      <div>
        <h2
          id="attributes-title"
          className="font-serif text-xl font-bold tracking-wide text-foreground"
        >
          Set Ability Scores
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Base values stay separate from 2024 Background bonuses.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Ability score generation method</legend>
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface-nested p-1">
          {methods.map((entry) => (
            <button
              key={entry}
              type="button"
              aria-pressed={method === entry}
              onClick={() => onMethodChange(entry)}
              className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-muted-foreground outline-none transition hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 aria-pressed:border-brand-crimson-alt/70 aria-pressed:bg-primary/20 aria-pressed:text-foreground"
            >
              {getAttributeMethodLabel(entry)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="ml-auto rounded-md px-3 py-2 text-xs font-bold text-muted-foreground outline-none transition hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70"
          >
            Reset
          </button>
        </div>
      </fieldset>

      {method === "point-buy" ? (
        <p
          aria-live="polite"
          className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
        >
          Point Buy: <span className="text-accent">{pointBuySpent} spent</span>, {pointBuyRemaining} remaining
        </p>
      ) : null}

      {method === "roll-4d6" ? (
        <AbilityRollPanel
          key={rollResetNonce}
          onApply={(scores) => {
            attributes.forEach((attribute) => {
              onAttributeChange(attribute, scores[attribute]);
            });
          }}
        />
      ) : null}

      <div className="rounded-md border border-border bg-muted p-3 md:p-0">
        <Table className="block min-w-0 border-separate border-spacing-y-3 md:table md:border-collapse md:border-spacing-0">
          <TableHeader className="sr-only bg-white/5 md:table-header-group">
            <TableRow className="border-white/[0.06] hover:bg-transparent md:table-row">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ability
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Base Score
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bonus
              </TableHead>
              <TableHead className="hidden text-center text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">
                Other Modifiers
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total
              </TableHead>
              <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Modifier
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
                  className="grid grid-cols-2 gap-3 rounded-md border border-white/[0.06] bg-surface-nested p-3 hover:bg-white/[0.02] md:table-row md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent md:p-0"
                >
                  <TableCell className="col-span-2 p-0 whitespace-normal md:table-cell md:p-3 md:whitespace-nowrap">
                    <span className="flex items-center gap-2.5 font-semibold text-foreground">
                      <FontAwesomeIcon
                        iconClassName={ATTRIBUTE_ICON_CLASS[attribute]}
                        className="w-5 text-center text-primary"
                      />
                      {label}
                    </span>
                  </TableCell>
                  <TableCell className="p-0 text-left whitespace-normal md:table-cell md:p-3 md:text-center md:whitespace-nowrap">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                      Base Score
                    </span>
                    <BaseValueControl
                      method={method}
                      attribute={attribute}
                      label={label}
                      baseAttributes={baseAttributes}
                      onAttributeChange={onAttributeChange}
                    />
                  </TableCell>
                  <TableCell className="p-0 text-left font-semibold whitespace-normal text-subdued md:table-cell md:p-3 md:text-center md:whitespace-nowrap">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                      Bonus
                    </span>
                    {bonus === 0 ? "—" : formatSigned(bonus)}
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    <Input
                      type="number"
                      aria-label={`Other modifiers for ${label}`}
                      value={other}
                      onChange={(event) =>
                        setOtherModifier(
                          attribute,
                          Number(event.target.value) || 0,
                        )
                      }
                      className="mx-auto w-16 border-border bg-surface-nested text-center text-foreground"
                    />
                  </TableCell>
                  <TableCell className="p-0 text-left font-serif text-lg font-bold whitespace-normal text-foreground md:table-cell md:p-3 md:text-center md:whitespace-nowrap">
                    <span className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                      Total
                    </span>
                    {total}
                  </TableCell>
                  <TableCell className="p-0 text-left whitespace-normal md:table-cell md:p-3 md:text-center md:whitespace-nowrap">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                      Modifier
                    </span>
                    <span className={cn("font-serif text-2xl font-bold", modifierColorClass(modifier))}>
                      {formatSigned(modifier)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog.Root open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <Dialog.Content className="w-full max-w-md rounded-xl border border-white/[0.08] bg-surface-nested p-5 text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
              <Dialog.Title className="font-serif text-xl font-bold text-foreground">
                Reset ability scores?
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-subdued">
                Are you sure? This resets rolled dice and clears distributed
                base scores. The change is applied directly to the sheet.
              </Dialog.Description>
              <div className="mt-5 flex justify-end gap-3">
                <Dialog.Close asChild>
                  <ActionBtn intent="secondary" size="sm">
                    Cancel
                  </ActionBtn>
                </Dialog.Close>
                <ActionBtn size="sm" onClick={handleConfirmReset}>
                  Reset
                </ActionBtn>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
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

  if (method === "roll-4d6") {
    return (
      <output
        aria-label={`${label} ${value}`}
        aria-live="polite"
        className="block w-16 text-left font-serif text-lg font-bold text-foreground md:mx-auto md:text-center"
      >
        {value}
      </output>
    );
  }

  if (method === "standard-array") {
    return (
      <select
        aria-label={`Base score for ${label}`}
        value={value}
        onChange={(event) =>
          onAttributeChange(attribute, Number(event.target.value))
        }
        className="mx-auto w-20 rounded-md border border-border bg-surface-nested px-2 py-1.5 text-center text-foreground outline-none focus:border-brand-crimson-alt focus:ring-2 focus:ring-brand-crimson-alt/50"
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
    <div className="flex items-center justify-start gap-1 md:justify-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Decrease ${label}`}
        disabled={!canDecrease}
        onClick={handleDecrease}
        className="text-foreground"
      >
        <Minus aria-hidden="true" />
      </Button>
      <output
        aria-label={`${label} ${value}`}
        aria-live="polite"
        className="w-8 text-center font-serif text-lg font-bold text-foreground"
      >
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Increase ${label}`}
        disabled={!canIncrease}
        onClick={handleIncrease}
        className="text-foreground"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
