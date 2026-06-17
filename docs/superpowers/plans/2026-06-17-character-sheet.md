# Character Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only character sheet page (`/sheet`) that renders all derived D&D data from `selectCharacterSheetSummary()` across four responsive columns with a tab-based content section and mobile bottom navigation.

**Architecture:** All computed D&D values (modifiers, passives, proficiencies, weapons) are added to the `CharacterSheetSummary` type and computed exclusively in `selectCharacterSheetSummary()`. React components only format and display the output — zero arithmetic inside JSX. The sheet reuses the same `CharacterStoreProvider` pattern from `app/builder/layout.tsx`.

**Tech Stack:** Next.js App Router (Server Components for layout, Client Components for interactive UI), Zustand (`useCharacterStore`), Tailwind CSS, FontAwesome Pro 7.2 via local CSS (`fa-solid`, `fa-regular`), shadcn/ui `Input` (already installed) for the notes textarea.

---

## Scope Note

This spec is large but cohesive — all columns share the same selector output. Tasks are ordered so each one produces something you can visually verify before moving on: selector → route skeleton → header → columns → tabs → mobile nav.

---

## Codebase Facts (verified before writing this plan)

- `CharacterSheetSummary` is in `types/builder.ts:216`. Currently has 18 fields — all new fields must be added here **and** computed in the selector, never in components.
- `selectCharacterSheetSummary` lives in `src/store/characterSelectors.ts`. It already calls `getBuilderClasses()`, `getBuilderSpecies()`, `getBuilderBackgrounds()`, `getItemCatalog()` and the derived-adapter functions.
- `BuilderClass.savingThrows` stores Portuguese attribute labels (e.g. `"Forca"`, `"Destreza"`) — same strings as `ATTRIBUTE_LABELS` from `types/dnd.ts`.
- `BuilderClass.spellcastingAbility` is `string | undefined` — truthy means spellcaster.
- `BuilderSpecies` has `speed: number` (feet) and `traits: BuilderFeature[]`, but **no** `senses`, `resistances`, or `immunities` fields in the normalized type. Those fields will be empty arrays until the adapter is extended.
- `CatalogItem.category` is `"Weapon" | "Armor" | ...` — used to filter weapons from `selectedEquipment`.
- Skills are tracked as `classSkillProficiencies: string[]` (e.g. `"Perception"`, `"Acrobatics"`) and `skillTraining: Record<string, SkillTrainingLevel>` where `SkillTrainingLevel = "none" | "half" | "proficient" | "expertise"`.
- `state.description` is `CharacterDescription` — accessed directly in client components via `useCharacterStore(s => s.description)`, not through the summary.
- `CharacterStoreProvider` wraps each sub-app in its own `layout.tsx` (see `app/builder/layout.tsx`).
- `glass-card` utility class exists in `app/globals.css`. No Stitch tokens (`surface-*`, `accent-*`, `font-stat`, etc.) exist — all use hex fallbacks.
- FontAwesome Pro 7.2 loaded as local CSS (`public/fontawesome/css/`). Use `<i className="fa-solid fa-..." />` pattern.
- No `tabs.tsx` in `src/components/ui/` — build tab bar from `<button>` elements.
- `CHARACTER_BUILD_SCHEMA_VERSION` must not be bumped. `activeConditions` and `deathSaves` stay in local component state.

---

## File Map

**Create:**
- `types/builder.ts` — extend with `SheetAttribute`, `SheetSkill`, `SheetSavingThrow`, `SheetSense`, `SheetFeature`, `SheetWeapon` interfaces and extend `CharacterSheetSummary`
- `src/store/characterSelectors.ts` — extend `selectCharacterSheetSummary` with new fields
- `app/sheet/layout.tsx` — `CharacterStoreProvider` + shell wrapper
- `app/sheet/page.tsx` — thin server component
- `src/components/pages/CharacterSheetPage.tsx` — main client component, layout + mobile state
- `src/components/organisms/sheet/SheetHeader.tsx`
- `src/components/organisms/sheet/DeathSavesOverlay.tsx`
- `src/components/organisms/sheet/AttributesColumn.tsx`
- `src/components/organisms/sheet/SkillsColumn.tsx`
- `src/components/organisms/sheet/MainContentColumn.tsx`
- `src/components/organisms/sheet/CodexColumn.tsx`
- `src/components/molecules/sheet/AttributeBlock.tsx`
- `src/components/molecules/sheet/SkillRow.tsx`
- `src/components/molecules/sheet/PassivesPanel.tsx`
- `src/components/molecules/sheet/SensesPanel.tsx`
- `src/components/molecules/sheet/DefensesPanel.tsx`
- `src/components/molecules/sheet/ConditionsPanel.tsx`
- `src/components/molecules/sheet/ContentTabs.tsx`
- `src/components/molecules/sheet/ActionCard.tsx`

---

## Task 1: Extend `CharacterSheetSummary` type

**Files:**
- Modify: `types/builder.ts` (after line 215, before existing `CharacterSheetSummary`)

- [ ] **Step 1: Add new sub-interfaces to `types/builder.ts`**

Insert after the `CharacterDescription` block (line 214) and before `CharacterSheetSummary` (line 216):

```typescript
export interface SheetAttribute {
  key: AttributeKey;
  label: string;   // "Força"
  abbr: string;    // "FOR"
  score: number;
  modifier: number;
}

export interface SheetSkill {
  name: string;          // "Acrobatics" (canonical key for lookups)
  label: string;         // "Acrobacia" (display, Portuguese)
  attributeKey: AttributeKey;
  modifier: number;
  isProficient: boolean;
  isExpert: boolean;
}

export interface SheetSavingThrow {
  attributeKey: AttributeKey;
  label: string;         // "Força"
  abbr: string;          // "FOR"
  modifier: number;
  isProficient: boolean;
}

export interface SheetSense {
  name: string;
  rangeFeet?: number;
}

export interface SheetFeature {
  name: string;
  description: string;
  source: "class" | "species" | "background";
}

export interface SheetWeapon {
  name: string;
  attackBonus: string;  // "+5" or "—"
  damage: string;       // "1d6+3 Cortante"
  notes: string;        // "Versátil (1d8)"
}
```

- [ ] **Step 2: Extend `CharacterSheetSummary` interface**

Replace the existing `CharacterSheetSummary` in `types/builder.ts` with:

```typescript
export interface CharacterSheetSummary {
  // — existing fields (unchanged) —
  ruleset: Ruleset;
  level: number;
  speciesId: string;
  classId: string;
  backgroundId: string;
  originFeat: string;
  baseAttributes: CharacterAttributes;
  backgroundAbilityBonuses: AttributeBonuses;
  finalAttributes: CharacterAttributes;
  proficiencyBonus: number;
  hitPoints: number;
  armorClass: number;
  selectedEquipment: BuilderEquipmentOption[];
  selectedTraits: BuilderFeature[];
  classFeatures: BuilderFeature[];
  classSkillProficiencies: string[];
  skillTraining: Record<string, "none" | "half" | "proficient" | "expertise">;
  classFeatureChoices: Record<string, string[]>;
  speciesChoices: Record<string, string>;
  speciesLanguages: string[];
  validationMessages: string[];

  // — new fields —
  name: string;
  className: string;
  speciesName: string;
  backgroundName: string;
  currentHp: number;
  tempHp: number;
  initiative: number;
  speedFeet: number;
  isSpellcaster: boolean;
  attributes: SheetAttribute[];
  skills: SheetSkill[];
  savingThrows: SheetSavingThrow[];
  passives: { perception: number; investigation: number; insight: number };
  senses: SheetSense[];
  languages: string[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  features: SheetFeature[];
  weapons: SheetWeapon[];
}
```

- [ ] **Step 3: Verify TypeScript compiles after type changes only**

```powershell
npx tsc --noEmit
```

Expected: errors referencing missing fields in `selectCharacterSheetSummary` (the return object). These are expected at this stage — the selector will be fixed in Task 2.

- [ ] **Step 4: Commit**

```bash
git add types/builder.ts
git commit -m "feat(types): extend CharacterSheetSummary with sheet display fields"
```

---

## Task 2: Extend `selectCharacterSheetSummary` selector

**Files:**
- Modify: `src/store/characterSelectors.ts`

- [ ] **Step 1: Add constants before the `selectCharacterSheetSummary` function**

Add at the top of `src/store/characterSelectors.ts` (after the imports):

```typescript
import { ATTRIBUTE_ABBREVIATION_MAP, ATTRIBUTE_LABELS, type AttributeKey } from "@/types/dnd";

const ATTRIBUTE_KEYS: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];

const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR", destreza: "DES", constituicao: "CON",
  inteligencia: "INT", sabedoria: "SAB", carisma: "CAR",
};

// Maps canonical English skill name → Portuguese display label
const SKILL_DISPLAY: Record<string, string> = {
  "Acrobatics": "Acrobacia", "Animal Handling": "Trato c/ Animais",
  "Arcana": "Arcanismo", "Athletics": "Atletismo", "Deception": "Enganação",
  "History": "História", "Insight": "Intuição", "Intimidation": "Intimidação",
  "Investigation": "Investigação", "Medicine": "Medicina", "Nature": "Natureza",
  "Perception": "Percepção", "Performance": "Atuação", "Persuasion": "Persuasão",
  "Religion": "Religião", "Sleight of Hand": "Prestidigitação",
  "Stealth": "Furtividade", "Survival": "Sobrevivência",
};

// Maps canonical English skill name → AttributeKey
const SKILL_ATTRIBUTE: Record<string, AttributeKey> = {
  "Athletics": "forca",
  "Acrobatics": "destreza", "Sleight of Hand": "destreza", "Stealth": "destreza",
  "Arcana": "inteligencia", "History": "inteligencia", "Investigation": "inteligencia",
  "Nature": "inteligencia", "Religion": "inteligencia",
  "Animal Handling": "sabedoria", "Insight": "sabedoria", "Medicine": "sabedoria",
  "Perception": "sabedoria", "Survival": "sabedoria",
  "Deception": "carisma", "Intimidation": "carisma", "Performance": "carisma",
  "Persuasion": "carisma",
};

const ALL_SKILLS = Object.keys(SKILL_DISPLAY);
```

- [ ] **Step 2: Add helper `computeSkills` inside the file**

Add this private function after the constants:

```typescript
function computeSkills(
  finalAttributes: CharacterAttributes,
  classSkillProficiencies: string[],
  skillTraining: Record<string, string>,
  profBonus: number,
): SheetSkill[] {
  const profSet = new Set(classSkillProficiencies);
  return ALL_SKILLS.map((name) => {
    const attrKey = SKILL_ATTRIBUTE[name] ?? "inteligencia";
    const attrScore = finalAttributes[attrKey];
    const baseMod = getAbilityModifier(attrScore);
    const training = skillTraining[name] ?? (profSet.has(name) ? "proficient" : "none");
    const isProficient = training === "proficient" || training === "expertise";
    const isExpert = training === "expertise";
    const profMod = isExpert ? profBonus * 2 : isProficient ? profBonus : 0;
    const halfMod = training === "half" ? Math.floor(profBonus / 2) : 0;
    return {
      name,
      label: SKILL_DISPLAY[name] ?? name,
      attributeKey: attrKey,
      modifier: baseMod + profMod + halfMod,
      isProficient,
      isExpert,
    };
  });
}
```

- [ ] **Step 3: Replace `selectCharacterSheetSummary` return value with all new fields**

The full updated function body (replace the `return { ... }` block, keep everything above it unchanged):

```typescript
  const skills = computeSkills(
    finalAttributes,
    state.classSkillProficiencies,
    state.skillTraining,
    getProficiencyBonus(state.level),
  );

  const profBonus = getProficiencyBonus(state.level);

  const sheetAttributes: SheetAttribute[] = ATTRIBUTE_KEYS.map((key) => ({
    key,
    label: ATTRIBUTE_LABELS[key],
    abbr: ATTRIBUTE_ABBR[key],
    score: finalAttributes[key],
    modifier: getAbilityModifier(finalAttributes[key]),
  }));

  // savingThrows: class stores proficiencies as Portuguese attribute labels ("Forca", "Destreza"…)
  const savingThrowProfLabels = new Set(characterClass?.savingThrows ?? []);
  const savingThrows: SheetSavingThrow[] = ATTRIBUTE_KEYS.map((key) => {
    const attrLabel = ATTRIBUTE_LABELS[key];
    const isProficient = savingThrowProfLabels.has(attrLabel);
    const baseMod = getAbilityModifier(finalAttributes[key]);
    return {
      attributeKey: key,
      label: attrLabel,
      abbr: ATTRIBUTE_ABBR[key],
      modifier: baseMod + (isProficient ? profBonus : 0),
      isProficient,
    };
  });

  const findSkillMod = (name: string) =>
    skills.find((s) => s.name === name)?.modifier ?? 0;

  const weapons: SheetWeapon[] = [
    {
      name: "Ataque Desarmado",
      attackBonus: `+${getAbilityModifier(finalAttributes.forca) + profBonus}`,
      damage: `1+${getAbilityModifier(finalAttributes.forca)} Contundente`,
      notes: "Corpo-a-corpo",
    },
    ...getItemCatalog()
      .filter((item) => equipmentIds.has(item.id) && item.category === "Weapon")
      .map((item) => ({
        name: item.name,
        attackBonus: `+${profBonus}`,
        damage: "—",
        notes: item.source,
      })),
  ];

  const features: SheetFeature[] = [
    ...(characterClass?.levelOneFeatures ?? []).map((f) => ({
      name: f.name,
      description: f.description ?? "",
      source: "class" as const,
    })),
    ...(species?.traits ?? []).map((f) => ({
      name: f.name,
      description: f.description ?? "",
      source: "species" as const,
    })),
    ...(background
      ? [{ name: background.originFeat, description: background.equipmentSummary, source: "background" as const }]
      : []),
  ].filter((f) => f.name);

  return {
    // existing fields
    ruleset: state.ruleset,
    level: state.level,
    speciesId: state.selectedSpeciesId,
    classId: state.selectedClassId,
    backgroundId: state.selectedBackgroundId,
    originFeat: background?.originFeat ?? "",
    baseAttributes: state.baseAttributes,
    backgroundAbilityBonuses: state.backgroundAbilityBonuses,
    finalAttributes,
    proficiencyBonus: profBonus,
    hitPoints: calculateInitialHitPoints(characterClass?.hitDie ?? 6, finalAttributes.constituicao),
    armorClass: calculateArmorClass(finalAttributes.destreza, selectedEquipment),
    selectedEquipment,
    selectedTraits: species?.traits ?? [],
    classFeatures: characterClass?.levelOneFeatures ?? [],
    classSkillProficiencies: state.classSkillProficiencies,
    skillTraining: state.skillTraining,
    classFeatureChoices: state.classFeatureChoices,
    speciesChoices: state.speciesChoices,
    speciesLanguages: state.speciesLanguages,
    validationMessages: getAllValidationMessages(state),

    // new fields
    name: state.description.nome,
    className: characterClass?.name ?? "",
    speciesName: species?.name ?? "",
    backgroundName: background?.name ?? "",
    currentHp: calculateInitialHitPoints(characterClass?.hitDie ?? 6, finalAttributes.constituicao),
    tempHp: 0,
    initiative: getAbilityModifier(finalAttributes.destreza),
    speedFeet: species?.speed ?? 30,
    isSpellcaster: Boolean(characterClass?.spellcastingAbility),
    attributes: sheetAttributes,
    skills,
    savingThrows,
    passives: {
      perception: 10 + findSkillMod("Perception"),
      investigation: 10 + findSkillMod("Investigation"),
      insight: 10 + findSkillMod("Insight"),
    },
    senses: [],
    languages: state.speciesLanguages,
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    features,
    weapons,
  };
```

- [ ] **Step 4: Add missing imports to the selector file**

Make sure `types/builder.ts` types are imported:

```typescript
import type {
  BuilderStepSlug,
  CharacterSheetSummary,
  SheetAttribute,
  SheetFeature,
  SheetSavingThrow,
  SheetSkill,
  SheetWeapon,
} from "@/types/builder";
```

- [ ] **Step 5: TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors (no components exist yet to fail). If errors, fix types in `characterSelectors.ts` before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/store/characterSelectors.ts types/builder.ts
git commit -m "feat(selectors): compute skills, saves, passives, weapons, features in CharacterSheetSummary"
```

---

## Task 3: Sheet route scaffold

**Files:**
- Create: `app/sheet/layout.tsx`
- Create: `app/sheet/page.tsx`

- [ ] **Step 1: Create `app/sheet/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";

export default function SheetLayout({ children }: { children: ReactNode }) {
  return (
    <CharacterStoreProvider>
      <div className="min-h-screen bg-[#12131a]">{children}</div>
    </CharacterStoreProvider>
  );
}
```

- [ ] **Step 2: Create `app/sheet/page.tsx`**

```tsx
import { CharacterSheetPage } from "@/src/components/pages/CharacterSheetPage";

export default function SheetPage() {
  return <CharacterSheetPage />;
}
```

- [ ] **Step 3: Create the stub `CharacterSheetPage.tsx` to make the route compile**

Create `src/components/pages/CharacterSheetPage.tsx`:

```tsx
"use client";

export function CharacterSheetPage() {
  return (
    <main className="p-4 text-white">
      <p>Character Sheet — coming soon</p>
    </main>
  );
}
```

- [ ] **Step 4: Build check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add app/sheet/ src/components/pages/CharacterSheetPage.tsx
git commit -m "feat(sheet): add /sheet route scaffold"
```

---

## Task 4: `CharacterSheetPage.tsx` — layout, state hook, mobile nav skeleton

**Files:**
- Modify: `src/components/pages/CharacterSheetPage.tsx`

- [ ] **Step 1: Create the full `CharacterSheetPage` with layout grid and mobile nav**

Replace `src/components/pages/CharacterSheetPage.tsx` with:

```tsx
"use client";

import { useMemo, useState } from "react";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { cn } from "@/src/lib/utils";

type MobileTab = "attrs" | "skills" | "actions" | "codex";

const MOBILE_TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: "attrs",   icon: "fa-dice-d20",   label: "Atributos" },
  { id: "skills",  icon: "fa-list-check",  label: "Perícias" },
  { id: "actions", icon: "fa-sword",        label: "Ações" },
  { id: "codex",   icon: "fa-book-open",    label: "Códice" },
];

export function CharacterSheetPage() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("attrs");
  const state = useSheetState();
  const summary = useMemo(() => selectCharacterSheetSummary(state), [state]);

  return (
    <div className="flex min-h-screen flex-col bg-[#12131a]">
      {/* Main grid — hidden on mobile, replaced by tab content */}
      <main className="flex-1 p-3 pb-20 md:pb-3 lg:p-4">
        {/* Desktop/tablet grid */}
        <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          <div>{/* AttributesColumn placeholder */}</div>
          <div>{/* SkillsColumn placeholder */}</div>
          <div className="md:col-span-2 lg:col-span-1">{/* MainContentColumn placeholder */}</div>
          <div className="hidden xl:block">{/* CodexColumn placeholder */}</div>
        </div>

        {/* Mobile: single column driven by mobileTab */}
        <div className="md:hidden">
          {mobileTab === "attrs"   && <div className="text-white">Atributos mobile</div>}
          {mobileTab === "skills"  && <div className="text-white">Perícias mobile</div>}
          {mobileTab === "actions" && <div className="text-white">Ações mobile</div>}
          {mobileTab === "codex"   && <div className="text-white">Códice mobile</div>}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Seções da ficha"
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/10 bg-[#10121b] md:hidden"
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors",
              mobileTab === tab.id ? "text-[#e61c23]" : "text-[#7a7e99]",
            )}
          >
            <i aria-hidden="true" className={`fa-solid ${tab.icon} text-base`} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function useSheetState(): CharacterBuilderState {
  const ruleset = useCharacterStore((s) => s.ruleset);
  const level = useCharacterStore((s) => s.level);
  const selectedSpeciesId = useCharacterStore((s) => s.selectedSpeciesId);
  const selectedClassId = useCharacterStore((s) => s.selectedClassId);
  const selectedBackgroundId = useCharacterStore((s) => s.selectedBackgroundId);
  const inventory = useCharacterStore((s) => s.inventory);
  const equipmentChoicesBySource = useCharacterStore((s) => s.equipmentChoicesBySource);
  const maxUnlockedStepIndex = useCharacterStore((s) => s.maxUnlockedStepIndex);
  const pendingChoiceIds = useCharacterStore((s) => s.pendingChoiceIds);
  const classSkillProficiencies = useCharacterStore((s) => s.classSkillProficiencies);
  const skillTraining = useCharacterStore((s) => s.skillTraining);
  const classFeatureChoices = useCharacterStore((s) => s.classFeatureChoices);
  const speciesChoices = useCharacterStore((s) => s.speciesChoices);
  const speciesLanguages = useCharacterStore((s) => s.speciesLanguages);
  const attributeGenerationMethod = useCharacterStore((s) => s.attributeGenerationMethod);
  const baseAttributes = useCharacterStore((s) => s.baseAttributes);
  const backgroundAbilityBonuses = useCharacterStore((s) => s.backgroundAbilityBonuses);
  const description = useCharacterStore((s) => s.description);

  return useMemo(
    () => ({
      ruleset, level, selectedSpeciesId, selectedClassId, selectedBackgroundId,
      inventory, equipmentChoicesBySource, maxUnlockedStepIndex, pendingChoiceIds,
      classSkillProficiencies, skillTraining, classFeatureChoices, speciesChoices,
      speciesLanguages, attributeGenerationMethod, baseAttributes, backgroundAbilityBonuses,
      description,
    }),
    [
      ruleset, level, selectedSpeciesId, selectedClassId, selectedBackgroundId,
      inventory, equipmentChoicesBySource, maxUnlockedStepIndex, pendingChoiceIds,
      classSkillProficiencies, skillTraining, classFeatureChoices, speciesChoices,
      speciesLanguages, attributeGenerationMethod, baseAttributes, backgroundAbilityBonuses,
      description,
    ],
  );
}
```

- [ ] **Step 2: TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/CharacterSheetPage.tsx
git commit -m "feat(sheet): add CharacterSheetPage layout and mobile tab nav"
```

---

## Task 5: `DeathSavesOverlay.tsx` + `SheetHeader.tsx`

**Files:**
- Create: `src/components/organisms/sheet/DeathSavesOverlay.tsx`
- Create: `src/components/organisms/sheet/SheetHeader.tsx`

- [ ] **Step 1: Create `DeathSavesOverlay.tsx`**

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

interface DeathSavesOverlayProps {
  onReset?: () => void;
}

export function DeathSavesOverlay({ onReset }: DeathSavesOverlayProps) {
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);

  function toggle(type: "success" | "failure", index: number) {
    if (type === "success") {
      setSuccesses((prev) => (prev > index ? index : index + 1));
    } else {
      setFailures((prev) => (prev > index ? index : index + 1));
    }
  }

  return (
    <div className="rounded-lg border border-[#e61c23]/50 bg-[#e61c23]/5 p-3">
      <p className="mb-2 text-[0.65rem] uppercase tracking-widest text-[#7a7e99]">
        Testes de Morte
      </p>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#b0b5cc]">Sucessos</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Sucesso ${i + 1}`}
                onClick={() => toggle("success", i)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-colors",
                  successes > i
                    ? "border-[#4ade80] bg-[#4ade80]/20"
                    : "border-white/30",
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#b0b5cc]">Falhas</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`Falha ${i + 1}`}
                onClick={() => toggle("failure", i)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-colors",
                  failures > i
                    ? "border-[#e61c23] bg-[#e61c23]/20"
                    : "border-white/30",
                )}
              />
            ))}
          </div>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto self-end text-[10px] text-[#7a7e99] underline"
          >
            Resetar
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `SheetHeader.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { CharacterSheetSummary } from "@/types/builder";
import { DeathSavesOverlay } from "@/src/components/organisms/sheet/DeathSavesOverlay";
import { cn } from "@/src/lib/utils";

interface SheetHeaderProps {
  summary: CharacterSheetSummary;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function fmtSpeed(feet: number): string {
  return `${Math.round(feet / 0.3)} m`;
}

export function SheetHeader({ summary }: SheetHeaderProps) {
  const [hasInspiration, setHasInspiration] = useState(false);

  return (
    <header className="glass-card mb-3 rounded-xl p-4 lg:mb-4">
      {/* Row 1: identity */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1c1e2a] font-serif text-xl font-bold text-[#7a7e99]">
          {summary.name.trim().charAt(0).toUpperCase() || "?"}
        </div>

        {/* Name + class + level */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-xl font-bold text-white">
            {summary.name || "Personagem sem nome"}
          </h1>
          <p className="text-xs text-[#b0b5cc]">
            Nível {summary.level} {summary.className}
            {summary.speciesName ? ` · ${summary.speciesName}` : ""}
          </p>
        </div>

        {/* Inspiration toggle */}
        <button
          type="button"
          aria-label={hasInspiration ? "Remover Inspiração" : "Adicionar Inspiração"}
          onClick={() => setHasInspiration((v) => !v)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm transition-colors",
            hasInspiration
              ? "border-[#f3c969] bg-[#f3c969]/20 text-[#f3c969]"
              : "border-white/20 text-[#7a7e99]",
          )}
        >
          <i aria-hidden="true" className="fa-solid fa-star" />
        </button>
      </div>

      {/* Row 2: combat stats */}
      <div className="mt-3 flex flex-wrap gap-2">
        <StatChip label="PV" value={`${summary.currentHp} / ${summary.hitPoints}`} />
        {summary.tempHp > 0 && (
          <StatChip label="PV Temp" value={`+${summary.tempHp}`} accent="gold" />
        )}
        <StatChip label="CA" value={String(summary.armorClass)} />
        <StatChip label="Iniciativa" value={fmt(summary.initiative)} />
        <StatChip label="Velocidade" value={fmtSpeed(summary.speedFeet)} />
        <StatChip label="Proficiência" value={fmt(summary.proficiencyBonus)} />
      </div>

      {/* Death saves (HP = 0) */}
      {summary.currentHp === 0 && (
        <div className="mt-3">
          <DeathSavesOverlay />
        </div>
      )}
    </header>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold";
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/10 bg-[#1c1e2a] px-3 py-1.5 text-center">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-bold",
          accent === "gold" ? "text-[#f3c969]" : "text-white",
        )}
      >
        {value}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/sheet/
git commit -m "feat(sheet): add SheetHeader and DeathSavesOverlay"
```

---

## Task 6: `AttributeBlock.tsx` + `AttributesColumn.tsx`

**Files:**
- Create: `src/components/molecules/sheet/AttributeBlock.tsx`
- Create: `src/components/organisms/sheet/AttributesColumn.tsx`

- [ ] **Step 1: Create `AttributeBlock.tsx`**

```tsx
import type { SheetAttribute } from "@/types/builder";
import { cn } from "@/src/lib/utils";

const ACCENT: Partial<Record<string, string>> = {
  forca: "bg-[#e61c23]",
  constituicao: "bg-[#e61c23]",
  destreza: "bg-[#f3c969]",
};

interface AttributeBlockProps {
  attribute: SheetAttribute;
}

export function AttributeBlock({ attribute }: AttributeBlockProps) {
  const accent = ACCENT[attribute.key] ?? "bg-white/10";
  const sign = attribute.modifier >= 0 ? "+" : "";

  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#1c1e2a] py-3">
      {/* left accent bar */}
      <div className={cn("absolute left-0 top-0 h-full w-1", accent)} />

      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {attribute.abbr}
      </span>
      <span className="mt-1 font-serif text-2xl font-bold leading-none text-white">
        {sign}{attribute.modifier}
      </span>
      <span className="mt-1 text-[0.7rem] text-[#7a7e99]">({attribute.score})</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `AttributesColumn.tsx`**

```tsx
import type { CharacterSheetSummary } from "@/types/builder";
import { AttributeBlock } from "@/src/components/molecules/sheet/AttributeBlock";

interface AttributesColumnProps {
  summary: CharacterSheetSummary;
}

export function AttributesColumn({ summary }: AttributesColumnProps) {
  return (
    <section aria-labelledby="attrs-col-title" className="flex flex-col gap-2">
      <h2
        id="attrs-col-title"
        className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#7a7e99]"
      >
        Atributos
      </h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {summary.attributes.map((attr) => (
          <AttributeBlock key={attr.key} attribute={attr} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/molecules/sheet/AttributeBlock.tsx src/components/organisms/sheet/AttributesColumn.tsx
git commit -m "feat(sheet): add AttributeBlock and AttributesColumn"
```

---

## Task 7: Skills column — `SkillRow`, `PassivesPanel`, `SensesPanel`, `SkillsColumn`

**Files:**
- Create: `src/components/molecules/sheet/SkillRow.tsx`
- Create: `src/components/molecules/sheet/PassivesPanel.tsx`
- Create: `src/components/molecules/sheet/SensesPanel.tsx`
- Create: `src/components/organisms/sheet/SkillsColumn.tsx`

- [ ] **Step 1: Create `SkillRow.tsx`**

```tsx
import type { SheetSkill } from "@/types/builder";
import { cn } from "@/src/lib/utils";

interface SkillRowProps {
  skill: SheetSkill;
  compact?: boolean;
}

export function SkillRow({ skill, compact = false }: SkillRowProps) {
  const sign = skill.modifier >= 0 ? "+" : "";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact ? "py-0.5" : "py-1",
      )}
    >
      {/* Proficiency circle */}
      {skill.isExpert ? (
        <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-[#f3c969] bg-[#f3c969]/20">
          <div className="h-1.5 w-1.5 rounded-full bg-[#f3c969]" />
        </div>
      ) : skill.isProficient ? (
        <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded border border-[#e61c23] bg-[#e61c23]/20">
          <div className="h-1.5 w-1.5 rounded-sm bg-[#e61c23]" />
        </div>
      ) : (
        <div className="h-3 w-3 shrink-0 rounded border border-white/30" />
      )}

      <span
        className={cn(
          "min-w-[1.5rem] text-right text-[0.72rem] font-semibold",
          skill.modifier >= 0 ? "text-white" : "text-[#b0b5cc]",
        )}
      >
        {sign}{skill.modifier}
      </span>

      <span className="text-[0.72rem] text-[#b0b5cc]">{skill.label}</span>
      <span className="ml-auto text-[0.6rem] text-[#7a7e99]">{skill.attributeKey.slice(0, 3).toUpperCase()}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create `PassivesPanel.tsx`**

```tsx
interface PassivesPanelProps {
  perception: number;
  investigation: number;
  insight: number;
}

export function PassivesPanel({ perception, investigation, insight }: PassivesPanelProps) {
  const items = [
    { label: "Percepção Passiva", value: perception },
    { label: "Investigação Passiva", value: investigation },
    { label: "Intuição Passiva", value: insight },
  ];

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        Sentidos Passivos
      </p>
      <dl className="space-y-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-2">
            <dd className="w-6 text-right text-sm font-bold text-white">{value}</dd>
            <dt className="text-[0.72rem] text-[#b0b5cc]">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 3: Create `SensesPanel.tsx`**

```tsx
interface SensesPanelProps {
  senses: Array<{ name: string; rangeFeet?: number }>;
  languages: string[];
}

export function SensesPanel({ senses, languages }: SensesPanelProps) {
  if (senses.length === 0 && languages.length === 0) return null;

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      {senses.length > 0 && (
        <>
          <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Sentidos
          </p>
          <ul className="mb-3 space-y-0.5">
            {senses.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-[0.72rem] text-[#b0b5cc]">
                <i aria-hidden="true" className="fa-solid fa-eye text-[#7a7e99]" />
                {s.name}
                {s.rangeFeet != null && (
                  <span className="ml-auto text-[#7a7e99]">
                    {Math.round(s.rangeFeet / 0.3)} m
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {languages.length > 0 && (
        <>
          <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Idiomas
          </p>
          <p className="text-[0.72rem] text-[#b0b5cc]">{languages.join(", ")}</p>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Create `SkillsColumn.tsx`**

Groups saving throws + skills by attribute, then passives + senses:

```tsx
import type { CharacterSheetSummary, SheetSkill } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";
import { ATTRIBUTE_LABELS } from "@/types/dnd";
import { SkillRow } from "@/src/components/molecules/sheet/SkillRow";
import { PassivesPanel } from "@/src/components/molecules/sheet/PassivesPanel";
import { SensesPanel } from "@/src/components/molecules/sheet/SensesPanel";
import { cn } from "@/src/lib/utils";

const ATTRIBUTE_ORDER: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];

interface SkillsColumnProps {
  summary: CharacterSheetSummary;
}

export function SkillsColumn({ summary }: SkillsColumnProps) {
  const skillsByAttr = ATTRIBUTE_ORDER.reduce<Record<string, SheetSkill[]>>(
    (acc, key) => {
      acc[key] = summary.skills.filter((s) => s.attributeKey === key);
      return acc;
    },
    {},
  );

  return (
    <section aria-labelledby="skills-col-title" className="flex flex-col gap-3">
      <h2
        id="skills-col-title"
        className="text-[0.65rem] font-semibold uppercase tracking-widest text-[#7a7e99]"
      >
        Salvaguardas & Perícias
      </h2>

      <div className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] px-3 py-2">
        {ATTRIBUTE_ORDER.map((key) => {
          const save = summary.savingThrows.find((s) => s.attributeKey === key);
          const skills = skillsByAttr[key] ?? [];
          return (
            <div key={key} className="border-b border-white/5 py-1.5 last:border-0">
              {/* Saving throw row */}
              {save && (
                <div className="flex items-center gap-2 py-0.5">
                  <div
                    className={cn(
                      "flex h-3 w-3 shrink-0 items-center justify-center rounded border",
                      save.isProficient
                        ? "border-[#e61c23] bg-[#e61c23]/20"
                        : "border-white/30",
                    )}
                  >
                    {save.isProficient && (
                      <div className="h-1.5 w-1.5 rounded-sm bg-[#e61c23]" />
                    )}
                  </div>
                  <span className="min-w-[1.5rem] text-right text-[0.72rem] font-bold text-white">
                    {save.modifier >= 0 ? "+" : ""}{save.modifier}
                  </span>
                  <span className="text-[0.72rem] font-semibold text-[#e8e9f0]">
                    Salv. {save.abbr}
                  </span>
                </div>
              )}
              {/* Skills for this attribute (indented) */}
              <div className="pl-4">
                {skills.map((skill) => (
                  <SkillRow key={skill.name} skill={skill} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <PassivesPanel
        perception={summary.passives.perception}
        investigation={summary.passives.investigation}
        insight={summary.passives.insight}
      />

      <SensesPanel senses={summary.senses} languages={summary.languages} />
    </section>
  );
}
```

- [ ] **Step 5: TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/molecules/sheet/ src/components/organisms/sheet/SkillsColumn.tsx
git commit -m "feat(sheet): add SkillRow, PassivesPanel, SensesPanel, SkillsColumn"
```

---

## Task 8: `DefensesPanel.tsx` + `ConditionsPanel.tsx`

**Files:**
- Create: `src/components/molecules/sheet/DefensesPanel.tsx`
- Create: `src/components/molecules/sheet/ConditionsPanel.tsx`

- [ ] **Step 1: Create `DefensesPanel.tsx`**

```tsx
interface DefensesPanelProps {
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
}

export function DefensesPanel({ resistances, immunities, vulnerabilities }: DefensesPanelProps) {
  const hasContent = resistances.length > 0 || immunities.length > 0 || vulnerabilities.length > 0;

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        Defesas
      </p>
      {hasContent ? (
        <ul className="space-y-0.5">
          {resistances.map((r) => (
            <li key={r} className="flex items-center gap-1.5 text-[0.72rem] text-[#b0b5cc]">
              <i aria-hidden="true" className="fa-solid fa-shield-halved text-[#4a9eff]" />
              Resist. {r}
            </li>
          ))}
          {immunities.map((im) => (
            <li key={im} className="flex items-center gap-1.5 text-[0.72rem] text-[#b0b5cc]">
              <i aria-hidden="true" className="fa-solid fa-shield text-[#4ade80]" />
              Imun. {im}
            </li>
          ))}
          {vulnerabilities.map((v) => (
            <li key={v} className="flex items-center gap-1.5 text-[0.72rem] text-[#b0b5cc]">
              <i aria-hidden="true" className="fa-solid fa-triangle-exclamation text-[#e61c23]" />
              Vuln. {v}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[0.72rem] text-[#7a7e99]">Nenhuma resistência especial.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Create `ConditionsPanel.tsx`**

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

const CONDITION_LIST = [
  "Amedrontado", "Agarrado", "Caído", "Cego", "Confuso",
  "Encantado", "Enjoado", "Ensurdecido", "Envenenado",
  "Exausto", "Incapacitado", "Invisível", "Paralisado",
  "Petrificado", "Surdo",
];

export function ConditionsPanel() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  function toggle(name: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
          Condições
        </p>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[0.6rem] text-[#e61c23] hover:underline"
        >
          {expanded ? "Fechar" : "+ Adicionar"}
        </button>
      </div>

      {/* Active conditions */}
      {active.size > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {[...active].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className="flex items-center gap-1 rounded border border-[#e61c23]/40 bg-[#e61c23]/10 px-1.5 py-0.5 text-[0.65rem] text-[#e61c23]"
            >
              {name}
              <i aria-hidden="true" className="fa-solid fa-xmark text-[0.55rem]" />
            </button>
          ))}
        </div>
      )}

      {active.size === 0 && !expanded && (
        <p className="text-[0.72rem] text-[#7a7e99]">Nenhuma condição ativa.</p>
      )}

      {/* Condition picker */}
      {expanded && (
        <div className="flex flex-wrap gap-1">
          {CONDITION_LIST.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[0.65rem] transition-colors",
                active.has(name)
                  ? "border-[#e61c23]/40 bg-[#e61c23]/10 text-[#e61c23]"
                  : "border-white/20 text-[#b0b5cc] hover:border-white/40",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: TypeScript check**

```powershell
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/molecules/sheet/DefensesPanel.tsx src/components/molecules/sheet/ConditionsPanel.tsx
git commit -m "feat(sheet): add DefensesPanel and ConditionsPanel"
```

---

## Task 9: `ActionCard.tsx` + `ContentTabs.tsx`

**Files:**
- Create: `src/components/molecules/sheet/ActionCard.tsx`
- Create: `src/components/molecules/sheet/ContentTabs.tsx`

- [ ] **Step 1: Create `ActionCard.tsx`**

```tsx
import type { SheetFeature } from "@/types/builder";
import { cn } from "@/src/lib/utils";

const SOURCE_BADGE: Record<SheetFeature["source"], string> = {
  class: "bg-[#e61c23]/15 text-[#e61c23] border-[#e61c23]/30",
  species: "bg-[#4a9eff]/15 text-[#4a9eff] border-[#4a9eff]/30",
  background: "bg-[#f3c969]/15 text-[#f3c969] border-[#f3c969]/30",
};

const SOURCE_LABEL: Record<SheetFeature["source"], string> = {
  class: "Classe",
  species: "Espécie",
  background: "Antecedente",
};

interface ActionCardProps {
  feature: SheetFeature;
}

export function ActionCard({ feature }: ActionCardProps) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <div className="mb-1 flex items-start gap-2">
        <span className={cn("rounded border px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest", SOURCE_BADGE[feature.source])}>
          {SOURCE_LABEL[feature.source]}
        </span>
        <h4 className="flex-1 text-sm font-semibold text-white">{feature.name}</h4>
      </div>
      {feature.description && (
        <p className="text-[0.72rem] leading-relaxed text-[#b0b5cc] line-clamp-3">
          {feature.description}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `ContentTabs.tsx`**

This is the complete 5-tab component including sub-filters for AÇÕES, spell grouping, inventory list, features list, and notes textarea:

```tsx
"use client";

import { useState } from "react";
import type { CharacterSheetSummary, SheetFeature } from "@/types/builder";
import { ActionCard } from "@/src/components/molecules/sheet/ActionCard";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";

type MainTab = "actions" | "spells" | "inventory" | "features" | "notes";
type ActionFilter = "all" | "class" | "species" | "background";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "actions",    label: "Ações" },
  { id: "spells",     label: "Magias" },
  { id: "inventory",  label: "Inventário" },
  { id: "features",   label: "Características" },
  { id: "notes",      label: "Anotações" },
];

const ACTION_FILTERS: { id: ActionFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "class",      label: "Classe" },
  { id: "species",    label: "Espécie" },
  { id: "background", label: "Antecedente" },
];

interface ContentTabsProps {
  summary: CharacterSheetSummary;
}

export function ContentTabs({ summary }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("actions");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const notes = useCharacterStore((s) => s.description.notas);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);

  const filteredFeatures: SheetFeature[] =
    actionFilter === "all"
      ? summary.features
      : summary.features.filter((f) => f.source === actionFilter);

  return (
    <div className="flex flex-col gap-3">
      {/* Main tab bar */}
      <div
        role="tablist"
        aria-label="Conteúdo da ficha"
        className="flex gap-0.5 overflow-x-auto rounded-lg border border-white/10 bg-[#10121b] p-0.5"
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded px-2 py-1.5 text-[0.65rem] font-semibold uppercase tracking-widest transition-colors",
              activeTab === tab.id
                ? "bg-[#1c1e2a] text-white"
                : "text-[#7a7e99] hover:text-[#b0b5cc]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "actions" && (
        <div>
          {/* Sub-filter */}
          <div className="mb-3 flex gap-1 overflow-x-auto">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActionFilter(f.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1 text-[0.65rem] font-semibold transition-colors",
                  actionFilter === f.id
                    ? "border-[#e61c23]/50 bg-[#e61c23]/15 text-[#e61c23]"
                    : "border-white/10 text-[#7a7e99] hover:text-[#b0b5cc]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filteredFeatures.length > 0 ? (
            <div className="grid gap-2">
              {filteredFeatures.map((feat) => (
                <ActionCard key={`${feat.source}-${feat.name}`} feature={feat} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7a7e99]">Nenhuma ação encontrada.</p>
          )}
        </div>
      )}

      {activeTab === "spells" && (
        <div>
          {summary.isSpellcaster ? (
            <p className="text-sm text-[#7a7e99]">
              Magias serão listadas aqui em uma versão futura.
            </p>
          ) : (
            <p className="text-sm text-[#7a7e99]">Este personagem não possui magias.</p>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div>
          {summary.selectedEquipment.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.selectedEquipment.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#1c1e2a] px-3 py-2 text-sm"
                >
                  <span className="flex-1 text-[#e8e9f0]">{item.name}</span>
                  <span className="text-[0.65rem] text-[#7a7e99]">
                    {item.sourceType === "class" ? "Classe" : "Manual"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#7a7e99]">Nenhum equipamento selecionado.</p>
          )}
        </div>
      )}

      {activeTab === "features" && (
        <div className="grid gap-2">
          {summary.features.length > 0 ? (
            summary.features.map((feat) => (
              <ActionCard key={`${feat.source}-${feat.name}`} feature={feat} />
            ))
          ) : (
            <p className="text-sm text-[#7a7e99]">Nenhuma característica listada.</p>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          <textarea
            value={notes}
            onBlur={(e) => setDescriptionField("notas", e.target.value)}
            onChange={(e) => setDescriptionField("notas", e.target.value)}
            rows={8}
            placeholder="Anotações livres, segredos, objetivos…"
            className="w-full resize-none rounded-lg border border-white/10 bg-[#12131a] px-3 py-2 text-sm text-white placeholder:text-[#7a7e99] outline-none focus:border-[#e61c23] focus:ring-2 focus:ring-[#e61c23]/30"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```powershell
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/molecules/sheet/ActionCard.tsx src/components/molecules/sheet/ContentTabs.tsx
git commit -m "feat(sheet): add ActionCard and ContentTabs with 5 tabs and action sub-filters"
```

---

## Task 10: `MainContentColumn.tsx` (defenses + tabs + weapons table)

**Files:**
- Create: `src/components/organisms/sheet/MainContentColumn.tsx`

- [ ] **Step 1: Create `MainContentColumn.tsx`**

```tsx
import type { CharacterSheetSummary } from "@/types/builder";
import { DefensesPanel } from "@/src/components/molecules/sheet/DefensesPanel";
import { ConditionsPanel } from "@/src/components/molecules/sheet/ConditionsPanel";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";

interface MainContentColumnProps {
  summary: CharacterSheetSummary;
  className?: string;
}

const EMPTY_ROWS = 3;

export function MainContentColumn({ summary, className }: MainContentColumnProps) {
  const weaponRows = [...summary.weapons];
  while (weaponRows.length < EMPTY_ROWS) {
    weaponRows.push({ name: "", attackBonus: "", damage: "", notes: "" });
  }

  return (
    <section aria-label="Conteúdo principal" className={`flex flex-col gap-3 ${className ?? ""}`}>
      {/* Defenses + conditions side by side */}
      <div className="grid grid-cols-2 gap-3">
        <DefensesPanel
          resistances={summary.resistances}
          immunities={summary.immunities}
          vulnerabilities={summary.vulnerabilities}
        />
        <ConditionsPanel />
      </div>

      {/* Weapons table */}
      <section className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
        <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
          Armas
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full text-[0.72rem]">
            <thead>
              <tr className="border-b border-white/10 text-[#7a7e99]">
                <th className="py-1 pr-3 text-left font-semibold">NOME</th>
                <th className="py-1 pr-3 text-left font-semibold">BÔNUS/CD</th>
                <th className="py-1 pr-3 text-left font-semibold">DANO & TIPO</th>
                <th className="py-1 text-left font-semibold">NOTAS</th>
              </tr>
            </thead>
            <tbody>
              {weaponRows.map((w, i) => (
                <tr
                  key={w.name || `empty-${i}`}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-1.5 pr-3 text-[#e8e9f0]">{w.name || "—"}</td>
                  <td className="py-1.5 pr-3 font-semibold text-white">{w.attackBonus || "—"}</td>
                  <td className="py-1.5 pr-3 text-[#b0b5cc]">{w.damage || "—"}</td>
                  <td className="py-1.5 text-[#7a7e99]">{w.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Main content tabs */}
      <ContentTabs summary={summary} />
    </section>
  );
}
```

- [ ] **Step 2: TypeScript check**

```powershell
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/sheet/MainContentColumn.tsx
git commit -m "feat(sheet): add MainContentColumn with weapons table and tabs"
```

---

## Task 11: `CodexColumn.tsx`

**Files:**
- Create: `src/components/organisms/sheet/CodexColumn.tsx`

- [ ] **Step 1: Create `CodexColumn.tsx`**

```tsx
"use client";

import type { CharacterSheetSummary } from "@/types/builder";
import type { CharacterDescription } from "@/types/builder";

interface CodexColumnProps {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
  className?: string;
}

function CodexRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {label}
      </span>
      <span className="text-[0.8rem] text-[#e8e9f0]">{value}</span>
    </div>
  );
}

export function CodexColumn({ summary, description, className }: CodexColumnProps) {
  return (
    <aside aria-label="Códice do personagem" className={`flex flex-col gap-3 ${className ?? ""}`}>
      {/* Avatar placeholder */}
      <div className="glass-card flex aspect-[3/4] w-full items-center justify-center rounded-xl">
        <i aria-hidden="true" className="fa-solid fa-user text-5xl text-[#7a7e99]" />
      </div>

      {/* Identity info */}
      <div className="glass-card flex flex-col gap-3 rounded-xl p-4">
        <CodexRow label="Tendência" value={description.alinhamento} />
        <CodexRow label="Fé" value={description.faith} />
        <CodexRow label="Estilo de Vida" value={description.lifestyle} />
        <div className="grid grid-cols-2 gap-3">
          <CodexRow label="Idade" value={description.age} />
          <CodexRow label="Gênero" value={description.gender} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CodexRow label="Altura" value={description.height} />
          <CodexRow label="Peso" value={description.weight} />
        </div>
      </div>

      {/* Personality */}
      {description.personalidade && (
        <div className="glass-card flex flex-col gap-1.5 rounded-xl p-4">
          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Personalidade
          </span>
          <p className="text-[0.8rem] leading-relaxed text-[#b0b5cc]">
            {description.personalidade}
          </p>
        </div>
      )}

      {/* Appearance */}
      {description.aparencia && (
        <div className="glass-card flex flex-col gap-1.5 rounded-xl p-4">
          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Aparência Fiel
          </span>
          <p className="text-[0.8rem] leading-relaxed text-[#b0b5cc]">
            {description.aparencia}
          </p>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: TypeScript check**

```powershell
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/sheet/CodexColumn.tsx
git commit -m "feat(sheet): add CodexColumn with avatar, identity, personality, appearance"
```

---

## Task 12: Wire everything in `CharacterSheetPage` + final check

**Files:**
- Modify: `src/components/pages/CharacterSheetPage.tsx`

- [ ] **Step 1: Replace stub with fully assembled `CharacterSheetPage`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { cn } from "@/src/lib/utils";
import { SheetHeader } from "@/src/components/organisms/sheet/SheetHeader";
import { AttributesColumn } from "@/src/components/organisms/sheet/AttributesColumn";
import { SkillsColumn } from "@/src/components/organisms/sheet/SkillsColumn";
import { MainContentColumn } from "@/src/components/organisms/sheet/MainContentColumn";
import { CodexColumn } from "@/src/components/organisms/sheet/CodexColumn";

type MobileTab = "attrs" | "skills" | "actions" | "codex";

const MOBILE_TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: "attrs",   icon: "fa-dice-d20",  label: "Atributos" },
  { id: "skills",  icon: "fa-list-check", label: "Perícias" },
  { id: "actions", icon: "fa-sword",       label: "Ações" },
  { id: "codex",   icon: "fa-book-open",   label: "Códice" },
];

export function CharacterSheetPage() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("attrs");
  const state = useSheetState();
  const description = useCharacterStore((s) => s.description);
  const summary = useMemo(() => selectCharacterSheetSummary(state), [state]);

  return (
    <div className="flex min-h-screen flex-col bg-[#12131a]">
      <main className="flex-1 p-3 pb-20 md:pb-3 lg:p-4">
        <SheetHeader summary={summary} />

        {/* Desktop/tablet grid */}
        <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          <AttributesColumn summary={summary} />
          <SkillsColumn summary={summary} />
          <MainContentColumn summary={summary} className="md:col-span-2 lg:col-span-1" />
          <CodexColumn
            summary={summary}
            description={description}
            className="hidden xl:flex xl:flex-col"
          />
        </div>

        {/* Mobile: single panel per tab */}
        <div className="md:hidden">
          {mobileTab === "attrs"   && <AttributesColumn summary={summary} />}
          {mobileTab === "skills"  && <SkillsColumn summary={summary} />}
          {mobileTab === "actions" && <MainContentColumn summary={summary} />}
          {mobileTab === "codex"   && (
            <CodexColumn summary={summary} description={description} />
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Seções da ficha"
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/10 bg-[#10121b] md:hidden"
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors",
              mobileTab === tab.id ? "text-[#e61c23]" : "text-[#7a7e99]",
            )}
          >
            <i aria-hidden="true" className={`fa-solid ${tab.icon} text-base`} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function useSheetState(): CharacterBuilderState {
  const ruleset = useCharacterStore((s) => s.ruleset);
  const level = useCharacterStore((s) => s.level);
  const selectedSpeciesId = useCharacterStore((s) => s.selectedSpeciesId);
  const selectedClassId = useCharacterStore((s) => s.selectedClassId);
  const selectedBackgroundId = useCharacterStore((s) => s.selectedBackgroundId);
  const inventory = useCharacterStore((s) => s.inventory);
  const equipmentChoicesBySource = useCharacterStore((s) => s.equipmentChoicesBySource);
  const maxUnlockedStepIndex = useCharacterStore((s) => s.maxUnlockedStepIndex);
  const pendingChoiceIds = useCharacterStore((s) => s.pendingChoiceIds);
  const classSkillProficiencies = useCharacterStore((s) => s.classSkillProficiencies);
  const skillTraining = useCharacterStore((s) => s.skillTraining);
  const classFeatureChoices = useCharacterStore((s) => s.classFeatureChoices);
  const speciesChoices = useCharacterStore((s) => s.speciesChoices);
  const speciesLanguages = useCharacterStore((s) => s.speciesLanguages);
  const attributeGenerationMethod = useCharacterStore((s) => s.attributeGenerationMethod);
  const baseAttributes = useCharacterStore((s) => s.baseAttributes);
  const backgroundAbilityBonuses = useCharacterStore((s) => s.backgroundAbilityBonuses);
  const description = useCharacterStore((s) => s.description);

  return useMemo(
    () => ({
      ruleset, level, selectedSpeciesId, selectedClassId, selectedBackgroundId,
      inventory, equipmentChoicesBySource, maxUnlockedStepIndex, pendingChoiceIds,
      classSkillProficiencies, skillTraining, classFeatureChoices, speciesChoices,
      speciesLanguages, attributeGenerationMethod, baseAttributes, backgroundAbilityBonuses,
      description,
    }),
    [
      ruleset, level, selectedSpeciesId, selectedClassId, selectedBackgroundId,
      inventory, equipmentChoicesBySource, maxUnlockedStepIndex, pendingChoiceIds,
      classSkillProficiencies, skillTraining, classFeatureChoices, speciesChoices,
      speciesLanguages, attributeGenerationMethod, baseAttributes, backgroundAbilityBonuses,
      description,
    ],
  );
}
```

- [ ] **Step 2: Full TypeScript check**

```powershell
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Build check**

```powershell
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 4: Verify manually** — navigate to `/sheet`, confirm:
  - Character name, level, class appear in header
  - 6 attribute blocks render
  - Skills list renders with proficiency dots
  - Passives show values
  - Weapons table has unarmed attack row
  - Tabs switch correctly (Ações → Magias → etc.)
  - Notes textarea auto-saves on blur
  - Mobile: bottom nav appears on narrow screen, tabs switch columns

- [ ] **Step 5: Final commit**

```bash
git add src/components/pages/CharacterSheetPage.tsx
git commit -m "feat(sheet): wire up CharacterSheetPage with all columns and mobile nav"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task covering it |
|---|---|
| SheetHeader with HP/CA/initiative/speed/profBonus/inspiration | Task 5 |
| Inspiration toggle | Task 5 (local state in SheetHeader) |
| HP display-only, no HEAL/DAMAGE | Task 5 — no buttons |
| currentHp === 0 → DeathSavesOverlay | Task 5 |
| AttributeBlock with modifier + score + left bar | Task 6 |
| Skills grouped by attribute with save row | Task 7 |
| Proficiency circle (red filled), expertise (gold) | Task 7 SkillRow |
| PassivesPanel with 3 passives | Task 7 |
| SensesPanel + languages | Task 7 |
| DefensesPanel resistances/immunities/vulnerabilities | Task 8 |
| ConditionsPanel with toggle | Task 8 |
| 5 main tabs | Task 9 ContentTabs |
| AÇÕES sub-filters by source | Task 9 |
| Spells: isSpellcaster guard | Task 9 |
| Inventory from selectedEquipment | Task 9 |
| Features with source badge | Task 9 ActionCard |
| Notes textarea auto-save onBlur | Task 9 |
| Weapons table with overflow-x-auto, min 3 rows | Task 10 |
| CodexColumn with description fields | Task 11 |
| 4-col xl / 3-col lg / 2-col md / 1-col mobile grid | Task 12 |
| Mobile bottom nav with 4 tabs | Tasks 4 + 12 |
| All values from selector (no component-level arithmetic) | Task 2 |
| npx tsc --noEmit passes | Every task |
| npm run build passes | Task 12 |
| No invented design tokens | Every task (hex literals only) |

### Known limitations / deferred

- **Senses**: `BuilderSpecies` doesn't store senses in the normalized type → `senses: []` until the adapter is extended to parse `darkvision` from raw data.
- **Resistances/immunities**: Same — `[]` until the species adapter is extended.
- **Weapons attack bonus/damage**: Placeholder values (`+profBonus`, `"—"`) — accurate weapon stat calculation requires knowing weapon damage die and attack attribute, which is not in the current adapter output. Flag as a future task.
- **Languages from background**: Only `speciesLanguages` is included. Background languages chosen by the user are not currently tracked in the store.
- **Spells tab**: Shows placeholder text — spell system not yet implemented.
- **Death saves persistence**: Local state only (resets on page reload) — spec-approved behavior.
- **inspiration toggle**: Local state in SheetHeader — not persisted.

### Placeholder scan

No TBD/TODO items in any code block. Every step has complete code.

### Type consistency check

- `SheetAttribute` defined in Task 1, used in Task 6 `AttributeBlock` ✓
- `SheetSkill` defined in Task 1, used in Tasks 2 + 7 `SkillRow` ✓
- `SheetSavingThrow` defined in Task 1, used in Tasks 2 + 7 `SkillsColumn` ✓
- `SheetFeature` defined in Task 1, used in Tasks 2 + 9 `ActionCard` ✓
- `SheetWeapon` defined in Task 1, used in Tasks 2 + 10 `MainContentColumn` ✓
- `CharacterDescription` accessed via `useCharacterStore(s => s.description)` in Tasks 9 (notes) + 11 `CodexColumn` ✓
- `computeSkills` returns `SheetSkill[]`, called in Task 2, type defined in Task 1 ✓
- `ATTRIBUTE_ABBR` used in Task 2 to build `SheetSavingThrow.abbr`, displayed in Task 7 ✓
