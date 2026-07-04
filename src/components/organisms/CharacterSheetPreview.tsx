"use client";

import { useMemo } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getAbilityModifier } from "@/src/adapters/characterDerivedAdapter";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";
import { TagList } from "@/src/components/molecules/TagList";

const attributes = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[];

interface CharacterSheetPreviewProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function CharacterSheetPreview({
  collapsed = false,
  onToggleCollapsed,
}: CharacterSheetPreviewProps) {
  const characterState = useCharacterBuilderState();
  const summary = useMemo(
    () => selectCharacterSheetSummary(characterState),
    [characterState],
  );
  const description = useCharacterStore((state) => state.description);
  const speciesName = getBuilderSpecies().find(
    (entry) => entry.id === summary.speciesId,
  )?.name;
  const className = getBuilderClasses().find(
    (entry) => entry.id === summary.classId,
  )?.name;
  const backgroundName = getBuilderBackgrounds().find(
    (entry) => entry.id === summary.backgroundId,
  )?.name;

  const toggleButton = (
    <button
      type="button"
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expand hero information" : "Collapse hero information"}
      title={collapsed ? "Expand panel" : "Collapse panel"}
      onClick={onToggleCollapsed}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-transparent text-subdued outline-none transition hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
    >
      {collapsed ? (
        <PanelRightOpen aria-hidden="true" className="h-5 w-5" />
      ) : (
        <PanelRightClose aria-hidden="true" className="h-5 w-5" />
      )}
    </button>
  );

  return (
    <aside
      aria-labelledby="sheet-preview-title"
      className="hidden border-t border-white/[0.06] bg-muted xl:block xl:min-h-[calc(100dvh-4rem)] xl:border-l xl:border-t-0"
    >
      <div className="sticky top-0 max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-5">
        {collapsed ? (
          <div className="hidden xl:grid xl:place-items-center xl:gap-3">
            {toggleButton}
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-brand-crimson-alt/40 bg-card font-serif text-lg font-bold text-foreground"
            >
              {description.nome.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <p className="sr-only" id="sheet-preview-title">
              Hero sheet collapsed
            </p>
          </div>
        ) : (
          <>
        <header className="border-b border-white/[0.06] pb-5" aria-live="polite">
          <div className="flex items-center gap-3">
            {toggleButton}
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-brand-crimson-alt/40 bg-gradient-to-br from-card to-surface-elevated font-serif text-xl font-bold text-muted-foreground"
            >
              {description.nome.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Level <span translate="no" className="notranslate">{summary.level}</span> · Rules <span translate="no" className="notranslate">{summary.ruleset}</span>
              </p>
              <h2
                id="sheet-preview-title"
                translate="no"
                className="notranslate truncate font-serif text-lg font-bold tracking-wide text-foreground"
              >
                {description.nome || "Unnamed Hero"}
              </h2>
              <p translate="no" className="notranslate text-base text-muted-foreground">
                {speciesName || "Species"} · {className || "Class"}
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="sheet-core-title" className="border-b border-white/[0.06] py-4">
          <h3
            id="sheet-core-title"
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Summary
          </h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="HP" value={String(summary.hitPoints)} tone="red" />
              <Metric label="AC" value={String(summary.armorClass)} tone="blue" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Proficiency"
                value={`+${summary.proficiencyBonus}`}
                tone="green"
              />
              <Metric label="Initiative" value={formatSigned(getAbilityModifier(summary.finalAttributes.destreza))} tone="gold" />
            </div>
            <div>
              <dt className="text-muted-foreground">Background</dt>
              <dd translate="no" className="notranslate font-semibold text-foreground">
                {backgroundName || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Origin Feat</dt>
              <dd translate="no" className="notranslate font-semibold text-foreground">
                {summary.originFeat || "Defined by background"}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="sheet-attributes-title" className="border-b border-white/[0.06] py-4">
          <h3
            id="sheet-attributes-title"
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Ability Scores
          </h3>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {attributes.map((attribute) => {
              const value = summary.finalAttributes[attribute];

              return (
                <div
                  key={attribute}
                  className="rounded-lg border border-white/[0.06] bg-card px-2 py-2 text-center"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                    {ATTRIBUTE_LABELS[attribute].slice(0, 3)}
                  </dt>
                  <dd className="mt-1 font-serif text-xl font-bold text-foreground">
                    {value}
                  </dd>
                  <dd className="mt-1 rounded border border-brand-crimson-alt/25 bg-brand-crimson-alt/15 px-1 py-0.5 text-[10px] font-bold text-foreground">
                    {formatSigned(getAbilityModifier(value))}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section aria-labelledby="sheet-features-title" className="border-b border-white/[0.06] py-4">
          <h3
            id="sheet-features-title"
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Traits and Features
          </h3>
          <div className="mt-3 grid gap-3">
            <TagList
              items={summary.selectedTraits.map((trait) => trait.name)}
              emptyLabel="Selected traits"
            />
            <TagList
              items={summary.classFeatures.map((feature) => feature.name)}
              emptyLabel="Class features"
            />
          </div>
        </section>

        <section aria-labelledby="sheet-status-title" className="py-4">
          <h3
            id="sheet-status-title"
            className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Pending Items
          </h3>
          {summary.validationMessages.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-accent">
              {summary.validationMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-md border border-brand-green/30 bg-brand-green/10 px-3 py-2 text-sm text-brand-green">
              All required steps are complete.
            </p>
          )}
        </section>
          </>
        )}
      </div>
    </aside>
  );
}

type MetricTone = "red" | "blue" | "green" | "gold";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: MetricTone;
}) {
  const toneClasses: Record<MetricTone, string> = {
    red: "before:bg-primary",
    blue: "before:bg-brand-blue",
    green: "before:bg-brand-green",
    gold: "before:bg-chart-5",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/[0.06] bg-card px-3 py-3 text-center before:absolute before:left-0 before:top-0 before:h-0.5 before:w-full ${toneClasses[tone]}`}
    >
      <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd translate="no" className="notranslate mt-1 font-serif text-xl font-bold text-foreground">{value}</dd>
    </div>
  );
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
