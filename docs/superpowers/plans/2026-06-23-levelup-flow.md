# LevelUpFlow Implementation Plan (Level-Up Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `LevelUpFlow` modal (step-by-step UI) that resolves a character's pending level choices (subclass / ASI-or-feat / feature-option), plus two triggers: a "Subir de Nível" button on the sheet and a starting-level stepper in the wizard.

**Architecture:** A connected orchestrator (`LevelUpFlow`) reads the store + Phase 1 engine, snapshots the pending requirements on open, and renders one **presentational** step component at a time inside a Radix `Dialog` with a stepper. Step components are controlled (props in, callbacks out) so they unit-test without the store. All choices write to the store immediately via existing actions; "Continuar" is gated by the resolver. No new D&D rules in the UI.

**Tech Stack:** React (customized Next.js), TypeScript, Zustand (via `CharacterStoreProvider`), `@radix-ui/react-dialog`, Tailwind v4 design tokens, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-06-23-levelup-flow-design.md`

**Conventions for every task:** `npx vitest run <path>`, `npx tsc --noEmit`, `npx eslint <paths>`. Attribute keys are PT: `forca | destreza | constituicao | inteligencia | sabedoria | carisma`. Use design tokens (no hex literals). Do NOT `git add -A`; never stage `README.md`/`next-env.d.ts`. End commit messages with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. Branch: `feat/levelup-flow`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/store/levelChoiceResolver.ts` | (+) `getPendingRequirements`; refactor `getUnresolvedLevelChoices` to derive from it. |
| `src/components/organisms/levelup/types.ts` | Shared prop types for step components. |
| `src/components/organisms/levelup/SubclassStep.tsx` | Presentational subclass picker (cards). |
| `src/components/organisms/levelup/FeatureOptionStep.tsx` | Presentational "choose N" multi-select. |
| `src/components/organisms/levelup/AsiOrFeatStep.tsx` | Presentational ASI ⇄ Feat controlled step. |
| `src/components/organisms/levelup/LevelUpFlow.tsx` | Connected orchestrator: Dialog + stepper, wires store/engine. |
| `src/components/molecules/LevelUpButton.tsx` | Sheet trigger (bumps level, opens flow). |
| `src/components/molecules/StartingLevelStepper.tsx` | Wizard trigger (sets starting level, opens flow). |
| `src/components/organisms/sheet/SheetHeader.tsx` | Mount `LevelUpButton`. |
| `src/components/pages/BuilderStepPanel.tsx` | Mount `StartingLevelStepper` in the Classe step. |

---

## Task 1: Resolver — `getPendingRequirements`

**Files:**
- Modify: `src/store/levelChoiceResolver.ts`
- Test: `src/store/_tests_/levelChoiceResolver.test.ts`

- [ ] **Step 1: Write the failing test** — append to `src/store/_tests_/levelChoiceResolver.test.ts`:

```ts
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";

describe("getPendingRequirements", () => {
  it("returns the full unresolved requirement objects (with options/level/kind)", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);

    const pending = getPendingRequirements(store.getState(), fighterClass());
    // subclass@3 and asi-or-feat@4 are unresolved; weapon-mastery@1 too.
    expect(pending.some((r) => r.kind === "subclass" && r.level === 3)).toBe(true);
    expect(pending.some((r) => r.kind === "asi-or-feat" && r.level === 4)).toBe(true);
    const wm = pending.find((r) => r.kind === "feature-option");
    expect(wm && "options" in wm && Array.isArray(wm.options)).toBe(true);
  });

  it("drops a requirement once it is resolved", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");

    const pending = getPendingRequirements(store.getState(), fighterClass());
    expect(pending.some((r) => r.kind === "subclass")).toBe(false);
  });
});
```
(`fighterClass()` and `createCharacterStore` are already imported in this test file from earlier tasks.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/_tests_/levelChoiceResolver.test.ts -t "getPendingRequirements"`
Expected: FAIL — `getPendingRequirements` is not exported.

- [ ] **Step 3: Refactor the resolver**

In `src/store/levelChoiceResolver.ts`, add a `LevelChoiceRequirement` import and a single resolution predicate, then express `getPendingRequirements` and re-express `getUnresolvedLevelChoices` on top of it. Replace the existing `getUnresolvedLevelChoices` function with:

```ts
import { getLevelRequirements, type LevelChoiceRequirement } from "@/rules/levelProgression";

function isRequirementResolved(
  req: LevelChoiceRequirement,
  state: CharacterBuilderState,
  validSubclassIds: Set<string>,
): boolean {
  if (req.kind === "subclass") {
    return state.selectedSubclassId !== "" && validSubclassIds.has(state.selectedSubclassId);
  }
  if (req.kind === "asi-or-feat") {
    const choice = state.asiOrFeatByLevel[String(req.level)];
    return (
      choice !== undefined &&
      (choice.mode === "feat" ? choice.featId !== "" : isValidAsi(choice))
    );
  }
  return (state.classFeatureChoices[req.id] ?? []).length === req.count;
}

/** Full unresolved requirement objects for levels 1..currentLevel, in order. */
export function getPendingRequirements(
  state: CharacterBuilderState,
  characterClass: BuilderClass,
): LevelChoiceRequirement[] {
  const validSubclassIds = new Set(
    getSubclassesForClass(characterClass.id).map((s) => s.id),
  );
  return getLevelRequirements(characterClass, 0, state.level).filter(
    (req) => !isRequirementResolved(req, state, validSubclassIds),
  );
}

function requirementLabel(req: LevelChoiceRequirement): string {
  if (req.kind === "subclass") return `Nível ${req.level}: escolha uma subclasse`;
  if (req.kind === "asi-or-feat") return `Nível ${req.level}: escolha ASI ou talento`;
  return `Nível ${req.level}: ${req.featureName}`;
}

/** Which level choices (1..currentLevel) are still missing or invalid. */
export function getUnresolvedLevelChoices(
  state: CharacterBuilderState,
  characterClass: BuilderClass,
): UnresolvedChoice[] {
  return getPendingRequirements(state, characterClass).map((req) => ({
    level: req.level,
    kind: req.kind,
    label: requirementLabel(req),
  }));
}
```

Remove the now-unused inline `getLevelRequirements`-only import line if duplicated (keep the single combined import shown above). Keep `isValidAsi`, `collectAsiBonuses`, `getActiveSubclassFeatures`, `addBonuses`, and the `UnresolvedChoice` interface exactly as they are.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/store/_tests_/levelChoiceResolver.test.ts`
Expected: PASS — both new tests and ALL pre-existing resolver tests (the `getUnresolvedLevelChoices` behavior is unchanged).

- [ ] **Step 5: Typecheck + lint + commit**

Run: `npx tsc --noEmit` and `npx eslint src/store/levelChoiceResolver.ts` → clean.

```bash
git add src/store/levelChoiceResolver.ts src/store/_tests_/levelChoiceResolver.test.ts
git commit -m "refactor(store): getPendingRequirements; derive getUnresolvedLevelChoices from it"
```

---

## Task 2: Step prop types + `SubclassStep`

**Files:**
- Create: `src/components/organisms/levelup/types.ts`
- Create: `src/components/organisms/levelup/SubclassStep.tsx`
- Test: `src/components/organisms/levelup/_tests_/SubclassStep.test.tsx`

- [ ] **Step 1: Write the failing test** — create `src/components/organisms/levelup/_tests_/SubclassStep.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubclassStep } from "@/src/components/organisms/levelup/SubclassStep";
import type { BuilderSubclass } from "@/types/builder";

const subclasses: BuilderSubclass[] = [
  { id: "battle-master-xphb", name: "Battle Master", shortName: "Battle Master", source: "XPHB", features: [{ name: "Combat Superiority", description: "...", level: 3 }] },
  { id: "champion-xphb", name: "Champion", shortName: "Champion", source: "XPHB", features: [] },
];

describe("SubclassStep", () => {
  afterEach(cleanup);

  it("renders a card per subclass and calls onSelect", () => {
    const onSelect = vi.fn();
    render(<SubclassStep level={3} subclasses={subclasses} selectedSubclassId="" onSelect={onSelect} />);

    expect(screen.getByText("Battle Master")).toBeInTheDocument();
    expect(screen.getByText("Champion")).toBeInTheDocument();
    screen.getByRole("button", { name: /Battle Master|Selecionar/i });
    // Click the Battle Master card's select button
    const cards = screen.getAllByRole("button", { name: /Selecionar|Selecionado/i });
    cards[0].click();
    expect(onSelect).toHaveBeenCalledWith("battle-master-xphb");
  });

  it("marks the selected subclass", () => {
    render(<SubclassStep level={3} subclasses={subclasses} selectedSubclassId="champion-xphb" onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Selecionado" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/levelup/_tests_/SubclassStep.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create the shared types**

Create `src/components/organisms/levelup/types.ts`:

```ts
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderChoiceOption, BuilderFeat, BuilderSubclass } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";

export interface SubclassStepProps {
  level: number;
  subclasses: BuilderSubclass[];
  selectedSubclassId: string;
  onSelect: (subclassId: string) => void;
}

export interface FeatureOptionStepProps {
  level: number;
  featureName: string;
  count: number;
  options: BuilderChoiceOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export interface AsiAttribute {
  key: AttributeKey;
  label: string;
  current: number;
}

export interface AsiOrFeatStepProps {
  level: number;
  attributes: AsiAttribute[];
  selectableFeats: BuilderFeat[];
  value: AsiOrFeatChoice | undefined;
  onChange: (choice: AsiOrFeatChoice | undefined) => void;
}
```

- [ ] **Step 4: Create `SubclassStep`**

Create `src/components/organisms/levelup/SubclassStep.tsx`:

```tsx
"use client";

import { ChoiceCard } from "@/src/components/molecules/ChoiceCard";
import type { SubclassStepProps } from "@/src/components/organisms/levelup/types";

export function SubclassStep({ level, subclasses, selectedSubclassId, onSelect }: SubclassStepProps) {
  return (
    <section aria-label={`Nível ${level} · Subclasse`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Nível {level}
        </p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Subclasse</h2>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {subclasses.map((subclass) => (
          <ChoiceCard
            key={subclass.id}
            title={subclass.name}
            selected={subclass.id === selectedSubclassId}
            onSelect={() => onSelect(subclass.id)}
          >
            {subclass.features[0]?.description || "Subclasse de classe."}
          </ChoiceCard>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/levelup/_tests_/SubclassStep.test.tsx`
Expected: PASS.

- [ ] **Step 6: Typecheck + lint + commit**

Run: `npx tsc --noEmit` and `npx eslint src/components/organisms/levelup/types.ts src/components/organisms/levelup/SubclassStep.tsx` → clean.

```bash
git add src/components/organisms/levelup/types.ts src/components/organisms/levelup/SubclassStep.tsx src/components/organisms/levelup/_tests_/SubclassStep.test.tsx
git commit -m "feat(levelup): SubclassStep presentational component + step prop types"
```

---

## Task 3: `FeatureOptionStep`

**Files:**
- Create: `src/components/organisms/levelup/FeatureOptionStep.tsx`
- Test: `src/components/organisms/levelup/_tests_/FeatureOptionStep.test.tsx`

- [ ] **Step 1: Write the failing test** — create `src/components/organisms/levelup/_tests_/FeatureOptionStep.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureOptionStep } from "@/src/components/organisms/levelup/FeatureOptionStep";
import type { BuilderChoiceOption } from "@/types/builder";

const options: BuilderChoiceOption[] = [
  { label: "Longsword", value: "Longsword" },
  { label: "Shortsword", value: "Shortsword" },
  { label: "Greataxe", value: "Greataxe" },
];

describe("FeatureOptionStep", () => {
  afterEach(cleanup);

  it("adds a value on click", () => {
    const onChange = vi.fn();
    render(<FeatureOptionStep level={1} featureName="Weapon Mastery" count={2} options={options} selected={[]} onChange={onChange} />);
    screen.getByRole("button", { name: "Longsword" }).click();
    expect(onChange).toHaveBeenCalledWith(["Longsword"]);
  });

  it("removes an already-selected value on click", () => {
    const onChange = vi.fn();
    render(<FeatureOptionStep level={1} featureName="Weapon Mastery" count={2} options={options} selected={["Longsword"]} onChange={onChange} />);
    screen.getByRole("button", { name: "Longsword" }).click();
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("ignores clicks once count is reached", () => {
    const onChange = vi.fn();
    render(<FeatureOptionStep level={1} featureName="Weapon Mastery" count={2} options={options} selected={["Longsword", "Shortsword"]} onChange={onChange} />);
    screen.getByRole("button", { name: "Greataxe" }).click();
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/levelup/_tests_/FeatureOptionStep.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `FeatureOptionStep`**

Create `src/components/organisms/levelup/FeatureOptionStep.tsx`:

```tsx
"use client";

import type { FeatureOptionStepProps } from "@/src/components/organisms/levelup/types";

export function FeatureOptionStep({
  level,
  featureName,
  count,
  options,
  selected,
  onChange,
}: FeatureOptionStepProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
      return;
    }
    if (selected.length >= count) return;
    onChange([...selected, value]);
  };

  return (
    <section aria-label={`Nível ${level} · ${featureName}`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Nível {level} · escolha {count}
        </p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">{featureName}</h2>
      </header>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isLocked = !isSelected && selected.length >= count;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              disabled={isLocked}
              aria-pressed={isSelected}
              className="flex items-center justify-between rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground"
            >
              {option.label}
              {isSelected ? <i aria-hidden="true" className="fa-solid fa-check text-brand-crimson-alt" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/levelup/_tests_/FeatureOptionStep.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + lint + commit**

```bash
git add src/components/organisms/levelup/FeatureOptionStep.tsx src/components/organisms/levelup/_tests_/FeatureOptionStep.test.tsx
git commit -m "feat(levelup): FeatureOptionStep multi-select component"
```

---

## Task 4: `AsiOrFeatStep`

**Files:**
- Create: `src/components/organisms/levelup/AsiOrFeatStep.tsx`
- Test: `src/components/organisms/levelup/_tests_/AsiOrFeatStep.test.tsx`

- [ ] **Step 1: Write the failing test** — create `src/components/organisms/levelup/_tests_/AsiOrFeatStep.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AsiOrFeatStep } from "@/src/components/organisms/levelup/AsiOrFeatStep";
import type { AsiAttribute } from "@/src/components/organisms/levelup/types";
import type { BuilderFeat } from "@/types/builder";

const attributes: AsiAttribute[] = [
  { key: "forca", label: "Força", current: 13 },
  { key: "destreza", label: "Destreza", current: 12 },
  { key: "constituicao", label: "Constituição", current: 14 },
  { key: "inteligencia", label: "Inteligência", current: 10 },
  { key: "sabedoria", label: "Sabedoria", current: 11 },
  { key: "carisma", label: "Carisma", current: 8 },
];
const feats: BuilderFeat[] = [
  { id: "alert-xphb", name: "Alert", source: "XPHB", category: "general", prerequisites: [], repeatable: false, description: "" },
];

describe("AsiOrFeatStep", () => {
  afterEach(cleanup);

  it("emits a +2 ASI in single mode", () => {
    const onChange = vi.fn();
    render(<AsiOrFeatStep level={4} attributes={attributes} selectableFeats={feats} value={undefined} onChange={onChange} />);
    // default tab = ASI, default mode = +2 em um
    screen.getByRole("button", { name: /Constituição/ }).click();
    expect(onChange).toHaveBeenCalledWith({ mode: "asi", increases: { constituicao: 2 } });
  });

  it("emits a +1/+1 ASI after switching to '+1 em dois'", () => {
    const onChange = vi.fn();
    render(<AsiOrFeatStep level={4} attributes={attributes} selectableFeats={feats} value={undefined} onChange={onChange} />);
    screen.getByRole("button", { name: "+1 em dois" }).click();
    screen.getByRole("button", { name: /Força/ }).click();
    screen.getByRole("button", { name: /Destreza/ }).click();
    expect(onChange).toHaveBeenLastCalledWith({ mode: "asi", increases: { forca: 1, destreza: 1 } });
  });

  it("switching to the Talento tab shows feats and emits a feat choice", () => {
    const onChange = vi.fn();
    render(<AsiOrFeatStep level={4} attributes={attributes} selectableFeats={feats} value={undefined} onChange={onChange} />);
    screen.getByRole("button", { name: "Talento" }).click();
    screen.getByRole("button", { name: /Alert/ }).click();
    expect(onChange).toHaveBeenCalledWith({ mode: "feat", featId: "alert-xphb" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/levelup/_tests_/AsiOrFeatStep.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `AsiOrFeatStep`**

Create `src/components/organisms/levelup/AsiOrFeatStep.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { AsiOrFeatStepProps } from "@/src/components/organisms/levelup/types";
import type { AttributeKey } from "@/types/dnd";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";

type Tab = "asi" | "feat";
type AsiMode = "one" | "two";

export function AsiOrFeatStep({ level, attributes, selectableFeats, value, onChange }: AsiOrFeatStepProps) {
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

  function emitAsi(next: Partial<Record<AttributeKey, number>>) {
    const choice: AsiOrFeatChoice = { mode: "asi", increases: next };
    onChange(choice);
  }

  function pickAttr(key: AttributeKey) {
    if (picked.includes(key)) {
      const next = { ...increases };
      delete next[key];
      emitAsi(next);
      return;
    }
    if (mode === "one") {
      emitAsi({ [key]: 2 });
      return;
    }
    if (picked.length >= maxPicks) return;
    emitAsi({ ...increases, [key]: 1 });
  }

  function switchMode(nextMode: AsiMode) {
    setMode(nextMode);
    emitAsi({}); // reset picks when switching ASI sub-mode
  }

  return (
    <section aria-label={`Nível ${level} · Aumento de Atributo ou Talento`}>
      <header className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Nível {level}</p>
        <h2 className="font-serif text-xl font-bold tracking-wide text-foreground">Aumento de Atributo ou Talento</h2>
      </header>

      <div className="mb-4 flex gap-2" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "asi"} onClick={() => setTab("asi")}
          className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition aria-selected:border-brand-crimson-alt aria-selected:bg-brand-crimson-alt/10 aria-selected:text-foreground [&:not([aria-selected=true])]:border-white/[0.08] [&:not([aria-selected=true])]:text-muted-foreground [&:not([aria-selected=true])]:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Aumento de Atributo
        </button>
        <button type="button" role="tab" aria-selected={tab === "feat"} onClick={() => setTab("feat")}
          className="flex-1 rounded-md border px-3 py-2 text-sm font-semibold outline-none transition aria-selected:border-brand-crimson-alt aria-selected:bg-brand-crimson-alt/10 aria-selected:text-foreground [&:not([aria-selected=true])]:border-white/[0.08] [&:not([aria-selected=true])]:text-muted-foreground [&:not([aria-selected=true])]:opacity-60 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Talento
        </button>
      </div>

      {tab === "asi" ? (
        <div>
          <div className="mb-3 flex gap-2">
            <button type="button" onClick={() => switchMode("one")} aria-pressed={mode === "one"}
              className="rounded-full border px-3 py-1 text-xs outline-none aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent [&:not([aria-pressed=true])]:border-white/[0.12] [&:not([aria-pressed=true])]:text-muted-foreground">
              +2 em um
            </button>
            <button type="button" onClick={() => switchMode("two")} aria-pressed={mode === "two"}
              className="rounded-full border px-3 py-1 text-xs outline-none aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent [&:not([aria-pressed=true])]:border-white/[0.12] [&:not([aria-pressed=true])]:text-muted-foreground">
              +1 em dois
            </button>
          </div>
          <p className="mb-3 text-xs text-faint">
            {mode === "one" ? "Selecione 1 atributo para receber +2." : "Marque 2 atributos para receber +1 cada."}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {attributes.map((attr) => {
              const isSel = picked.includes(attr.key);
              const isLocked = !isSel && picked.length >= maxPicks;
              const newVal = isSel ? attr.current + perPoint : attr.current;
              return (
                <button key={attr.key} type="button" onClick={() => pickAttr(attr.key)} disabled={isLocked} aria-pressed={isSel}
                  className="flex items-center justify-between rounded-md border border-white/[0.08] bg-card px-3 py-2 text-sm text-subdued outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10 aria-pressed:text-foreground">
                  <span>{attr.label}</span>
                  <span>{isSel ? <span className="font-bold text-accent">+{perPoint} </span> : null}{attr.current} → {newVal}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {selectableFeats.length === 0 ? (
            <p className="text-sm text-faint">Nenhum talento elegível.</p>
          ) : (
            selectableFeats.map((feat) => (
              <button key={feat.id} type="button" onClick={() => onChange({ mode: "feat", featId: feat.id })} aria-pressed={feat.id === selectedFeatId}
                className="rounded-md border border-white/[0.08] bg-card px-3 py-2 text-left outline-none transition hover:border-white/15 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 aria-pressed:border-brand-crimson-alt aria-pressed:bg-brand-crimson-alt/10">
                <span className="block text-sm font-semibold text-foreground">{feat.name}</span>
                {feat.description ? <span className="mt-0.5 block text-xs text-faint">{feat.description}</span> : null}
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/levelup/_tests_/AsiOrFeatStep.test.tsx`
Expected: PASS (all 3).

- [ ] **Step 5: Typecheck + lint + commit**

Run: `npx tsc --noEmit` and `npx eslint src/components/organisms/levelup/AsiOrFeatStep.tsx` → clean.

```bash
git add src/components/organisms/levelup/AsiOrFeatStep.tsx src/components/organisms/levelup/_tests_/AsiOrFeatStep.test.tsx
git commit -m "feat(levelup): AsiOrFeatStep controlled component (ASI vs feat)"
```

---

## Task 5: `LevelUpFlow` orchestrator

**Files:**
- Create: `src/components/organisms/levelup/LevelUpFlow.tsx`
- Test: `src/components/organisms/levelup/_tests_/LevelUpFlow.test.tsx`

- [ ] **Step 1: Write the failing test** — create `src/components/organisms/levelup/_tests_/LevelUpFlow.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";

// Harness: sets up fighter@level via store actions, then renders an always-open flow.
function Harness({ level }: { level: number }) {
  const selectClass = useCharacterStore((s) => s.selectClass);
  const setLevel = useCharacterStore((s) => s.setLevel);
  return (
    <div>
      <button onClick={() => { selectClass("fighter-xphb"); setLevel(level); }}>setup</button>
      <LevelUpFlow open onClose={() => {}} />
    </div>
  );
}

describe("LevelUpFlow", () => {
  afterEach(cleanup);

  it("walks pending choices and gates Continuar until the step is resolved", () => {
    render(<CharacterStoreProvider><Harness level={3} /></CharacterStoreProvider>);
    screen.getByRole("button", { name: "setup" }).click();

    // First pending step at level 3 is the subclass choice.
    expect(screen.getByRole("heading", { name: "Subclasse" })).toBeInTheDocument();
    const continuar = screen.getByRole("button", { name: /Continuar|Concluir/ });
    expect(continuar).toBeDisabled();

    // Choosing a subclass resolves the step.
    const cards = screen.getAllByRole("button", { name: /Selecionar/ });
    cards[0].click();
    expect(screen.getByRole("button", { name: /Continuar|Concluir/ })).toBeEnabled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/levelup/_tests_/LevelUpFlow.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `LevelUpFlow`**

Create `src/components/organisms/levelup/LevelUpFlow.tsx`:

```tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getBuilderClasses, getFeats } from "@/src/services/ruleService";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";
import { getSelectableFeats } from "@/src/adapters/featCatalog";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";
import { getLevelRequirements, type LevelChoiceRequirement } from "@/rules/levelProgression";
import type { BuilderClass } from "@/types/builder";
import { SubclassStep } from "@/src/components/organisms/levelup/SubclassStep";
import { FeatureOptionStep } from "@/src/components/organisms/levelup/FeatureOptionStep";
import { AsiOrFeatStep } from "@/src/components/organisms/levelup/AsiOrFeatStep";
import type { AsiAttribute } from "@/src/components/organisms/levelup/types";

const ATTRIBUTE_KEYS: AttributeKey[] = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"];

interface LevelUpFlowProps {
  open: boolean;
  onClose: () => void;
}

export function LevelUpFlow({ open, onClose }: LevelUpFlowProps) {
  const state = useCharacterStore((s) => s);
  const characterClass = getBuilderClasses().find((c) => c.id === state.selectedClassId);

  // Snapshot the requirement list once when the dialog opens (ids stay stable).
  const [stepIds, setStepIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open && characterClass) {
      setStepIds(getPendingRequirements(state, characterClass).map((r) => r.id));
      setActiveIndex(0);
    }
    // Snapshot only on open transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allRequirements = useMemo(
    () => (characterClass ? getAllRequirementsById(characterClass) : new Map<string, LevelChoiceRequirement>()),
    [characterClass],
  );
  const pendingIds = useMemo(
    () => new Set(characterClass ? getPendingRequirements(state, characterClass).map((r) => r.id) : []),
    [state, characterClass],
  );

  if (!characterClass) return null;

  const steps = stepIds.map((id) => allRequirements.get(id)).filter(Boolean) as LevelChoiceRequirement[];
  const activeReq = steps[activeIndex];
  const activeResolved = activeReq ? !pendingIds.has(activeReq.id) : true;
  const isLast = activeIndex >= steps.length - 1;
  const allResolved = steps.every((r) => !pendingIds.has(r.id));

  const summary = selectCharacterSheetSummary(state);

  function renderStep(req: LevelChoiceRequirement) {
    if (req.kind === "subclass") {
      return (
        <SubclassStep
          level={req.level}
          subclasses={characterClass!.subclasses}
          selectedSubclassId={state.selectedSubclassId}
          onSelect={(id) => state.selectSubclass(id)}
        />
      );
    }
    if (req.kind === "feature-option") {
      return (
        <FeatureOptionStep
          level={req.level}
          featureName={req.featureName}
          count={req.count}
          options={req.options}
          selected={state.classFeatureChoices[req.id] ?? []}
          onChange={(values) => state.setClassFeatureChoice(req.id, values)}
        />
      );
    }
    const value = state.asiOrFeatByLevel[String(req.level)];
    const contribution = value ? (value.mode === "asi" ? value.increases : value.asi ?? {}) : {};
    const attributes: AsiAttribute[] = ATTRIBUTE_KEYS.map((key) => ({
      key,
      label: ATTRIBUTE_LABELS[key],
      current: summary.finalAttributes[key] - (contribution[key] ?? 0),
    }));
    const ctx = {
      level: req.level,
      finalAttributes: summary.finalAttributes,
      chosenFeatIds: Object.values(state.asiOrFeatByLevel)
        .filter((c) => c.mode === "feat")
        .map((c) => (c as { featId: string }).featId),
    };
    const selectableFeats = getSelectableFeats("general", getFeats(), ctx);
    return (
      <AsiOrFeatStep
        level={req.level}
        attributes={attributes}
        selectableFeats={selectableFeats}
        value={value}
        onChange={(choice) => state.setLevelAsiOrFeat(req.level, choice)}
      />
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-md md:items-center md:p-6">
          <Dialog.Content className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden border border-white/[0.08] bg-surface-nested text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 md:h-[min(88vh,720px)] md:max-w-2xl md:rounded-xl">
            <Dialog.Title className="sr-only">Subir de Nível</Dialog.Title>
            <Dialog.Description className="sr-only">Resolva as escolhas de nível do personagem.</Dialog.Description>
            <Dialog.Close asChild>
              <button type="button" aria-label="Fechar" className="absolute right-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/85 text-subdued outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>

            {/* Stepper */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-5 py-3">
              {steps.map((req, i) => (
                <span key={req.id} aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${i === activeIndex ? "bg-primary" : !pendingIds.has(req.id) ? "bg-accent" : "bg-white/20"}`} />
              ))}
              <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                {steps.length > 0 ? `Passo ${activeIndex + 1} de ${steps.length}` : "Tudo resolvido"}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {activeReq ? renderStep(activeReq) : <p className="text-sm text-subdued">Nenhuma escolha pendente.</p>}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
              <button type="button" onClick={() => setActiveIndex((i) => Math.max(0, i - 1))} disabled={activeIndex === 0}
                className="rounded-md border border-white/[0.12] px-4 py-2 text-sm font-semibold text-subdued outline-none transition hover:text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                ← Voltar
              </button>
              {isLast ? (
                <button type="button" onClick={onClose} disabled={!allResolved}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                  Concluir
                </button>
              ) : (
                <button type="button" onClick={() => setActiveIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={!activeResolved}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-foreground outline-none transition disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
                  Continuar →
                </button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function getAllRequirementsById(characterClass: BuilderClass) {
  // Build a stable id→requirement map across the full 1..20 range so the snapshot
  // ids always resolve, even after a choice removes them from the pending list.
  // (No circular import: levelProgression imports only types.)
  const map = new Map<string, LevelChoiceRequirement>();
  for (const req of getLevelRequirements(characterClass, 0, 20)) map.set(req.id, req);
  return map;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/levelup/_tests_/LevelUpFlow.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck + lint + commit**

Run: `npx tsc --noEmit` and `npx eslint src/components/organisms/levelup/LevelUpFlow.tsx` → clean.

```bash
git add src/components/organisms/levelup/LevelUpFlow.tsx src/components/organisms/levelup/_tests_/LevelUpFlow.test.tsx
git commit -m "feat(levelup): LevelUpFlow orchestrator (Dialog + stepper)"
```

---

## Task 6: `LevelUpButton` + mount on the sheet

**Files:**
- Create: `src/components/molecules/LevelUpButton.tsx`
- Test: `src/components/molecules/_tests_/LevelUpButton.test.tsx`
- Modify: `src/components/organisms/sheet/SheetHeader.tsx`

- [ ] **Step 1: Write the failing test** — create `src/components/molecules/_tests_/LevelUpButton.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpButton } from "@/src/components/molecules/LevelUpButton";

function ProbeLevel() {
  const level = useCharacterStore((s) => s.level);
  return <span data-testid="level">{level}</span>;
}
function SetClass() {
  const selectClass = useCharacterStore((s) => s.selectClass);
  return <button onClick={() => selectClass("fighter-xphb")}>setclass</button>;
}

describe("LevelUpButton", () => {
  afterEach(cleanup);

  it("bumps the level and opens the flow", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><LevelUpButton /></CharacterStoreProvider>);
    screen.getByRole("button", { name: "setclass" }).click();
    expect(screen.getByTestId("level")).toHaveTextContent("1");

    screen.getByRole("button", { name: "Subir de Nível" }).click();
    expect(screen.getByTestId("level")).toHaveTextContent("2");
    // Dialog opened
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/molecules/_tests_/LevelUpButton.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `LevelUpButton`**

Create `src/components/molecules/LevelUpButton.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";

export function LevelUpButton() {
  const level = useCharacterStore((s) => s.level);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const [open, setOpen] = useState(false);
  const atMax = level >= 20;

  return (
    <>
      <button
        type="button"
        disabled={atMax}
        onClick={() => { setLevel(level + 1); setOpen(true); }}
        className="inline-flex items-center gap-1.5 rounded-md border border-brand-crimson-alt/60 bg-brand-crimson-alt/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground outline-none transition hover:border-brand-crimson-alt hover:bg-brand-crimson-alt/20 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUp aria-hidden="true" className="h-4 w-4" />
        Subir de Nível
      </button>
      <LevelUpFlow open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/molecules/_tests_/LevelUpButton.test.tsx`
Expected: PASS.

- [ ] **Step 5: Mount on the sheet header**

In `src/components/organisms/sheet/SheetHeader.tsx`, import the button and render it next to the level text. Add the import near the top:

```ts
import { LevelUpButton } from "@/src/components/molecules/LevelUpButton";
```
Locate the block that renders the character name + `Nível {summary.level}` (the `<div className="min-w-0">` containing the `<h1>` and the level `<p>`). Immediately after that inner `<div className="min-w-0">` closes (still inside its flex row), add the button so it sits beside the name/level:

```tsx
              <LevelUpButton />
```
Place it within the existing `<div className="flex items-start justify-between">` row, as the trailing element (after the XP block or replacing nothing — keep the XP block). If layout needs it, wrap the button in `<div className="ml-2 shrink-0">`. Verify visually in Step 7.

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit` and `npx eslint src/components/molecules/LevelUpButton.tsx src/components/organisms/sheet/SheetHeader.tsx` → clean.

- [ ] **Step 7: Commit**

```bash
git add src/components/molecules/LevelUpButton.tsx src/components/molecules/_tests_/LevelUpButton.test.tsx src/components/organisms/sheet/SheetHeader.tsx
git commit -m "feat(levelup): Subir de Nível button on the sheet header"
```

---

## Task 7: `StartingLevelStepper` + mount in the wizard

**Files:**
- Create: `src/components/molecules/StartingLevelStepper.tsx`
- Test: `src/components/molecules/_tests_/StartingLevelStepper.test.tsx`
- Modify: `src/components/pages/BuilderStepPanel.tsx`

- [ ] **Step 1: Write the failing test** — create `src/components/molecules/_tests_/StartingLevelStepper.test.tsx`:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { StartingLevelStepper } from "@/src/components/molecules/StartingLevelStepper";

function ProbeLevel() {
  const level = useCharacterStore((s) => s.level);
  return <span data-testid="level">{level}</span>;
}
function SetClass() {
  const selectClass = useCharacterStore((s) => s.selectClass);
  return <button onClick={() => selectClass("fighter-xphb")}>setclass</button>;
}

describe("StartingLevelStepper", () => {
  afterEach(cleanup);

  it("increments and decrements the starting level within 1..20", () => {
    render(<CharacterStoreProvider><SetClass /><ProbeLevel /><StartingLevelStepper /></CharacterStoreProvider>);
    screen.getByRole("button", { name: "setclass" }).click();

    screen.getByRole("button", { name: "Aumentar nível" }).click();
    expect(screen.getByTestId("level")).toHaveTextContent("2");

    screen.getByRole("button", { name: "Diminuir nível" }).click();
    expect(screen.getByTestId("level")).toHaveTextContent("1");
    // At level 1 the decrement is disabled.
    expect(screen.getByRole("button", { name: "Diminuir nível" })).toBeDisabled();
  });

  it("shows the configure button only when there are pending level choices", () => {
    render(<CharacterStoreProvider><SetClass /><StartingLevelStepper /></CharacterStoreProvider>);
    screen.getByRole("button", { name: "setclass" }).click();
    // level 1 fighter: weapon mastery is pending (count 3) -> button shows.
    expect(screen.getByRole("button", { name: /Configurar escolhas/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/molecules/_tests_/StartingLevelStepper.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `StartingLevelStepper`**

Create `src/components/molecules/StartingLevelStepper.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { getBuilderClasses } from "@/src/services/ruleService";
import { getPendingRequirements } from "@/src/store/levelChoiceResolver";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";

export function StartingLevelStepper() {
  const state = useCharacterStore((s) => s as CharacterBuilderState);
  const level = useCharacterStore((s) => s.level);
  const selectedClassId = useCharacterStore((s) => s.selectedClassId);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const [open, setOpen] = useState(false);

  const characterClass = getBuilderClasses().find((c) => c.id === selectedClassId);
  const pendingCount = useMemo(
    () => (characterClass ? getPendingRequirements(state, characterClass).length : 0),
    [state, characterClass],
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Nível inicial</span>
      <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-card px-2 py-1">
        <button type="button" aria-label="Diminuir nível" disabled={level <= 1}
          onClick={() => setLevel(Math.max(1, level - 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-subdued outline-none transition hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <span className="min-w-[2ch] text-center font-serif text-lg font-bold text-foreground">{level}</span>
        <button type="button" aria-label="Aumentar nível" disabled={level >= 20}
          onClick={() => setLevel(Math.min(20, level + 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-subdued outline-none transition hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      {pendingCount > 0 ? (
        <button type="button" onClick={() => setOpen(true)}
          className="rounded-md border border-brand-crimson-alt/60 bg-brand-crimson-alt/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-foreground outline-none transition hover:bg-brand-crimson-alt/20 focus-visible:ring-2 focus-visible:ring-brand-crimson-alt/70">
          Configurar escolhas ({pendingCount})
        </button>
      ) : null}
      <LevelUpFlow open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/molecules/_tests_/StartingLevelStepper.test.tsx`
Expected: PASS (both).

- [ ] **Step 5: Mount in the Classe step**

In `src/components/pages/BuilderStepPanel.tsx`, import the stepper near the other imports:

```ts
import { StartingLevelStepper } from "@/src/components/molecules/StartingLevelStepper";
```
Find the Classe step's section (the component/region that renders the class selection — search for the class step heading/region, e.g. the `<section>` rendering `getClassTone`/class cards or the "Escolha uma Classe" area). Render `<StartingLevelStepper />` at the top of that section's content, after the step heading and before the class grid. Add it inside the existing container so it inherits spacing, e.g.:

```tsx
        <div className="mb-4">
          <StartingLevelStepper />
        </div>
```
Verify in Step 7 that it renders only on the Classe step (it lives inside that step's render branch, so it won't appear on other steps).

- [ ] **Step 6: Typecheck + lint + full suite**

Run:
- `npx tsc --noEmit` → clean
- `npx eslint src/components/molecules/StartingLevelStepper.tsx src/components/pages/BuilderStepPanel.tsx` → clean
- `npx vitest run` → all green except the known pre-existing flaky `src/components/pages/_tests_/BuilderStepPanel.test.tsx > renders description as its own unlocked step` (confirm via `git stash` it is unrelated; do NOT treat as a regression).

- [ ] **Step 7: Verify in the browser (preview)**

Use the project's preview workflow: start the dev server, set a class, raise the level / click "Subir de Nível" on the sheet, walk the modal (subclass → ASI/feat), confirm the stepper gates "Continuar", and that finishing updates the sheet (HP recomputed, subclass features shown). Capture a screenshot. Fix any runtime issues found, then re-run the suite.

- [ ] **Step 8: Commit**

```bash
git add src/components/molecules/StartingLevelStepper.tsx src/components/molecules/_tests_/StartingLevelStepper.test.tsx src/components/pages/BuilderStepPanel.tsx
git commit -m "feat(levelup): starting-level stepper in the wizard Classe step"
```

---

## Self-Review Notes (already applied)

- **Spec coverage:** §2 modules → Tasks 1–7; §3 flow control (snapshot ids, Continuar gating, finish, close-persists) → Task 5; §4 step components → Tasks 2–4; §5 entry points → Tasks 6–7; §6 tests → per-task; the `getPendingRequirements` refactor (§2/§7) → Task 1.
- **Consolidation vs spec:** the spec listed a `useLevelUpSteps.ts` hook; the plan folds that snapshot logic directly into `LevelUpFlow` (Task 5) to avoid an awkward "snapshot hook" and an extra file (YAGNI). Behavior is identical. No separate `useLevelUpSteps.ts` file is created.
- **Type consistency:** step prop types live in `types.ts` (Task 2) and are imported by every step and the orchestrator. `AsiOrFeatChoice`, `LevelChoiceRequirement`, `BuilderSubclass`, `BuilderFeat`, `BuilderChoiceOption` come from their Phase 1 locations. Store actions used: `selectSubclass`, `setLevelAsiOrFeat`, `setClassFeatureChoice`, `setLevel`, `selectClass` — all exist.
- **Known assumption to verify during Task 6/7:** the exact insertion points in `SheetHeader.tsx` and the Classe step of `BuilderStepPanel.tsx` are described structurally; confirm the surrounding JSX while editing and keep the existing layout/tokens.
- **No hex literals**; all styling uses token utilities (`bg-card`, `text-foreground`, `border-brand-crimson-alt`, `text-accent`, `text-faint`, etc.).
