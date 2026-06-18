"use client";

import { useId, useRef, useState, type ReactNode, type RefObject } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { WizardChoiceCard } from "@/src/components/molecules/WizardChoiceCard";
import type { BuilderBackground, BuilderFeatureBlock } from "@/types/builder";
import {
  ATTRIBUTE_LABELS,
  type AttributeBonuses,
  type AttributeKey,
} from "@/types/dnd";

interface BackgroundCardProps {
  background: BuilderBackground;
  selected: boolean;
  selectedBonuses: AttributeBonuses;
  disabled: boolean;
  onSelect: () => void;
  onBonusesChange: (bonuses: AttributeBonuses) => void;
  onCommit: () => void;
}

const attributeKeys: readonly AttributeKey[] = [
  "forca",
  "destreza",
  "constituicao",
  "inteligencia",
  "sabedoria",
  "carisma",
];

export function BackgroundCard({
  background,
  selected,
  selectedBonuses,
  disabled,
  onSelect,
  onBonusesChange,
  onCommit,
}: BackgroundCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const bonusControlsRef = useRef<HTMLFieldSetElement>(null);
  const isComplete =
    selected && isBackgroundAbilitySelectionComplete(background, selectedBonuses);

  function focusBonusControls() {
    window.setTimeout(() => {
      const firstControl = bonusControlsRef.current?.querySelector<
        HTMLSelectElement | HTMLInputElement | HTMLButtonElement
      >("select:not(:disabled), input:not(:disabled), button:not(:disabled)");

      firstControl?.focus();
    }, 0);
  }

  function handleSelect() {
    onSelect();

    if (isComplete) {
      onCommit();
      return;
    }

    focusBonusControls();
  }

  return (
    <>
      <WizardChoiceCard
        title={background.name}
        subtitle={background.source}
        imageSrc={background.image?.src}
        imageAlt={background.image?.alt}
        icon={<i aria-hidden="true" className="fa-solid fa-scroll-old" />}
        isActive={selected}
        disabled={disabled}
        onClickDetails={() => setDetailsOpen(true)}
        onClickSelect={handleSelect}
        selectLabel="SELECIONAR"
        selectedLabel="SELECIONADO"
        imageSizes="(min-width: 1280px) 24rem, (min-width: 768px) 50vw, 100vw"
      >
        <p className="line-clamp-3 flex-1 text-sm leading-6 text-foreground">
          {background.summary}
        </p>

        <BackgroundRewardCallout background={background} />

        <BackgroundAbilitySelector
          controlsRef={bonusControlsRef}
          background={background}
          selected={selectedBonuses}
          disabled={disabled}
          onChange={(bonuses) => {
            onSelect();
            onBonusesChange(bonuses);
          }}
        />
      </WizardChoiceCard>

      <BackgroundDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        background={background}
        selected={selected}
        canCommit={isComplete}
        disabled={disabled}
        onSelect={onSelect}
        onCommit={onCommit}
        onNeedsBonuses={focusBonusControls}
      />
    </>
  );
}

function BackgroundDetailsModal({
  open,
  onOpenChange,
  background,
  selected,
  canCommit,
  disabled,
  onSelect,
  onCommit,
  onNeedsBonuses,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  background: BuilderBackground;
  selected: boolean;
  canCommit: boolean;
  disabled: boolean;
  onSelect: () => void;
  onCommit: () => void;
  onNeedsBonuses: () => void;
}) {
  function handleModalSelect() {
    onSelect();

    if (canCommit) {
      onCommit();
      return;
    }

    onOpenChange(false);
    onNeedsBonuses();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md sm:items-center sm:p-6">
          <Dialog.Content className="relative flex h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-xl border border-white/[0.06] bg-card text-foreground shadow-[0_0_30px_rgba(0,0,0,0.8)] outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-h-[85vh] sm:max-w-2xl sm:rounded-xl">
            <Dialog.Title className="sr-only">{background.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {`Detalhes do antecedente ${background.name}`}
            </Dialog.Description>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Fechar detalhes"
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border-border bg-background/70 text-subdued outline-none backdrop-blur transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary border"
              >
                <i aria-hidden="true" className="fa-solid fa-xmark text-sm" />
              </button>
            </Dialog.Close>

            <div className="relative h-48 w-full shrink-0 sm:h-64">
              {background.image ? (
                <Image
                  unoptimized
                  src={background.image.src}
                  alt={background.image.alt}
                  fill
                  sizes="(min-width: 640px) 42rem, 100vw"
                  className="object-cover object-top opacity-80"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="h-full w-full bg-gradient-to-br from-muted via-tone-crimson-deepest to-card"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent"
              />
              <div className="absolute bottom-0 left-0 w-full p-6">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Antecedente
                </span>
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  {background.name}
                </h2>
              </div>
            </div>

            <div
              tabIndex={0}
              aria-label={`Conteudo dos detalhes de ${background.name}`}
              className="flex-1 overflow-y-auto p-6 pb-24 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <div className="grid gap-6">
                <section>
                  <BackgroundContentBlocks
                    blocks={
                      background.descriptionBlocks.length
                        ? background.descriptionBlocks
                        : [{ type: "paragraph", text: background.description }]
                    }
                  />
                </section>

                <hr className="border-white/[0.06]" />

                <section aria-labelledby={`${background.id}-modal-rewards`}>
                  <h3
                    id={`${background.id}-modal-rewards`}
                    className="mb-4 font-serif text-lg font-semibold text-foreground"
                  >
                    Recompensas
                  </h3>
                  <div className="grid gap-4">
                    <RewardPanel
                      iconClassName="fa-solid fa-wand-sparkles"
                      title="Talento de Origem"
                      accent
                    >
                      <p className="font-medium text-primary">
                        {background.originFeat || "-"}
                      </p>
                    </RewardPanel>

                    <RewardPanel
                      iconClassName="fa-solid fa-arrow-trend-up"
                      title="Bonus de Atributo"
                    >
                      <div className="mt-2 flex flex-wrap gap-2">
                        {background.abilityOptions.map((option) => (
                          <span
                            key={option.mode}
                            className="rounded border border-border bg-surface-nested px-2 py-1 font-mono text-xs text-subdued"
                          >
                            {formatAbilityOption(option.mode, option.attributes)}
                          </span>
                        ))}
                      </div>
                    </RewardPanel>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <RewardList
                        title="Proficiencias"
                        items={background.skillProficiencies}
                      />
                      <RewardList
                        title="Ferramentas e Idiomas"
                        items={[
                          ...background.toolProficiencies,
                          background.languageChoiceCount > 0
                            ? `${background.languageChoiceCount} idioma(s) a escolha`
                            : "",
                        ].filter(Boolean)}
                      />
                    </div>

                    <RewardPanel
                      iconClassName="fa-solid fa-backpack"
                      title="Equipamento Inicial"
                    >
                      <p className="text-sm leading-6 text-subdued">
                        {background.equipmentSummary || "-"}
                      </p>
                    </RewardPanel>
                  </div>
                </section>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 z-30 w-full border-t border-white/[0.06] bg-card/95 p-4 backdrop-blur">
              <button
                type="button"
                onClick={handleModalSelect}
                disabled={disabled}
                aria-pressed={selected}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-[0.14em] text-foreground shadow-[0_0_15px_rgba(196,30,30,0.2)] outline-none transition hover:bg-brand-crimson-alt active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selected ? "SELECIONADO" : "SELECIONAR"}
                <i aria-hidden="true" className="fa-solid fa-check text-xs" />
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function BackgroundRewardCallout({
  background,
}: {
  background: BuilderBackground;
}) {
  const rewardPreview = [
    background.skillProficiencies.length
      ? `Pericias: ${formatList(background.skillProficiencies)}`
      : "",
    background.toolProficiencies.length
      ? `Ferramentas: ${formatList(background.toolProficiencies)}`
      : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <section className="mb-6 rounded-lg border border-primary/30 bg-muted p-4 shadow-[inset_0_0_15px_rgba(196,30,30,0.05)]">
      <div className="mb-2 flex items-center gap-2">
        <i
          aria-hidden="true"
          className="fa-solid fa-wand-sparkles text-sm text-primary"
        />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
          Talento de Origem
        </h4>
      </div>
      <p className="font-semibold text-foreground">{background.originFeat || "-"}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {rewardPreview || background.equipmentSummary || "-"}
      </p>
    </section>
  );
}

function BackgroundAbilitySelector({
  controlsRef,
  background,
  selected,
  disabled,
  onChange,
}: {
  controlsRef: RefObject<HTMLFieldSetElement | null>;
  background: BuilderBackground;
  selected: AttributeBonuses;
  disabled: boolean;
  onChange: (bonuses: AttributeBonuses) => void;
}) {
  const id = useId();
  const splitOption = background.abilityOptions.find(
    (option) => option.mode === "+2/+1",
  );
  const tripleOption = background.abilityOptions.find(
    (option) => option.mode === "+1/+1/+1",
  );
  const plusTwoAttribute = findAttributeByBonus(selected, 2);
  const plusOneAttribute = findAttributeByBonus(selected, 1);
  const tripleBonuses =
    tripleOption?.attributes.reduce<AttributeBonuses>(
      (bonuses, attribute) => ({ ...bonuses, [attribute]: 1 }),
      {},
    ) ?? {};
  const isTripleSelected = tripleOption
    ? hasSameBonuses(selected, tripleBonuses)
    : false;
  const isSplitSelected =
    Boolean(splitOption) &&
    !isTripleSelected &&
    Boolean(plusTwoAttribute || plusOneAttribute);

  return (
    <fieldset ref={controlsRef} className="mb-0">
      <legend className="mb-3 block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Bonus de Atributo ({formatAbilityAttributes(splitOption?.attributes)})
      </legend>
      <p id={`${background.id}-bonus-help`} className="sr-only">
        Escolha uma distribuicao de bonus antes de avancar.
      </p>
      <div className="grid gap-3">
        {splitOption ? (
          <label className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border border-white/[0.06] bg-muted p-3 text-sm text-foreground transition hover:border-white/15">
            <input
              type="radio"
              name={`${background.id}-${id}-ability-mode`}
              checked={isSplitSelected}
              disabled={disabled}
              onChange={() =>
                onChange(
                  createSplitBonuses(
                    plusTwoAttribute ?? splitOption.attributes[0],
                    plusOneAttribute ??
                      splitOption.attributes.find(
                        (attribute) => attribute !== plusTwoAttribute,
                      ),
                  ),
                )
              }
              className="mt-1 h-4 w-4 border-white/20 bg-surface-nested accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            <span>
              <span className="block font-semibold">Opcao A (+2 / +1)</span>
              <span className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <SelectBonusControl
                  label="Bonus +2"
                  ariaLabel={`${background.name}: atributo com bonus +2`}
                  value={plusTwoAttribute ?? ""}
                  disabled={disabled}
                  options={splitOption.attributes}
                  blockedOption={plusOneAttribute}
                  onChange={(value) =>
                    onChange(createSplitBonuses(value, plusOneAttribute))
                  }
                />
                <SelectBonusControl
                  label="Bonus +1"
                  ariaLabel={`${background.name}: atributo com bonus +1`}
                  value={plusOneAttribute ?? ""}
                  disabled={disabled}
                  options={splitOption.attributes}
                  blockedOption={plusTwoAttribute}
                  onChange={(value) =>
                    onChange(createSplitBonuses(plusTwoAttribute, value))
                  }
                />
              </span>
            </span>
          </label>
        ) : null}

        {tripleOption ? (
          <label className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 rounded-lg border border-white/[0.06] bg-muted p-3 text-sm text-foreground transition hover:border-white/15">
            <input
              type="radio"
              name={`${background.id}-${id}-ability-mode`}
              checked={isTripleSelected}
              disabled={disabled}
              onChange={() => onChange(tripleBonuses)}
              className="mt-1 h-4 w-4 border-white/20 bg-surface-nested accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            <span>
              <span className="block font-semibold">Opcao B (+1 / +1 / +1)</span>
              <span className="text-xs leading-5 text-muted-foreground">
                Aumente tres atributos permitidos em 1 cada.
              </span>
            </span>
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}

function SelectBonusControl({
  label,
  ariaLabel,
  value,
  disabled,
  options,
  blockedOption,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  disabled: boolean;
  options: AttributeKey[];
  blockedOption: AttributeKey | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <span className="grid gap-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-border bg-surface-nested p-2 text-xs text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
      >
        <option value="">Selecione</option>
        {options.map((attribute) => (
          <option
            key={attribute}
            value={attribute}
            disabled={attribute === blockedOption}
          >
            {ATTRIBUTE_LABELS[attribute]}
          </option>
        ))}
      </select>
    </span>
  );
}

function RewardPanel({
  iconClassName,
  title,
  accent = false,
  children,
}: {
  iconClassName: string;
  title: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-primary/30 bg-muted"
          : "border-white/[0.06] bg-muted"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${
            accent
              ? "border-primary/50 bg-destructive/20 text-primary"
              : "border-border bg-surface-nested text-brand-gold-alt"
          }`}
        >
          <i aria-hidden="true" className={`${iconClassName} text-sm`} />
        </div>
        <div className="min-w-0">
          <h4 className="mb-1 font-mono text-sm font-semibold text-foreground">
            {title}
          </h4>
          {children}
        </div>
      </div>
    </div>
  );
}

function RewardList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-muted p-4">
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h4>
      {items.length ? (
        <ul className="grid gap-1 text-sm leading-6 text-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhuma</p>
      )}
    </div>
  );
}

function BackgroundContentBlocks({ blocks }: { blocks: BuilderFeatureBlock[] }) {
  return (
    <div className="grid gap-3 text-sm leading-6 text-foreground">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="list-disc space-y-2 pl-5 marker:text-primary"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}

function isBackgroundAbilitySelectionComplete(
  background: BuilderBackground,
  bonuses: AttributeBonuses,
): boolean {
  return background.abilityOptions.some((option) => {
    const entries = Object.entries(bonuses);
    const allowed = new Set<string>(option.attributes);

    if (entries.some(([attribute]) => !allowed.has(attribute))) {
      return false;
    }

    if (option.mode === "+2/+1") {
      const values = entries.map(([, bonus]) => bonus).sort();
      return entries.length === 2 && values[0] === 1 && values[1] === 2;
    }

    return (
      entries.length === option.attributes.length &&
      entries.every(([, bonus]) => bonus === 1)
    );
  });
}

function findAttributeByBonus(
  bonuses: AttributeBonuses,
  bonus: number,
): AttributeKey | undefined {
  return attributeKeys.find((attribute) => bonuses[attribute] === bonus);
}

function createSplitBonuses(
  plusTwoAttribute: string | undefined,
  plusOneAttribute: string | undefined,
): AttributeBonuses {
  const bonuses: AttributeBonuses = {};

  if (isAttributeKey(plusTwoAttribute)) {
    bonuses[plusTwoAttribute] = 2;
  }

  if (isAttributeKey(plusOneAttribute) && plusOneAttribute !== plusTwoAttribute) {
    bonuses[plusOneAttribute] = 1;
  }

  return bonuses;
}

function isAttributeKey(value: string | undefined): value is AttributeKey {
  return attributeKeys.includes(value as AttributeKey);
}

function hasSameBonuses(first: AttributeBonuses, second: AttributeBonuses): boolean {
  return attributeKeys.every(
    (attribute) => (first[attribute] ?? 0) === (second[attribute] ?? 0),
  );
}

function formatAbilityAttributes(attributes: AttributeKey[] | undefined): string {
  return attributes?.map((attribute) => ATTRIBUTE_LABELS[attribute]).join(", ") ?? "-";
}

function formatAbilityOption(
  mode: string,
  attributes: AttributeKey[],
): string {
  return `${mode} ${formatAbilityAttributes(attributes)}`;
}

function formatList(items: readonly string[]): string {
  return items.length ? items.join(", ") : "";
}
