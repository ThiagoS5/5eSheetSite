# Level-Choice Engine Implementation Plan (Level-Up Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure-logic engine that, given a class + level, knows which choices a level requires (subclass / ASI-or-feat / feature-option), validates persisted choices, and feeds ASI + subclass features into the single derived truth.

**Architecture:** Three new pure modules — `rules/levelProgression.ts` (requirement classification), `src/adapters/featCatalog.ts` (feat catalog + prerequisites), `src/store/levelChoiceResolver.ts` (validation + derived integration). Choices persist in `choices.selectedSubclassId` and `progression.levelChoices[n].asiOrFeat` (schema bump v3→v4). The store/selector is the only layer that wires the pure engine into state. No UI (Phase 2/3).

**Tech Stack:** TypeScript, Vitest, Zustand, 5etools JSON data.

**Spec:** `docs/superpowers/specs/2026-06-22-level-choice-engine-design.md`

**Conventions for every task:** run a single test file with `npx vitest run <path>`; typecheck with `npx tsc --noEmit`; lint touched files with `npx eslint <paths>`. Attribute keys are Portuguese: `forca | destreza | constituicao | inteligencia | sabedoria | carisma`. 5etools ability abbrevs (`str/dex/con/int/wis/cha`) must be mapped to these.

---

## File Structure

| File | Responsibility |
|---|---|
| `types/builder.ts` | Add `BuilderFeature.grantsSubclass`; new types `BuilderSubclass`, `FeatCategory`, `FeatAbilityBonus`, `FeatPrerequisite`, `BuilderFeat`; `BuilderClass.subclasses`. |
| `src/adapters/fiveEToolsAdapter.ts` | Propagate `gainSubclassFeature` → `grantsSubclass`; normalize subclasses + subclass features into `BuilderClass.subclasses`. |
| `src/services/ruleService.ts` | Pass `file.subclass`/`file.subclassFeature` into `normalizeClass`; add `getSubclassesForClass`, `getFeats`. |
| `rules/levelProgression.ts` | **New.** `LevelChoiceRequirement` union + `getLevelRequirements(class, fromLevel, toLevel)`. |
| `src/adapters/featCatalog.ts` | **New.** `normalizeFeats(raw)`, `meetsPrerequisite(feat, ctx)`, `getSelectableFeats(category, feats, ctx)`. |
| `src/store/levelChoiceResolver.ts` | **New.** `collectAsiBonuses`, `getActiveSubclassFeatures`, `getUnresolvedLevelChoices`. |
| `src/types/characterBuild.ts` | `choices.selectedSubclassId`; `levelChoices[n].asiOrFeat`; `AsiOrFeatChoice`; bump `CHARACTER_BUILD_SCHEMA_VERSION` 3→4. |
| `src/store/characterStore.types.ts` | Flat mirror fields `selectedSubclassId`, `asiOrFeatByLevel`; actions `selectSubclass`, `setLevelAsiOrFeat`. |
| `src/store/characterBuildModel.ts` | Defaults, flatten, normalize, build assembly for the two new fields. |
| `src/store/createCharacterStore.ts` | Implement `selectSubclass`, `setLevelAsiOrFeat` actions. |
| `src/store/characterSelectors.ts` | Merge ASI bonuses into `finalAttributes`; append subclass features + level pendings. |

---

## Task 1: Propagate `grantsSubclass` onto class features

**Files:**
- Modify: `types/builder.ts` (BuilderFeature)
- Modify: `src/adapters/fiveEToolsAdapter.ts:518` (`normalizeClassFeature`)
- Test: `src/adapters/_tests_/fiveEToolsAdapter.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/adapters/_tests_/fiveEToolsAdapter.test.ts`:

```ts
import { getBuilderClasses } from "@/src/services/ruleService";

it("marks the subclass-granting feature with grantsSubclass", () => {
  const fighter = getBuilderClasses().find((c) => c.id === "fighter-xphb");
  const subclassPoint = fighter?.allFeatures.find(
    (f) => f.level === 3 && f.grantsSubclass,
  );
  expect(subclassPoint).toBeDefined();
  // Non-subclass features must not be flagged.
  const secondWind = fighter?.allFeatures.find((f) => f.name === "Second Wind");
  expect(secondWind?.grantsSubclass).toBeFalsy();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts -t "grantsSubclass"`
Expected: FAIL — `grantsSubclass` is `undefined` (property does not exist yet).

- [ ] **Step 3: Add the field to the type**

In `types/builder.ts`, extend `BuilderFeature`:

```ts
export interface BuilderFeature {
  name: string;
  description: string;
  level?: number;
  blocks?: BuilderFeatureBlock[];
  grantsSubclass?: boolean;
}
```

- [ ] **Step 4: Populate it in the adapter**

In `src/adapters/fiveEToolsAdapter.ts`, change `normalizeClassFeature` so the returned object includes the flag. The `feature` param is `string | { classFeature: string; gainSubclassFeature?: boolean }`:

```ts
  return {
    name,
    level: Number.isFinite(featureLevel) ? featureLevel : undefined,
    description:
      stringifyEntries(matchedFeature?.entries) || "Class feature details.",
    blocks: entriesToBlocks(matchedFeature?.entries),
    grantsSubclass:
      typeof feature === "object" && feature.gainSubclassFeature === true,
  };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts -t "grantsSubclass"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add types/builder.ts src/adapters/fiveEToolsAdapter.ts src/adapters/_tests_/fiveEToolsAdapter.test.ts
git commit -m "feat(adapter): propagate gainSubclassFeature to BuilderFeature.grantsSubclass"
```

---

## Task 2: Normalize subclasses into `BuilderClass.subclasses`

**Files:**
- Modify: `types/builder.ts` (add `BuilderSubclass`, `BuilderClass.subclasses`)
- Modify: `src/adapters/fiveEToolsAdapter.ts` (`normalizeClass` signature + new `normalizeSubclass`/`normalizeSubclassFeature`)
- Modify: `src/services/ruleService.ts` (pass subclass data; add `getSubclassesForClass`)
- Test: `src/services/_tests_/ruleService.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/services/_tests_/ruleService.test.ts`:

```ts
import { getSubclassesForClass } from "@/src/services/ruleService";

it("exposes a class's 2024 subclasses with leveled features", () => {
  const subclasses = getSubclassesForClass("fighter-xphb");
  const battleMaster = subclasses.find((s) => s.name === "Battle Master");
  expect(battleMaster).toBeDefined();
  expect(battleMaster?.id).toBe("battle-master-xphb");
  // Battle Master gains "Combat Superiority" at level 3.
  expect(
    battleMaster?.features.some((f) => f.level === 3 && f.name.length > 0),
  ).toBe(true);
});

it("returns an empty list for an unknown class id", () => {
  expect(getSubclassesForClass("does-not-exist")).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/_tests_/ruleService.test.ts -t "subclasses"`
Expected: FAIL — `getSubclassesForClass` is not exported.

- [ ] **Step 3: Add the types**

In `types/builder.ts`:

```ts
export interface BuilderSubclass {
  id: string;
  name: string;
  shortName: string;
  source: string;
  features: BuilderFeature[];
}
```

And add to the existing `BuilderClass` interface:

```ts
  subclasses: BuilderSubclass[];
```

- [ ] **Step 4: Normalize subclasses in the adapter**

In `src/adapters/fiveEToolsAdapter.ts`, add helpers near `normalizeClassFeature`. The subclassFeature ref format is `Name|className|classSource|subclassShortName|subclassSource|level`:

```ts
function normalizeSubclassFeature(
  featureRef: string,
  subclassFeatures: Raw5eFeature[],
): BuilderFeature {
  const [name, className, , subclassShortName, source, level] =
    featureRef.split("|");
  const featureLevel = Number(level);
  const matched = subclassFeatures.find(
    (entry) =>
      entry.name === name &&
      entry.source === source &&
      entry.level === featureLevel &&
      (entry as { subclassShortName?: string }).subclassShortName ===
        subclassShortName,
  );

  return {
    name,
    level: Number.isFinite(featureLevel) ? featureLevel : undefined,
    description: stringifyEntries(matched?.entries) || "Subclass feature details.",
    blocks: entriesToBlocks(matched?.entries),
  };
}

function normalizeSubclass(
  rawSubclass: Raw5eSubclass,
  subclassFeatures: Raw5eFeature[],
): BuilderSubclass {
  return {
    id: toSlug(rawSubclass.name, rawSubclass.source),
    name: rawSubclass.name,
    shortName: rawSubclass.shortName ?? rawSubclass.name,
    source: rawSubclass.source,
    features: (rawSubclass.subclassFeatures ?? []).map((ref) =>
      normalizeSubclassFeature(ref, subclassFeatures),
    ),
  };
}
```

If `Raw5eSubclass` / `Raw5eFeature.subclassShortName` are not yet typed, add minimal types to `types/fiveETools.ts`:

```ts
export interface Raw5eSubclass {
  name: string;
  shortName?: string;
  source: string;
  className: string;
  classSource: string;
  subclassFeatures?: string[];
}
```

- [ ] **Step 5: Thread subclasses through `normalizeClass`**

In `src/adapters/fiveEToolsAdapter.ts`, extend the `normalizeClass` signature and body. Add two params after the existing ones:

```ts
export function normalizeClass(
  rawClass: Raw5eClass,
  classFeatures: Raw5eFeature[],
  classFluff: Raw5eClassFluff[],
  lore: RawPlayerLoreEntry | undefined,
  weaponMasteryOptions: BuilderChoiceOption[],
  rawSubclasses: Raw5eSubclass[] = [],
  subclassFeatures: Raw5eFeature[] = [],
): BuilderClass {
```

Inside the returned object, add:

```ts
    subclasses: rawSubclasses
      .filter(
        (sub) =>
          sub.className === rawClass.name &&
          sub.classSource === rawClass.source,
      )
      .map((sub) => normalizeSubclass(sub, subclassFeatures)),
```

- [ ] **Step 6: Pass the data + add the getter in ruleService**

In `src/services/ruleService.ts`, update the `normalizeClass(...)` call inside `getBuilderClasses` to pass the new args:

```ts
        .map((rawClass) =>
          normalizeClass(
            rawClass,
            file.classFeature ?? [],
            [],
            playerLore.class?.[toSlug(rawClass.name, rawClass.source)],
            weaponMasteryOptions,
            file.subclass ?? [],
            file.subclassFeature ?? [],
          ),
        ),
```

Then add the exported getter:

```ts
export function getSubclassesForClass(classId: string) {
  return getBuilderClasses().find((entry) => entry.id === classId)?.subclasses ?? [];
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/services/_tests_/ruleService.test.ts -t "subclasses"`
Expected: PASS.

- [ ] **Step 8: Typecheck + commit**

Run: `npx tsc --noEmit` → no errors.

```bash
git add types/builder.ts types/fiveETools.ts src/adapters/fiveEToolsAdapter.ts src/services/ruleService.ts src/services/_tests_/ruleService.test.ts
git commit -m "feat(rules): normalize class subclasses and expose getSubclassesForClass"
```

---

## Task 3: `getLevelRequirements` (requirement classification)

**Files:**
- Create: `rules/levelProgression.ts`
- Test: `rules/_tests_/levelProgression.test.ts`

- [ ] **Step 1: Write the failing test**

Create `rules/_tests_/levelProgression.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getLevelRequirements } from "@/rules/levelProgression";
import { getBuilderClasses } from "@/src/services/ruleService";

function fighter() {
  const c = getBuilderClasses().find((entry) => entry.id === "fighter-xphb");
  if (!c) throw new Error("fighter-xphb missing");
  return c;
}

describe("getLevelRequirements", () => {
  it("emits a single subclass requirement at level 3 (deduped)", () => {
    const reqs = getLevelRequirements(fighter(), 0, 20);
    const subclassReqs = reqs.filter((r) => r.kind === "subclass");
    expect(subclassReqs).toHaveLength(1);
    expect(subclassReqs[0].level).toBe(3);
  });

  it("emits asi-or-feat at each ASI level", () => {
    const reqs = getLevelRequirements(fighter(), 0, 8);
    const asiLevels = reqs
      .filter((r) => r.kind === "asi-or-feat")
      .map((r) => r.level);
    expect(asiLevels).toContain(4);
    expect(asiLevels).toContain(6); // Fighter gets a bonus ASI at 6
  });

  it("emits nothing for an out-of-range interval", () => {
    const reqs = getLevelRequirements(fighter(), 4, 5);
    expect(reqs.every((r) => r.level > 4 && r.level <= 5)).toBe(true);
    expect(reqs.some((r) => r.kind === "subclass")).toBe(false);
  });

  it("emits a feature-option for Weapon Mastery at level 1", () => {
    const reqs = getLevelRequirements(fighter(), 0, 1);
    const wm = reqs.find(
      (r) => r.kind === "feature-option" && r.featureName === "Weapon Mastery",
    );
    expect(wm).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run rules/_tests_/levelProgression.test.ts`
Expected: FAIL — cannot import `getLevelRequirements`.

- [ ] **Step 3: Implement the module**

Create `rules/levelProgression.ts`:

```ts
import type { BuilderChoiceOption, BuilderClass } from "@/types/builder";

/** Canonical SRD 2024 feature name for an Ability Score Improvement. */
export const ASI_FEATURE_NAME = "Ability Score Improvement";

export type LevelChoiceRequirement =
  | { id: string; kind: "subclass"; level: number }
  | { id: string; kind: "asi-or-feat"; level: number }
  | {
      id: string;
      kind: "feature-option";
      level: number;
      featureName: string;
      count: number;
      options: BuilderChoiceOption[];
    };

/**
 * Returns the choices a character must make for levels in the half-open
 * interval `(fromLevel, toLevel]`. Pure: derived only from class data.
 */
export function getLevelRequirements(
  characterClass: BuilderClass,
  fromLevel: number,
  toLevel: number,
): LevelChoiceRequirement[] {
  const inRange = (level: number) => level > fromLevel && level <= toLevel;
  const requirements: LevelChoiceRequirement[] = [];

  // Subclass: dedupe to the lowest level that grants a subclass across ALL levels.
  const subclassLevels = characterClass.allFeatures
    .filter((f) => f.grantsSubclass)
    .map((f) => f.level ?? 0)
    .filter((level) => level > 0);
  if (subclassLevels.length > 0) {
    const selectionLevel = Math.min(...subclassLevels);
    if (inRange(selectionLevel)) {
      requirements.push({
        id: `subclass-${selectionLevel}`,
        kind: "subclass",
        level: selectionLevel,
      });
    }
  }

  // ASI / feat: one per ASI feature occurrence within range.
  for (const feature of characterClass.allFeatures) {
    if (feature.name === ASI_FEATURE_NAME && inRange(feature.level ?? 0)) {
      requirements.push({
        id: `asi-${feature.level}`,
        kind: "asi-or-feat",
        level: feature.level ?? 0,
      });
    }
  }

  // Feature-options: existing class choice groups, placed at their feature level.
  for (const group of characterClass.featureChoiceGroups ?? []) {
    const level =
      characterClass.allFeatures.find((f) => f.name === group.featureName)
        ?.level ?? 1;
    if (inRange(level)) {
      requirements.push({
        id: group.id,
        kind: "feature-option",
        level,
        featureName: group.featureName,
        count: group.count,
        options: group.options,
      });
    }
  }

  return requirements.sort((a, b) => a.level - b.level);
}
```

> Note: if `BuilderClass.featureChoiceGroups` is optional/undefined, the `?? []` guard handles it. Confirm the property name in `types/builder.ts` (`featureChoiceGroups`) and adjust if it differs.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run rules/_tests_/levelProgression.test.ts`
Expected: PASS (all 4).

- [ ] **Step 5: Typecheck + commit**

Run: `npx tsc --noEmit` → no errors.

```bash
git add rules/levelProgression.ts rules/_tests_/levelProgression.test.ts
git commit -m "feat(rules): getLevelRequirements classifies per-level choices"
```

---

## Task 4: Feat catalog normalization (`getFeats`)

**Files:**
- Create: `src/adapters/featCatalog.ts`
- Modify: `types/builder.ts` (feat types)
- Modify: `src/services/ruleService.ts` (`getFeats`)
- Test: `src/adapters/_tests_/featCatalog.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/adapters/_tests_/featCatalog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getFeats } from "@/src/services/ruleService";

describe("getFeats", () => {
  it("normalizes 2024 feat categories", () => {
    const feats = getFeats();
    const grappler = feats.find((f) => f.name === "Grappler" && f.source === "XPHB");
    expect(grappler?.category).toBe("general");
  });

  it("captures level + ability prerequisites (mapped to PT keys)", () => {
    const grappler = getFeats().find(
      (f) => f.name === "Grappler" && f.source === "XPHB",
    );
    // Grappler: level 4 AND (str>=13 OR dex>=13) -> two OR entries.
    expect(grappler?.prerequisites.length).toBeGreaterThanOrEqual(2);
    const hasStr = grappler?.prerequisites.some(
      (p) => p.level === 4 && p.abilities?.forca === 13,
    );
    const hasDex = grappler?.prerequisites.some(
      (p) => p.level === 4 && p.abilities?.destreza === 13,
    );
    expect(hasStr).toBe(true);
    expect(hasDex).toBe(true);
  });

  it("captures half-feat ability bonus", () => {
    const grappler = getFeats().find(
      (f) => f.name === "Grappler" && f.source === "XPHB",
    );
    expect(grappler?.abilityBonus?.choose?.from).toEqual(
      expect.arrayContaining(["forca", "destreza"]),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/adapters/_tests_/featCatalog.test.ts`
Expected: FAIL — `getFeats` not exported.

- [ ] **Step 3: Add the feat types**

In `types/builder.ts` (ensure `import type { AttributeKey } from "@/types/dnd";` is present at the top):

```ts
export type FeatCategory = "origin" | "general" | "fighting-style" | "epic-boon";

export interface FeatAbilityBonus {
  fixed?: Partial<Record<AttributeKey, number>>;
  choose?: { from: AttributeKey[]; amount: number };
}

export interface FeatPrerequisite {
  level?: number;
  abilities?: Partial<Record<AttributeKey, number>>;
  feat?: string[];
}

export interface BuilderFeat {
  id: string;
  name: string;
  source: string;
  category: FeatCategory;
  prerequisites: FeatPrerequisite[];
  abilityBonus?: FeatAbilityBonus;
  repeatable: boolean;
  description: string;
}
```

- [ ] **Step 4: Implement the catalog adapter**

Create `src/adapters/featCatalog.ts`:

```ts
import type {
  BuilderFeat,
  FeatAbilityBonus,
  FeatCategory,
  FeatPrerequisite,
} from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";
import { formatTaggedTextAsPlain, toSlug } from "@/src/adapters/fiveEToolsAdapter";

const ABILITY_ABBR_TO_KEY: Record<string, AttributeKey> = {
  str: "forca",
  dex: "destreza",
  con: "constituicao",
  int: "inteligencia",
  wis: "sabedoria",
  cha: "carisma",
};

const CATEGORY_MAP: Record<string, FeatCategory> = {
  O: "origin",
  G: "general",
  FS: "fighting-style",
  "FS:P": "fighting-style",
  "FS:R": "fighting-style",
  EB: "epic-boon",
};

interface RawFeat {
  name: string;
  source: string;
  category?: string;
  prerequisite?: unknown[];
  ability?: unknown[];
  repeatable?: boolean;
  entries?: unknown[];
}

function mapPrerequisites(raw: unknown[] | undefined): FeatPrerequisite[] {
  return (raw ?? []).map((entry) => {
    const record = entry as {
      level?: number | { level?: number };
      ability?: Array<Record<string, number>>;
      feat?: string[];
    };
    const level =
      typeof record.level === "object" ? record.level?.level : record.level;
    const abilities: Partial<Record<AttributeKey, number>> = {};
    for (const abilityObj of record.ability ?? []) {
      for (const [abbr, value] of Object.entries(abilityObj)) {
        const key = ABILITY_ABBR_TO_KEY[abbr];
        if (key) abilities[key] = value;
      }
    }
    const prereq: FeatPrerequisite = {};
    if (typeof level === "number") prereq.level = level;
    if (Object.keys(abilities).length > 0) prereq.abilities = abilities;
    if (record.feat?.length) {
      prereq.feat = record.feat.map((f) => f.split("|")[0].toLowerCase());
    }
    return prereq;
  });
}

function mapAbilityBonus(raw: unknown[] | undefined): FeatAbilityBonus | undefined {
  const first = (raw ?? [])[0] as
    | { choose?: { from?: string[]; amount?: number }; [k: string]: unknown }
    | undefined;
  if (!first) return undefined;

  if (first.choose?.from) {
    const from = first.choose.from
      .map((abbr) => ABILITY_ABBR_TO_KEY[abbr])
      .filter((key): key is AttributeKey => Boolean(key));
    return { choose: { from, amount: first.choose.amount ?? 1 } };
  }

  const fixed: Partial<Record<AttributeKey, number>> = {};
  for (const [abbr, value] of Object.entries(first)) {
    const key = ABILITY_ABBR_TO_KEY[abbr];
    if (key && typeof value === "number") fixed[key] = value;
  }
  return Object.keys(fixed).length > 0 ? { fixed } : undefined;
}

export function normalizeFeats(rawFeats: RawFeat[]): BuilderFeat[] {
  return rawFeats.map((feat) => ({
    id: toSlug(feat.name, feat.source),
    name: feat.name,
    source: feat.source,
    category: CATEGORY_MAP[feat.category ?? "G"] ?? "general",
    prerequisites: mapPrerequisites(feat.prerequisite),
    abilityBonus: mapAbilityBonus(feat.ability),
    repeatable: feat.repeatable === true,
    description: formatTaggedTextAsPlain(
      (feat.entries ?? []).filter((e) => typeof e === "string").join(" "),
    ),
  }));
}
```

> `formatTaggedTextAsPlain` and `toSlug` are already exported from `fiveEToolsAdapter.ts` (verified). If `entries` contains non-string nodes, they are skipped here — full block rendering is a Phase 2 concern.

- [ ] **Step 5: Wire `getFeats` in ruleService**

In `src/services/ruleService.ts`, add an import for the feats data and `normalizeFeats`, then export:

```ts
import featsData from "@/public/data/feats.json";
import { normalizeFeats } from "@/src/adapters/featCatalog";

export function getFeats() {
  return normalizeFeats(
    featsData.feat.filter((feat) => is2024Source(feat.source)),
  );
}
```

> Match the existing import style in `ruleService.ts` (it already imports JSON data files at the top). `is2024Source` is already imported/used there.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/adapters/_tests_/featCatalog.test.ts`
Expected: PASS (all 3).

- [ ] **Step 7: Typecheck + commit**

```bash
git add types/builder.ts src/adapters/featCatalog.ts src/services/ruleService.ts src/adapters/_tests_/featCatalog.test.ts
git commit -m "feat(adapter): feat catalog normalization (getFeats)"
```

---

## Task 5: Prerequisites + selectable feats

**Files:**
- Modify: `src/adapters/featCatalog.ts`
- Test: `src/adapters/_tests_/featCatalog.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/adapters/_tests_/featCatalog.test.ts`:

```ts
import { getSelectableFeats, meetsPrerequisite } from "@/src/adapters/featCatalog";

describe("meetsPrerequisite", () => {
  const grappler = () => {
    const f = getFeats().find((x) => x.name === "Grappler" && x.source === "XPHB");
    if (!f) throw new Error("Grappler missing");
    return f;
  };
  const ctx = (over = {}) => ({
    level: 4,
    finalAttributes: {
      forca: 15, destreza: 8, constituicao: 10,
      inteligencia: 10, sabedoria: 10, carisma: 10,
    },
    chosenFeatIds: [] as string[],
    ...over,
  });

  it("passes when one OR-branch is satisfied", () => {
    expect(meetsPrerequisite(grappler(), ctx())).toBe(true);
  });

  it("fails when level is too low", () => {
    expect(meetsPrerequisite(grappler(), ctx({ level: 1 }))).toBe(false);
  });

  it("fails when no ability threshold is met", () => {
    expect(
      meetsPrerequisite(
        grappler(),
        ctx({
          finalAttributes: {
            forca: 8, destreza: 8, constituicao: 10,
            inteligencia: 10, sabedoria: 10, carisma: 10,
          },
        }),
      ),
    ).toBe(false);
  });

  it("passes a feat with no prerequisites", () => {
    const noPrereq = getFeats().find((f) => f.prerequisites.length === 0);
    expect(noPrereq && meetsPrerequisite(noPrereq, ctx())).toBe(true);
  });
});

describe("getSelectableFeats", () => {
  it("returns only general feats whose prerequisites are met, excluding chosen non-repeatables", () => {
    const feats = getFeats();
    const ctx = {
      level: 4,
      finalAttributes: {
        forca: 15, destreza: 15, constituicao: 15,
        inteligencia: 15, sabedoria: 15, carisma: 15,
      },
      chosenFeatIds: [] as string[],
    };
    const selectable = getSelectableFeats("general", feats, ctx);
    expect(selectable.every((f) => f.category === "general")).toBe(true);
    // Exclude an already-chosen non-repeatable feat.
    const chosen = selectable[0];
    const after = getSelectableFeats("general", feats, {
      ...ctx,
      chosenFeatIds: [chosen.id],
    });
    if (!chosen.repeatable) {
      expect(after.some((f) => f.id === chosen.id)).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/adapters/_tests_/featCatalog.test.ts -t "meetsPrerequisite"`
Expected: FAIL — `meetsPrerequisite` / `getSelectableFeats` not exported.

- [ ] **Step 3: Implement the functions**

Append to `src/adapters/featCatalog.ts`:

```ts
export interface FeatPrerequisiteContext {
  level: number;
  finalAttributes: Record<AttributeKey, number>;
  chosenFeatIds: string[];
}

export function meetsPrerequisite(
  feat: BuilderFeat,
  ctx: FeatPrerequisiteContext,
): boolean {
  if (feat.prerequisites.length === 0) return true;

  // prerequisites is an OR across entries; each entry is an AND of conditions.
  return feat.prerequisites.some((entry) => {
    if (entry.level !== undefined && ctx.level < entry.level) return false;
    if (entry.abilities) {
      for (const [key, threshold] of Object.entries(entry.abilities)) {
        if (ctx.finalAttributes[key as AttributeKey] < (threshold ?? 0)) {
          return false;
        }
      }
    }
    if (entry.feat) {
      const owned = new Set(ctx.chosenFeatIds);
      if (!entry.feat.every((name) => owned.has(name) || owned.has(toSlug(name, "xphb")))) {
        return false;
      }
    }
    return true;
  });
}

export function getSelectableFeats(
  category: FeatCategory,
  feats: BuilderFeat[],
  ctx: FeatPrerequisiteContext,
): BuilderFeat[] {
  const chosen = new Set(ctx.chosenFeatIds);
  return feats.filter(
    (feat) =>
      feat.category === category &&
      meetsPrerequisite(feat, ctx) &&
      (feat.repeatable || !chosen.has(feat.id)),
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/adapters/_tests_/featCatalog.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Typecheck + lint + commit**

Run: `npx tsc --noEmit` and `npx eslint src/adapters/featCatalog.ts` → clean.

```bash
git add src/adapters/featCatalog.ts src/adapters/_tests_/featCatalog.test.ts
git commit -m "feat(adapter): feat prerequisites and selectable-feat filtering"
```

---

## Task 6: Schema v3→v4 — persist subclass + ASI/feat choices

**Files:**
- Modify: `src/types/characterBuild.ts`
- Modify: `src/store/characterStore.types.ts`
- Modify: `src/store/characterBuildModel.ts`
- Modify: `src/store/createCharacterStore.ts`
- Test: `src/store/_tests_/characterStore.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/store/_tests_/characterStore.test.ts`:

```ts
it("persists subclass and per-level ASI/feat choices through the build round-trip", () => {
  const store = createCharacterStore();
  store.getState().selectClass("fighter-xphb");
  store.getState().setLevel(4);
  store.getState().selectSubclass("battle-master-xphb");
  store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });

  const build = store.getState().characterBuild;
  expect(build.choices.selectedSubclassId).toBe("battle-master-xphb");
  expect(build.progression.levelChoices["4"].asiOrFeat).toEqual({
    mode: "asi",
    increases: { constituicao: 2 },
  });
  // Flat mirror reflects the same.
  expect(store.getState().selectedSubclassId).toBe("battle-master-xphb");
  expect(store.getState().asiOrFeatByLevel["4"]).toEqual({
    mode: "asi",
    increases: { constituicao: 2 },
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/_tests_/characterStore.test.ts -t "ASI/feat choices"`
Expected: FAIL — `selectSubclass`/`setLevelAsiOrFeat` not functions; `selectedSubclassId` undefined.

- [ ] **Step 3: Extend the canonical types + bump schema**

In `src/types/characterBuild.ts`:

```ts
export const CHARACTER_BUILD_SCHEMA_VERSION = 4;
```

Add the ASI/feat type and extend the level-choice + choices interfaces:

```ts
import type { AttributeBonuses } from "@/types/dnd";

export type AsiOrFeatChoice =
  | { mode: "asi"; increases: AttributeBonuses }
  | { mode: "feat"; featId: string; asi?: AttributeBonuses };

export interface CharacterBuildLevelChoiceState {
  asiOrFeat?: AsiOrFeatChoice;
  classFeatureChoices: Record<string, string[]>;
}
```

And add to `CharacterBuildChoices`:

```ts
  selectedSubclassId: string;
```

- [ ] **Step 4: Extend the flat state + actions interface**

In `src/store/characterStore.types.ts`, add to `FlatCharacterBuilderState`:

```ts
  selectedSubclassId: string;
  asiOrFeatByLevel: Record<string, AsiOrFeatChoice>;
```

Add the import at the top:

```ts
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
```

(also add `AsiOrFeatChoice` to the re-export block if other modules need it.)

Add to `CharacterBuilderActions`:

```ts
  selectSubclass: (subclassId: string) => void;
  setLevelAsiOrFeat: (level: number, choice: AsiOrFeatChoice | undefined) => void;
```

- [ ] **Step 5: Plumb the fields through the build model**

In `src/store/characterBuildModel.ts`:

In `getDefaultFlatState()` return object, add:

```ts
    selectedSubclassId: "",
    asiOrFeatByLevel: {},
```

In `flattenCharacterBuild()` return object, add:

```ts
    selectedSubclassId: build.choices?.selectedSubclassId,
    asiOrFeatByLevel: extractAsiOrFeatByLevel(build.progression?.levelChoices),
```

And add this helper near `flattenCharacterBuild`:

```ts
function extractAsiOrFeatByLevel(
  levelChoices: CharacterBuild["progression"]["levelChoices"] | undefined,
): Record<string, AsiOrFeatChoice> {
  const result: Record<string, AsiOrFeatChoice> = {};
  for (const [level, state] of Object.entries(levelChoices ?? {})) {
    if (state.asiOrFeat) result[level] = state.asiOrFeat;
  }
  return result;
}
```

(add `AsiOrFeatChoice` to the `characterBuild` import in this file.)

In `normalizeFlatState()`, add the two passthroughs:

```ts
    selectedSubclassId: state.selectedSubclassId ?? defaults.selectedSubclassId,
    asiOrFeatByLevel: state.asiOrFeatByLevel ?? defaults.asiOrFeatByLevel,
```

In `createBuildFromFlatState()`, replace the `currentLevelChoices`/`levelChoices` construction so it merges both class-feature choices AND per-level ASI/feat:

```ts
  const levelChoices: CharacterBuild["progression"]["levelChoices"] = {
    ...(previousBuild?.progression?.levelChoices ?? {}),
  };
  if (Object.keys(normalizedState.classFeatureChoices).length > 0) {
    const key = String(normalizedState.level);
    levelChoices[key] = {
      ...levelChoices[key],
      classFeatureChoices: normalizedState.classFeatureChoices,
    };
  }
  for (const [level, choice] of Object.entries(normalizedState.asiOrFeatByLevel)) {
    levelChoices[level] = {
      classFeatureChoices: levelChoices[level]?.classFeatureChoices ?? {},
      asiOrFeat: choice,
    };
  }
```

In the `choices:` block of the build, add:

```ts
      selectedSubclassId: normalizedState.selectedSubclassId,
```

In `createEmptyDerivedSheet` no change is needed (it derives from the same state).

- [ ] **Step 6: Implement the actions**

In `src/store/createCharacterStore.ts`, add inside the actions object (next to `selectClass`):

```ts
    selectSubclass: (selectedSubclassId) =>
      set((state) => patchCharacterState(state, { selectedSubclassId })),
    setLevelAsiOrFeat: (level, choice) =>
      set((state) => {
        const next = { ...state.asiOrFeatByLevel };
        if (choice) {
          next[String(level)] = choice;
        } else {
          delete next[String(level)];
        }
        return patchCharacterState(state, { asiOrFeatByLevel: next });
      }),
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/store/_tests_/characterStore.test.ts -t "ASI/feat choices"`
Expected: PASS.

- [ ] **Step 8: Typecheck + commit**

Run: `npx tsc --noEmit` → no errors (fix any missed passthroughs the compiler flags).

```bash
git add src/types/characterBuild.ts src/store/characterStore.types.ts src/store/characterBuildModel.ts src/store/createCharacterStore.ts src/store/_tests_/characterStore.test.ts
git commit -m "feat(store): persist subclass + per-level ASI/feat choices (schema v4)"
```

---

## Task 7: Migration test (v3 save → v4)

**Files:**
- Test: `src/store/_tests_/characterStore.persist.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/store/_tests_/characterStore.persist.test.ts`:

```ts
it("migrates a v3 save to v4 with subclass defaults and preserved levelChoices", () => {
  // Seed a v3-era persisted build: no selectedSubclassId, levelChoices with only classFeatureChoices.
  const v3Build = {
    draft: {
      currentStepSlug: "classe",
      maxUnlockedStepIndex: 1,
      pendingChoiceIds: [],
      inventory: [],
      equipmentChoicesBySource: {},
      description: {},
    },
    progression: {
      level: 1,
      levelChoices: { "1": { classFeatureChoices: { "weapon-mastery": ["Longsword"] } } },
    },
    choices: {
      ruleset: "2024",
      selectedSpeciesId: "",
      selectedClassId: "fighter-xphb",
      selectedBackgroundId: "",
      classSkillProficiencies: [],
      skillTraining: {},
      classFeatureChoices: { "weapon-mastery": ["Longsword"] },
      speciesChoices: {},
      speciesLanguages: [],
      attributeGenerationMethod: "standard-array",
      baseAttributes: { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 },
      backgroundAbilityBonuses: {},
    },
    derivedSheet: {},
    exportMetadata: { schemaVersion: 3, saveId: "legacy-1", createdAt: "x", updatedAt: "x" },
  };
  sessionStorage.setItem(
    "ficha-5e-builder",
    JSON.stringify({ state: { characterBuild: v3Build }, version: 3 }),
  );

  const store = createCharacterStore();
  const build = store.getState().characterBuild;

  expect(build.exportMetadata.schemaVersion).toBe(4);
  expect(build.choices.selectedSubclassId).toBe("");
  expect(build.progression.levelChoices["1"].classFeatureChoices).toEqual({
    "weapon-mastery": ["Longsword"],
  });
  expect(store.getState().selectedSubclassId).toBe("");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/_tests_/characterStore.persist.test.ts -t "migrates a v3 save to v4"`
Expected: FAIL initially if defaults are not yet applied — but since Task 6 added defaults via `normalizeCharacterBuild`, this should pass once Task 6 is done. If it fails, the gap is that `normalizeCharacterBuild` does not backfill `selectedSubclassId`; fix by confirming `getDefaultFlatState` includes it (it does after Task 6 Step 5) and that `flattenCharacterBuild` reads `build.choices?.selectedSubclassId` (undefined → default applied by `normalizeFlatState`).

- [ ] **Step 3: Verify migration passes**

Run: `npx vitest run src/store/_tests_/characterStore.persist.test.ts`
Expected: PASS (all existing + new).

- [ ] **Step 4: Commit**

```bash
git add src/store/_tests_/characterStore.persist.test.ts
git commit -m "test(store): cover schema v3->v4 migration"
```

---

## Task 8: Level-choice resolver

**Files:**
- Create: `src/store/levelChoiceResolver.ts`
- Test: `src/store/_tests_/levelChoiceResolver.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/_tests_/levelChoiceResolver.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { getBuilderClasses, getSubclassesForClass } from "@/src/services/ruleService";
import {
  collectAsiBonuses,
  getActiveSubclassFeatures,
  getUnresolvedLevelChoices,
} from "@/src/store/levelChoiceResolver";

function fighterClass() {
  const c = getBuilderClasses().find((x) => x.id === "fighter-xphb");
  if (!c) throw new Error("fighter-xphb missing");
  return c;
}

describe("collectAsiBonuses", () => {
  it("sums ASI increases and half-feat bonuses up to the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(6);
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });
    store.getState().setLevelAsiOrFeat(6, { mode: "feat", featId: "x", asi: { forca: 1 } });

    expect(collectAsiBonuses(store.getState())).toEqual({ constituicao: 2, forca: 1 });
  });

  it("ignores choices above the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 2 } });
    store.getState().setLevelAsiOrFeat(8, { mode: "asi", increases: { destreza: 2 } });

    expect(collectAsiBonuses(store.getState())).toEqual({ forca: 2 });
  });
});

describe("getUnresolvedLevelChoices", () => {
  it("reports an unfilled subclass and ASI choice", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "subclass" && u.level === 3)).toBe(true);
    expect(unresolved.some((u) => u.kind === "asi-or-feat" && u.level === 4)).toBe(true);
  });

  it("clears the subclass pending once a valid subclass is chosen", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 2 } });

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "subclass")).toBe(false);
    expect(unresolved.some((u) => u.kind === "asi-or-feat")).toBe(false);
  });

  it("treats an ASI that does not total 2 as unresolved", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { forca: 1 } });

    const unresolved = getUnresolvedLevelChoices(store.getState(), fighterClass());
    expect(unresolved.some((u) => u.kind === "asi-or-feat" && u.level === 4)).toBe(true);
  });
});

describe("getActiveSubclassFeatures", () => {
  it("returns subclass features unlocked up to the current level", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(7);
    store.getState().selectSubclass("battle-master-xphb");

    const features = getActiveSubclassFeatures(store.getState(), fighterClass());
    expect(features.length).toBeGreaterThan(0);
    expect(features.every((f) => (f.level ?? 1) <= 7)).toBe(true);
    // Battle Master's level-10 feature must not appear yet.
    const bm = getSubclassesForClass("fighter-xphb").find((s) => s.id === "battle-master-xphb");
    const level10 = bm?.features.find((f) => f.level === 10);
    if (level10) expect(features.some((f) => f.name === level10.name)).toBe(false);
  });

  it("returns nothing when no subclass is selected", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(7);
    expect(getActiveSubclassFeatures(store.getState(), fighterClass())).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/_tests_/levelChoiceResolver.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the resolver**

Create `src/store/levelChoiceResolver.ts`:

```ts
import { getLevelRequirements } from "@/rules/levelProgression";
import { getSubclassesForClass } from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { AsiOrFeatChoice } from "@/src/types/characterBuild";
import type { BuilderClass, BuilderFeature } from "@/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/types/dnd";

export interface UnresolvedChoice {
  level: number;
  kind: "subclass" | "asi-or-feat" | "feature-option";
  label: string;
}

function addBonuses(target: AttributeBonuses, source: AttributeBonuses | undefined): void {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "number") {
      target[key as AttributeKey] = (target[key as AttributeKey] ?? 0) + value;
    }
  }
}

/** Sum of ASI + half-feat ability bonuses for all levels <= current level. */
export function collectAsiBonuses(state: CharacterBuilderState): AttributeBonuses {
  const bonuses: AttributeBonuses = {};
  for (const [level, choice] of Object.entries(state.asiOrFeatByLevel)) {
    if (Number(level) > state.level) continue;
    if (choice.mode === "asi") {
      addBonuses(bonuses, choice.increases);
    } else {
      addBonuses(bonuses, choice.asi);
    }
  }
  return bonuses;
}

function asiTotal(choice: AsiOrFeatChoice): number {
  if (choice.mode !== "asi") return 0;
  return Object.values(choice.increases).reduce((sum, v) => sum + (v ?? 0), 0);
}

/** Subclass features unlocked up to the current level for the selected subclass. */
export function getActiveSubclassFeatures(
  state: CharacterBuilderState,
  characterClass: BuilderClass,
): BuilderFeature[] {
  if (!state.selectedSubclassId) return [];
  const subclass = characterClass.subclasses.find(
    (s) => s.id === state.selectedSubclassId,
  );
  if (!subclass) return [];
  return subclass.features.filter((f) => (f.level ?? 1) <= state.level);
}

/** Which level choices (1..currentLevel) are still missing or invalid. */
export function getUnresolvedLevelChoices(
  state: CharacterBuilderState,
  characterClass: BuilderClass,
): UnresolvedChoice[] {
  const requirements = getLevelRequirements(characterClass, 0, state.level);
  const validSubclassIds = new Set(
    getSubclassesForClass(characterClass.id).map((s) => s.id),
  );
  const unresolved: UnresolvedChoice[] = [];

  for (const req of requirements) {
    if (req.kind === "subclass") {
      const ok =
        state.selectedSubclassId !== "" &&
        validSubclassIds.has(state.selectedSubclassId);
      if (!ok) {
        unresolved.push({ level: req.level, kind: "subclass", label: `Nível ${req.level}: escolha uma subclasse` });
      }
    } else if (req.kind === "asi-or-feat") {
      const choice = state.asiOrFeatByLevel[String(req.level)];
      const ok =
        choice !== undefined &&
        (choice.mode === "feat" ? choice.featId !== "" : asiTotal(choice) === 2);
      if (!ok) {
        unresolved.push({ level: req.level, kind: "asi-or-feat", label: `Nível ${req.level}: escolha ASI ou talento` });
      }
    } else {
      const picks =
        state.asiOrFeatByLevel; // not used; feature-option lives in classFeatureChoices
      void picks;
      const chosen = state.classFeatureChoices[req.id] ?? [];
      if (chosen.length !== req.count) {
        unresolved.push({ level: req.level, kind: "feature-option", label: `Nível ${req.level}: ${req.featureName}` });
      }
    }
  }

  return unresolved;
}
```

> The `void picks` line is a deliberate no-op placeholder removed in Step 4 cleanup; see next step.

- [ ] **Step 4: Remove the dead placeholder lines**

Delete these two lines from the `feature-option` branch (they were only to illustrate the source of truth):

```ts
      const picks =
        state.asiOrFeatByLevel; // not used; feature-option lives in classFeatureChoices
      void picks;
```

The branch becomes:

```ts
    } else {
      const chosen = state.classFeatureChoices[req.id] ?? [];
      if (chosen.length !== req.count) {
        unresolved.push({ level: req.level, kind: "feature-option", label: `Nível ${req.level}: ${req.featureName}` });
      }
    }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/store/_tests_/levelChoiceResolver.test.ts`
Expected: PASS (all cases).

- [ ] **Step 6: Typecheck + lint + commit**

Run: `npx tsc --noEmit` and `npx eslint src/store/levelChoiceResolver.ts` → clean.

```bash
git add src/store/levelChoiceResolver.ts src/store/_tests_/levelChoiceResolver.test.ts
git commit -m "feat(store): level-choice resolver (asi bonuses, subclass features, pendings)"
```

---

## Task 9: Integrate the resolver into the derived sheet

**Files:**
- Modify: `src/store/characterSelectors.ts`
- Test: `src/store/_tests_/characterSelectors.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/store/_tests_/characterSelectors.test.ts`:

```ts
it("applies ASI bonuses to final attributes and recomputes HP", () => {
  const store = createCharacterStore();
  store.getState().selectClass("fighter-xphb"); // d10
  store.getState().setLevel(4);
  const before = selectCharacterSheetSummary(store.getState());

  store.getState().setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });
  const after = selectCharacterSheetSummary(store.getState());

  expect(after.finalAttributes.constituicao).toBe(before.finalAttributes.constituicao + 2);
  // +2 CON at level 4 = +1 modifier across 4 levels = +4 HP.
  expect(after.maxHp).toBe(before.maxHp + 4);
});

it("includes selected subclass features and reports level pendings", () => {
  const store = createCharacterStore();
  store.getState().selectClass("fighter-xphb");
  store.getState().setLevel(3);

  const pending = selectCharacterSheetSummary(store.getState());
  expect(pending.validationMessages.some((m) => /subclasse/i.test(m))).toBe(true);

  store.getState().selectSubclass("battle-master-xphb");
  const resolved = selectCharacterSheetSummary(store.getState());
  expect(resolved.features.some((f) => f.source === "class")).toBe(true);
  expect(resolved.validationMessages.some((m) => /subclasse/i.test(m))).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/store/_tests_/characterSelectors.test.ts -t "ASI bonuses"`
Expected: FAIL — ASI does not affect `finalAttributes` yet.

- [ ] **Step 3: Wire the resolver into the selector**

In `src/store/characterSelectors.ts`, add imports:

```ts
import {
  collectAsiBonuses,
  getActiveSubclassFeatures,
  getUnresolvedLevelChoices,
} from "@/src/store/levelChoiceResolver";
```

Replace the `finalAttributes` computation (currently `calculateFinalAttributes(state.baseAttributes, state.backgroundAbilityBonuses)`):

```ts
  const asiBonuses = collectAsiBonuses(state);
  const mergedBonuses = { ...state.backgroundAbilityBonuses };
  for (const [key, value] of Object.entries(asiBonuses)) {
    mergedBonuses[key as AttributeKey] =
      (mergedBonuses[key as AttributeKey] ?? 0) + (value ?? 0);
  }
  const finalAttributes = calculateFinalAttributes(state.baseAttributes, mergedBonuses);
```

> `AttributeKey` is already imported in this file (used elsewhere). If not, add `import type { AttributeKey } from "@/types/dnd";`.

Where `classFeaturesUpToLevel` is built (Task from the MVP), append subclass features to the `features` array. Find the `features` array construction and add a spread after the class features:

```ts
    ...getActiveSubclassFeatures(state, characterClass).map((f) => ({
      name: f.name,
      description: f.description ?? "",
      source: "class" as const,
    })),
```

> This requires `characterClass` to be defined (it is, earlier in the function via `getBuilderClasses().find(...)`). If `characterClass` may be `undefined`, guard: only spread when `characterClass` is truthy.

Append level pendings to `validationMessages`. Find the `validationMessages: getAllValidationMessages(state)` line and change it to:

```ts
    validationMessages: [
      ...getAllValidationMessages(state),
      ...(characterClass
        ? getUnresolvedLevelChoices(state, characterClass).map((u) => u.label)
        : []),
    ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/store/_tests_/characterSelectors.test.ts`
Expected: PASS (all, including the existing MVP tests).

- [ ] **Step 5: Full suite + typecheck + lint**

Run:
- `npx tsc --noEmit` → clean
- `npx eslint src/store/characterSelectors.ts` → clean
- `npx vitest run` → all green (the one pre-existing flaky `BuilderStepPanel › renders description as its own unlocked step` may still fail; confirm via `git stash` it is unrelated, do not treat as a regression).

- [ ] **Step 6: Commit**

```bash
git add src/store/characterSelectors.ts src/store/_tests_/characterSelectors.test.ts
git commit -m "feat(store): ASI bonuses, subclass features and level pendings in derived sheet"
```

---

## Self-Review Notes (already applied)

- **Spec coverage:** §2 (modules) → Tasks 3/4/8; §3 (data model + schema bump) → Task 6; §4 (classification + `grantsSubclass`) → Tasks 1/3; §5 (feat catalog + prereqs) → Tasks 4/5; §6 (resolver + selector integration) → Tasks 8/9; §7 (tests incl. migration) → Tasks 7/9 + per-task tests.
- **Type consistency:** `AsiOrFeatChoice`, `LevelChoiceRequirement`, `BuilderFeat`, `BuilderSubclass`, `UnresolvedChoice` are defined once and referenced consistently. Action names `selectSubclass` / `setLevelAsiOrFeat` match between the actions interface (Task 6 Step 4) and implementation (Task 6 Step 6) and usages (Tasks 8/9 tests).
- **Known assumption to verify during Task 3:** the `BuilderClass` property holding feature choice groups is `featureChoiceGroups` (confirm exact name in `types/builder.ts:173` area; adjust the `?? []` access if different).
- **ASI rule:** validation treats a valid ASI as totalling exactly 2 points (2024: +2 to one or +1 to two). Half-feat ASI is stored on the `feat`-mode choice's `asi` field.
