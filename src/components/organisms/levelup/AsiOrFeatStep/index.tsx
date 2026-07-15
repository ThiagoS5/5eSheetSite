"use client";

import { useState } from "react";
import { ABILITY_SCORE_CAP, EPIC_BOON_ABILITY_CAP } from "@/src/adapters/characterDerivedAdapter";
import { SKILL_NAMES } from "@/rules/skillRules";
import type { BuilderFeat } from "@/src/types/builder";
import type { AttributeKey } from "@/src/types/dnd";
import type { AsiOrFeatStepProps } from "./index.types";
export type { AsiOrFeatStepProps } from "./index.types";

type Tab = "asi" | "feat";
type AsiMode = "one" | "two";

export function AsiOrFeatStep({
  level,
  attributes,
  selectableFeats,
  blockedFeats = [],
  value,
  onChange,
}: AsiOrFeatStepProps) {
  const [tab, setTab] = useState<Tab>(value?.mode === "feat" ? "feat" : "asi");
  const [mode, setMode] = useState<AsiMode>(() => {
    if (value?.mode === "asi" && Object.keys(value.increases).length === 2) return "two";
    return "one";
  });
  const increases = value?.mode === "asi" ? value.increases : {};
  const picked = Object.keys(increases) as AttributeKey[];
  const perPoint = mode === "one" ? 2 : 1;
  const maxPicks = mode === "one" ? 1 : 2;
  const selectedFeatId = value?.mode === "feat" ? value.featId : "";
  const selectedFeat = selectableFeats.find((feat) => feat.id === selectedFeatId);
  const selectedSkillRequirement = selectedFeat?.effects?.choiceRequirements?.find(
    (requirement) => requirement.kind === "skill",
  );
  const selectedFeatSkills = value?.mode === "feat" ? (value.skillProficiencies ?? []) : [];

  function activeFeatValue(feat: BuilderFeat) {
    return value?.mode === "feat" && value.featId === feat.id ? value : undefined;
  }

  function switchTab(nextTab: Tab) {
    setTab(nextTab);
    if (value !== undefined && value.mode !== nextTab) {
      onChange(undefined);
    }
  }

  function emitAsi(next: Partial<Record<AttributeKey, number>>) {
    onChange({ mode: "asi", increases: next });
  }

  function pickAttr(key: AttributeKey) {
    if (picked.includes(key)) {
      const next = { ...increases };
      delete next[key];
      emitAsi(next);
      return;
    }
    const current = attributes.find((attr) => attr.key === key)?.current ?? 0;
    if (current + perPoint > ABILITY_SCORE_CAP) return;
    if (mode === "one") {
      emitAsi({ [key]: 2 });
      return;
    }
    if (picked.length >= maxPicks) return;
    emitAsi({ ...increases, [key]: 1 });
  }

  function switchMode(nextMode: AsiMode) {
    setMode(nextMode);
    onChange({ mode: "asi", increases: {} });
  }

  function chooseFeat(feat: BuilderFeat) {
    onChange({ mode: "feat", featId: feat.id });
  }

  function featAbilityCap(feat: BuilderFeat) {
    return feat.category === "epic-boon" ? EPIC_BOON_ABILITY_CAP : ABILITY_SCORE_CAP;
  }

  function chooseFeatAbility(feat: BuilderFeat, key: AttributeKey) {
    const current = attributes.find((attr) => attr.key === key)?.current ?? 0;
    const amount = feat.abilityBonus?.choose?.amount ?? 1;
    if (current + amount > featAbilityCap(feat)) return;
    const activeValue = activeFeatValue(feat);
    onChange({
      mode: "feat",
      featId: feat.id,
      asi: { [key]: feat.abilityBonus?.choose?.amount ?? 1 },
      skillProficiencies: activeValue?.skillProficiencies,
      toolProficiencies: activeValue?.toolProficiencies,
      languageProficiencies: activeValue?.languageProficiencies,
    });
  }

  function chooseFeatSkill(feat: BuilderFeat, skill: string) {
    const activeValue = activeFeatValue(feat);
    const requirement = feat.effects?.choiceRequirements?.find((entry) => entry.kind === "skill");
    const current = activeValue?.skillProficiencies ?? [];
    const next = current.includes(skill)
      ? current.filter((entry) => entry !== skill)
      : requirement?.count === 1
        ? [skill]
        : current.length < (requirement?.count ?? 1)
          ? [...current, skill]
          : current;

    onChange({
      mode: "feat",
      featId: feat.id,
      asi: activeValue?.asi,
      skillProficiencies: next,
      toolProficiencies: activeValue?.toolProficiencies,
      languageProficiencies: activeValue?.languageProficiencies,
    });
  }

  return (
    <section aria-label={`Level ${level} - Ability Score Improvement or Feat`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Level <span translate="no" className="notranslate">{level}</span></p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Ability Score Improvement or Feat</h2>
      </header>

      <div className="mb-4 flex gap-2">
        <button type="button" aria-pressed={tab === "asi"} onClick={() => switchTab("asi")}
          className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground [&:not([aria-pressed=true])]:border-white/[0.08] [&:not([aria-pressed=true])]:text-muted-foreground [&:not([aria-pressed=true])]:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Ability Score Improvement
        </button>
        <button type="button" aria-pressed={tab === "feat"} onClick={() => switchTab("feat")}
          className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground [&:not([aria-pressed=true])]:border-white/[0.08] [&:not([aria-pressed=true])]:text-muted-foreground [&:not([aria-pressed=true])]:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Feat
        </button>
      </div>

      {tab === "asi" ? (
        <div>
          <div className="mb-3 flex gap-2">
            <button type="button" onClick={() => switchMode("one")} aria-pressed={mode === "one"}
              className="rounded-full border px-3 py-1 text-xs outline-none aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent [&:not([aria-pressed=true])]:border-white/[0.12] [&:not([aria-pressed=true])]:text-muted-foreground">
              +2 to one
            </button>
            <button type="button" onClick={() => switchMode("two")} aria-pressed={mode === "two"}
              className="rounded-full border px-3 py-1 text-xs outline-none aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent [&:not([aria-pressed=true])]:border-white/[0.12] [&:not([aria-pressed=true])]:text-muted-foreground">
              +1 to two
            </button>
          </div>
          <p className="mb-3 text-xs text-faint">
            {mode === "one" ? "Select 1 ability score to receive +2." : "Mark 2 ability scores to receive +1 each."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {attributes.map((attr) => {
              const isSel = picked.includes(attr.key);
              const atCap = !isSel && attr.current + perPoint > ABILITY_SCORE_CAP;
              const isLocked = atCap || (!isSel && picked.length >= maxPicks);
              const newVal = isSel ? attr.current + perPoint : attr.current;
              return (
                <button key={attr.key} type="button" onClick={() => pickAttr(attr.key)} disabled={isLocked} aria-pressed={isSel}
                  className="flex items-center justify-between rounded-md border border-white/[0.08] bg-card px-3 py-2 text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground">
                  <span>{attr.label}</span>
                  <span translate="no" className="notranslate">{atCap ? <span className="text-xs text-faint">Max {ABILITY_SCORE_CAP} </span> : null}{isSel ? <span className="font-bold text-accent">+{perPoint} </span> : null}{attr.current} -&gt; {newVal}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {selectableFeats.length === 0 && blockedFeats.length === 0 ? (
            <p className="text-sm text-faint">No eligible feat.</p>
          ) : (
            <>
              {selectableFeats.map((feat) => (
                <button key={feat.id} type="button" onClick={() => chooseFeat(feat)} aria-pressed={feat.id === selectedFeatId}
                  className="rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10">
                  <span translate="no" className="notranslate block text-sm font-semibold text-foreground">{feat.name}</span>
                  {feat.description ? <span className="mt-0.5 block text-xs text-faint">{feat.description}</span> : null}
                </button>
              ))}
              {blockedFeats.map(({ feat, reason }) => (
                <div key={feat.id} className="rounded-md border border-white/[0.06] bg-muted/30 px-3 py-2 text-left opacity-70">
                  <span translate="no" className="notranslate block text-sm font-semibold text-foreground">{feat.name}</span>
                  <span className="mt-0.5 block text-xs text-faint">{reason}</span>
                </div>
              ))}
            </>
          )}
          {selectedFeat?.abilityBonus?.choose ? (
            <div className="mt-2 rounded-md border border-white/[0.08] bg-background/40 p-3">
              <p className="mb-2 text-xs text-faint">Choose the ability score increased by this feat.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {attributes
                  .filter((attr) => selectedFeat.abilityBonus?.choose?.from.includes(attr.key))
                  .map((attr) => {
                    const amount = selectedFeat.abilityBonus?.choose?.amount ?? 1;
                    const cap = featAbilityCap(selectedFeat);
                    const isSelected = value?.mode === "feat" && value.asi?.[attr.key] === amount;
                    const atCap = !isSelected && attr.current + amount > cap;
                    return (
                      <button
                        key={attr.key}
                        type="button"
                        onClick={() => chooseFeatAbility(selectedFeat, attr.key)}
                        disabled={atCap}
                        aria-pressed={isSelected}
                        className="flex items-center justify-between rounded-md border border-white/[0.08] bg-card px-3 py-2 text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground"
                      >
                        <span>{attr.label}</span>
                        <span translate="no" className="notranslate">{atCap ? <span className="text-xs text-faint">Max {cap} </span> : null}<span className="font-bold text-accent">+{amount} </span>{attr.current} -&gt; {atCap ? attr.current : attr.current + amount}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : null}
          {selectedFeat && selectedSkillRequirement ? (
            <div className="mt-2 rounded-md border border-white/[0.08] bg-background/40 p-3">
              <p className="mb-2 text-xs text-faint">
                Choose {selectedSkillRequirement.count} skill
                {selectedSkillRequirement.count > 1 ? "s" : ""} granted
                by this feat.
              </p>
              <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {(selectedSkillRequirement.options ?? SKILL_NAMES).map((skill) => {
                  const isSelected = selectedFeatSkills.includes(skill);
                  const isLocked =
                    !isSelected && selectedFeatSkills.length >= selectedSkillRequirement.count;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => chooseFeatSkill(selectedFeat, skill)}
                      disabled={isLocked}
                      aria-pressed={isSelected}
                      className="rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground"
                    >
                      <span translate="no" className="notranslate">{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
