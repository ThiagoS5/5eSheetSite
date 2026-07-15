"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Lock, X } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { parseRulesText } from "@/src/adapters/rulesTextAst";
import { FontAwesomeIcon } from "@/src/components/atoms/FontAwesomeIcon";
import { FeatureTagList } from "@/src/components/molecules/FeatureTagList";
import { HeroChoiceCard } from "@/src/components/molecules/HeroChoiceCard";
import {
  getClassBannerIconClass,
  getHeroClassTheme,
} from "@/src/components/molecules/heroClassTheme";
import { RulesTextView } from "@/src/components/molecules/RulesTextView";
import { WizardStepHeader } from "@/src/components/molecules/WizardStepHeader";
import { getLevelRequirements } from "@/rules/levelProgression";
import type { BuilderClass, BuilderSubclass } from "@/src/types/builder";

interface SubclassStepScreenProps {
  characterClass?: BuilderClass;
  level: number;
  selectedSubclassId: string;
  activeSources: string[];
  disabled: boolean;
  onSelect: (subclassId: string) => void;
}

/**
 * Builder screen for the class category: pick the subclass with the same
 * hero-card model used by the Class step, inheriting the class theme.
 */
export function SubclassStepScreen({
  characterClass,
  level,
  selectedSubclassId,
  activeSources,
  disabled,
  onSelect,
}: SubclassStepScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const unlockLevel = useMemo(() => {
    if (!characterClass) return 3;
    return (
      getLevelRequirements(characterClass, 0, 20).find(
        (requirement) => requirement.kind === "subclass",
      )?.level ?? 3
    );
  }, [characterClass]);

  const subclasses = useMemo(
    () =>
      (characterClass?.subclasses ?? []).filter(
        (subclass) =>
          // Fontes fora das preferências ficam ocultas, exceto uma subclasse
          // já escolhida — o jogador nunca deve perder de vista a seleção atual.
          (activeSources.includes(subclass.source) ||
            subclass.id === selectedSubclassId) &&
          matchesSubclassSearch(subclass, searchQuery),
      ),
    [characterClass, searchQuery, activeSources, selectedSubclassId],
  );

  if (!characterClass) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
        <h3 className="font-serif text-lg font-bold text-foreground">
          No class selected
        </h3>
        <p className="mt-2 text-sm leading-6 text-subdued">
          Choose a class first; its subclasses appear here.
        </p>
      </div>
    );
  }

  const isLocked = level < unlockLevel;
  const resultCountLabel =
    subclasses.length === 1
      ? "1 subclass found"
      : `${subclasses.length} subclasses found`;

  return (
    <section aria-labelledby="subclass-options-title" className="grid gap-6">
      <WizardStepHeader
        eyebrow={`${characterClass.name} · Level ${unlockLevel}`}
        title="Choose a Subclass"
        description={`The subclass specializes your ${characterClass.name} with exclusive features gained at level ${unlockLevel} and beyond.`}
        id="subclass-options-title"
        searchId="subclass-filter"
        searchLabel="Filter subclasses"
        searchValue={searchQuery}
        searchPlaceholder="Name, source, or feature..."
        resultCountLabel={resultCountLabel}
        onSearch={setSearchQuery}
      />

      {isLocked ? (
        <p
          role="status"
          className="flex items-center gap-3 rounded-lg border border-brand-gold-alt/35 bg-brand-gold-alt/10 px-4 py-3 text-sm leading-6 text-foreground"
        >
          <Lock aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-gold-alt" />
          <span>
            Subclass unlocks at level{" "}
            <strong className="font-semibold">{unlockLevel}</strong>. This
            character is level {level} — browse the options now and choose when
            you level up.
          </span>
        </p>
      ) : null}

      {subclasses.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {subclasses.map((subclass) => (
            <SubclassOptionCard
              key={subclass.id}
              subclass={subclass}
              characterClass={characterClass}
              unlockLevel={unlockLevel}
              selected={selectedSubclassId === subclass.id}
              disabled={disabled || isLocked}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center">
          <h3 className="font-serif text-lg font-bold text-foreground">
            No subclass found
          </h3>
          <p className="mt-2 text-sm leading-6 text-subdued">
            Try searching by name, source, or feature.
          </p>
        </div>
      )}
    </section>
  );
}

const SubclassOptionCard = memo(function SubclassOptionCard({
  subclass,
  characterClass,
  unlockLevel,
  selected,
  disabled,
  onSelect,
}: {
  subclass: BuilderSubclass;
  characterClass: BuilderClass;
  unlockLevel: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (subclassId: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const handleSelect = useCallback(
    () => onSelect(subclass.id),
    [onSelect, subclass.id],
  );
  const featuresByLevel = groupFeaturesByLevel(subclass, unlockLevel);
  const unlockFeatures = featuresByLevel[0]?.features ?? [];
  const progressionLabel = featuresByLevel
    .map((group) => group.level)
    .join(" · ");

  return (
    <>
      <HeroChoiceCard
        title={subclass.name}
        badges={[subclass.source, characterClass.name]}
        description={getSubclassSummary(subclass)}
        icon={
          <FontAwesomeIcon iconClassName={getClassBannerIconClass(characterClass)} />
        }
        theme={getHeroClassTheme(characterClass)}
        isActive={selected}
        disabled={disabled}
        onClickDetails={() => setDetailsOpen(true)}
        onClickSelect={handleSelect}
      >
        <div className="grid gap-2 rounded-lg bg-black/40 p-3 backdrop-blur-[2px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              Feature Levels
            </span>
            <span translate="no" className="notranslate font-mono text-sm font-bold text-white">
              {progressionLabel || "-"}
            </span>
          </div>
          <div>
            <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              Level {unlockLevel} Features
            </h4>
            <FeatureTagList
              features={unlockFeatures}
              emptyLabel="None"
              ariaLabel={`Level ${unlockLevel} features of ${subclass.name}`}
            />
          </div>
        </div>
      </HeroChoiceCard>

      <SubclassDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        subclass={subclass}
        characterClass={characterClass}
        featuresByLevel={featuresByLevel}
        selected={selected}
        disabled={disabled}
        onSelect={handleSelect}
      />
    </>
  );
});

function SubclassDetailsDialog({
  open,
  onOpenChange,
  subclass,
  characterClass,
  featuresByLevel,
  selected,
  disabled,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subclass: BuilderSubclass;
  characterClass: BuilderClass;
  featuresByLevel: FeatureLevelGroup[];
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const theme = getHeroClassTheme(characterClass);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100svh] w-full min-w-0 flex-col border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,820px)] md:max-w-3xl md:overflow-hidden md:rounded-xl">
            <Dialog.Title className="sr-only">{subclass.name}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {`${subclass.name} details: ${characterClass.name} subclass.`}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={`Close ${subclass.name} details`}
                className="absolute right-3 top-3 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none backdrop-blur transition hover:border-brand-gold-alt/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            <header
              className="shrink-0 border-b border-white/[0.06] px-6 pb-5 pt-6"
              style={{
                backgroundImage: `linear-gradient(160deg, color-mix(in srgb, ${theme.theme} 72%, transparent) 0%, transparent 78%)`,
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {characterClass.name} Subclass · {subclass.source}
              </p>
              <h2
                translate="no"
                className="notranslate mt-1 font-serif text-3xl font-bold tracking-wide text-foreground"
              >
                {subclass.name}
              </h2>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-6">
                {featuresByLevel.map((group) => (
                  <section
                    key={group.level}
                    aria-label={`Level ${group.level} features`}
                  >
                    <h3 className="mb-3 border-b border-white/[0.06] pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold-alt">
                      Level {group.level}
                    </h3>
                    <div className="grid gap-4">
                      {group.features.map((feature, index) => (
                        <article key={`${feature.name}-${index}`}>
                          <h4 className="font-serif text-lg font-bold text-foreground">
                            {feature.name}
                          </h4>
                          <div className="mt-1 text-sm leading-6 text-subdued">
                            <RulesTextView
                              nodes={
                                feature.blocks?.length
                                  ? feature.blocks
                                  : parseRulesText(feature.description)
                              }
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <footer className="shrink-0 border-t border-white/[0.06] bg-surface-nested/95 p-4 backdrop-blur">
              <button
                type="button"
                onClick={onSelect}
                disabled={disabled}
                aria-pressed={selected}
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-serif text-lg font-semibold text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? "border-brand-gold-alt bg-brand-gold-alt/20"
                    : "border-destructive/70 bg-destructive shadow-[0_0_18px_rgba(230,28,35,0.2)] hover:border-primary hover:bg-primary"
                }`}
              >
                {selected ? "Selected" : `Select ${subclass.name}`}
              </button>
            </footer>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface FeatureLevelGroup {
  level: number;
  features: BuilderSubclass["features"];
}

function groupFeaturesByLevel(
  subclass: BuilderSubclass,
  unlockLevel: number,
): FeatureLevelGroup[] {
  const groups = new Map<number, BuilderSubclass["features"]>();
  for (const feature of subclass.features) {
    const level = feature.level ?? unlockLevel;
    const bucket = groups.get(level) ?? [];
    bucket.push(feature);
    groups.set(level, bucket);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([level, features]) => ({ level, features }));
}

function getSubclassSummary(subclass: BuilderSubclass): string {
  const description = subclass.features[0]?.description ?? "";
  const plain = description.replace(/\{@\w+ ([^}|]+)(\|[^}]*)?\}/g, "$1");
  return (
    plain ||
    `No feature details available for the ${subclass.source} source yet.`
  );
}

function matchesSubclassSearch(subclass: BuilderSubclass, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  const haystack = normalizeSearchText(
    [
      subclass.name,
      subclass.shortName,
      subclass.source,
      ...subclass.features.map((feature) => feature.name),
    ].join(" "),
  );
  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
