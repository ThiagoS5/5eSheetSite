# Equipment Tabs — Direct Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the double-selection layer on the Equipment screen so that clicking the "Itens Oferecidos" or "Ouro Inicial" tab is the selection — no secondary clickable kit cards.

**Architecture:** The `EquipmentChecklist` component currently renders clickable `<button>` kit cards inside the "items" panel. The fix replaces those with display-only content and adds an auto-select side-effect when the items tab is clicked. A minor adapter update extracts background gold from structured `startingEquipment` data for the few 2024-format backgrounds that have it.

**Tech Stack:** React (TSX), Tailwind v4 (hex literals only), Zustand store, Vitest + Testing Library

---

## File Map

| File | Change |
|------|--------|
| `types/builder.ts` | Add `equipmentGold?: string` to `BuilderBackground` |
| `src/adapters/fiveEToolsAdapter.ts` | Add `extractBackgroundGold()`, populate `equipmentGold` in `normalizeBackground` |
| `src/components/organisms/EquipmentChecklist.tsx` | Add `items` to kit interface, remove clickable cards, add auto-select on items tab click |
| `src/components/organisms/_tests_/EquipmentChecklist.test.tsx` | Rewrite both tests to match new behavior |

---

### Task 1: Add `equipmentGold` to `BuilderBackground` type

**Files:**
- Modify: `types/builder.ts` (line ~107)

- [ ] **Step 1: Add field to interface**

In `types/builder.ts`, `BuilderBackground` currently ends at:

```ts
  equipmentSummary: string;
  rewardSummary: string[];
  detail: string;
}
```

Change to:

```ts
  equipmentSummary: string;
  equipmentGold?: string;
  rewardSummary: string[];
  detail: string;
}
```

- [ ] **Step 2: Run typecheck to confirm no breakage**

```bash
npx tsc --noEmit
```

Expected: no errors (field is optional — all existing callers still compile).

- [ ] **Step 3: Commit**

```bash
git add types/builder.ts
git commit -m "feat(builder-types): add optional equipmentGold to BuilderBackground"
```

---

### Task 2: Extract background gold in the adapter

**Files:**
- Modify: `src/adapters/fiveEToolsAdapter.ts`

Background raw data can have structured `startingEquipment`:

```json
"startingEquipment": [
  {
    "a": ["dagger|xphb", ...],
    "b": [{ "value": 5000 }]
  }
]
```

`value` is in copper pieces (1 gp = 100 cp). Backgrounds WITHOUT the new format have no `startingEquipment[0].b`, so the function must be safe for `undefined`.

- [ ] **Step 1: Write the failing test for `extractBackgroundGold`**

This is a pure function — test it directly in isolation. Add a test block to `src/adapters/_tests_/fiveEToolsAdapter.test.ts` (or create that file if it doesn't exist — check with `ls src/adapters/_tests_/`). If tests for the adapter already exist, append to the existing `describe` block.

```ts
import { extractBackgroundGold } from "@/src/adapters/fiveEToolsAdapter";

describe("extractBackgroundGold", () => {
  it("returns formatted GP string when option b has a copper value", () => {
    const startingEquipment = [{ a: [], b: [{ value: 5000 }] }];
    expect(extractBackgroundGold(startingEquipment)).toBe("50 GP");
  });

  it("returns undefined when startingEquipment has no b entry", () => {
    expect(extractBackgroundGold(undefined)).toBeUndefined();
    expect(extractBackgroundGold([])).toBeUndefined();
    expect(extractBackgroundGold([{ a: [] }])).toBeUndefined();
  });

  it("returns undefined when b entry has no value", () => {
    expect(extractBackgroundGold([{ b: [{}] }])).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts
```

Expected: FAIL — `extractBackgroundGold` is not exported.

- [ ] **Step 3: Implement `extractBackgroundGold` and wire into `normalizeBackground`**

In `src/adapters/fiveEToolsAdapter.ts`, add after `extractEquipmentSummary`:

```ts
export function extractBackgroundGold(
  startingEquipment: unknown[] | undefined,
): string | undefined {
  const first = (startingEquipment ?? [])[0];
  if (!first || typeof first !== "object") return undefined;
  const bArr = (first as Record<string, unknown>).b;
  if (!Array.isArray(bArr) || !bArr[0]) return undefined;
  const copper = (bArr[0] as Record<string, unknown>).value;
  if (typeof copper !== "number") return undefined;
  return `${Math.round(copper / 100)} GP`;
}
```

In `normalizeBackground`, update the return object (currently line ~119):

```ts
equipmentSummary: formatTaggedTextAsPlain(extractEquipmentSummary(background.entries)),
equipmentGold: extractBackgroundGold(background.startingEquipment),
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 5: Run full test suite to catch regressions**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/adapters/fiveEToolsAdapter.ts src/adapters/_tests_/fiveEToolsAdapter.test.ts
git commit -m "feat(adapter): extract background gold from startingEquipment b option"
```

---

### Task 3: Rewrite EquipmentChecklist — remove clickable cards, add auto-select

**Files:**
- Modify: `src/components/organisms/EquipmentChecklist.tsx`

**Key changes:**
1. Add `items: BuilderEquipmentPackageItem[]` to `EquipmentSourceKit`
2. Pass `items` through in `buildEquipmentSources` (empty `[]` for background kit)
3. Use `selectedBackground.equipmentGold` as `goldLabel` when available
4. Items tab click: call both `onSourceModeChange` AND `onSourceOptionChange` for first kit
5. Replace clickable `<button>` cards with display-only content
6. Remove `CheckCircle2` import

- [ ] **Step 1: Update `EquipmentSourceKit` interface**

Replace:
```ts
interface EquipmentSourceKit {
  id: string;
  label: string;
  summary: string;
}
```

With:
```ts
interface EquipmentSourceKit {
  id: string;
  label: string;
  summary: string;
  items: BuilderEquipmentPackageItem[];
}
```

- [ ] **Step 2: Update `buildEquipmentSources` to pass items through**

Replace the class kit mapping:
```ts
kits: selectedClass.startingEquipmentPackages.map(
  (entry: BuilderEquipmentPackage) => ({
    id: entry.id,
    label: entry.label,
    summary: entry.summary,
  }),
),
```

With:
```ts
kits: selectedClass.startingEquipmentPackages.map(
  (entry: BuilderEquipmentPackage) => ({
    id: entry.id,
    label: entry.label,
    summary: entry.summary,
    items: entry.items,
  }),
),
```

Replace the background kit:
```ts
kits: [
  {
    id: "background-kit",
    label: "Itens do Antecedente",
    summary: selectedBackground.equipmentSummary,
  },
],
goldLabel: "Ouro do antecedente",
```

With:
```ts
kits: [
  {
    id: "background-kit",
    label: "Itens do Antecedente",
    summary: selectedBackground.equipmentSummary,
    items: [],
  },
],
goldLabel: selectedBackground.equipmentGold ?? "Ouro do antecedente",
```

- [ ] **Step 3: Update the items tab button to auto-select first kit**

Replace:
```tsx
<ModeButton
  active={mode === "items"}
  label="Itens Oferecidos"
  onClick={() => onSourceModeChange(source.key, "items")}
/>
```

With:
```tsx
<ModeButton
  active={mode === "items"}
  label="Itens Oferecidos"
  onClick={() => {
    onSourceModeChange(source.key, "items");
    if (source.kits[0]) onSourceOptionChange(source.key, source.kits[0].id);
  }}
/>
```

- [ ] **Step 4: Replace clickable kit buttons with display-only content**

Replace the entire `mode === "items"` block (currently lines 131–162):

```tsx
{mode === "items" ? (
  <div className="rounded-md border border-white/10 p-3">
    {source.kits.map((kit) => (
      <div key={kit.id}>
        {kit.items.length > 0 ? (
          <ul className="grid gap-1 text-sm text-[#b0b5cc]">
            {kit.items.map((item) => (
              <li key={item.id} className="flex gap-2">
                <span className="font-semibold text-white">{item.quantity}×</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#b0b5cc]">{kit.summary}</p>
        )}
      </div>
    ))}
  </div>
) : (
  <p className="rounded-md border border-[#f3c969]/20 bg-[#f3c969]/10 px-4 py-3 text-sm font-semibold text-[#f3c969]">
    {source.goldLabel}
  </p>
)}
```

- [ ] **Step 5: Remove `CheckCircle2` import**

Remove line 1:
```ts
import { CheckCircle2 } from "lucide-react";
```

- [ ] **Step 6: Run typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 4: Rewrite EquipmentChecklist tests

**Files:**
- Modify: `src/components/organisms/_tests_/EquipmentChecklist.test.tsx`

The existing two tests test the old behavior (clickable kit cards). Both must be rewritten.

**New behavior to test:**
1. When mode="items", item labels from `kit.items` are rendered as a list (not as buttons)
2. Clicking the "Itens Oferecidos" tab calls `onSourceOptionChange("class", "A")` in addition to `onSourceModeChange`

- [ ] **Step 1: Rewrite the test file**

Replace the full contents of `src/components/organisms/_tests_/EquipmentChecklist.test.tsx` with:

```tsx
/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EquipmentChecklist } from "@/src/components/organisms/EquipmentChecklist";
import type { BuilderClass } from "@/types/builder";

const selectedClass: BuilderClass = {
  id: "rogue-xphb",
  name: "Rogue",
  source: "XPHB",
  ruleset: "2024",
  level: 1,
  hitDie: 8,
  summary: "Rogue class summary.",
  description: "Rogue class description.",
  descriptionBlocks: [{ type: "paragraph", text: "Rogue class description." }],
  primaryAbility: ["Destreza"],
  savingThrows: ["Destreza", "Inteligencia"],
  armorProficiencies: ["light"],
  weaponProficiencies: ["simple", "martial weapons with finesse or light property"],
  toolProficiencies: ["Thieves' Tools"],
  progressionRows: [],
  skillChoices: { chooseFrom: [], count: 0 },
  languageChoiceCount: 0,
  featureChoiceGroups: [],
  levelOneFeatures: [],
  allFeatures: [],
  startingEquipment: [
    "Choose A or B: (A) Studded Leather Armor, Dagger, Thieves' Tools; or (B) 150 GP",
  ],
  startingEquipmentGold: "150 GP",
  startingEquipmentPackages: [
    {
      id: "A",
      label: "Option A",
      summary: "Studded Leather Armor, Dagger, Thieves' Tools",
      goldValue: 0,
      items: [
        { id: "studded-leather-armor-xphb", label: "Studded Leather Armor", quantity: 1 },
        { id: "dagger-xphb", label: "Dagger", quantity: 1 },
      ],
    },
  ],
  detail: "",
};

describe("EquipmentChecklist", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders class equipment items as a display list when mode is items", () => {
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
        onSourceModeChange={vi.fn()}
        onSourceOptionChange={vi.fn()}
      />,
    );

    expect(screen.getByText("EQUIPAMENTO DA CLASSE")).toBeInTheDocument();
    expect(screen.getByText("Studded Leather Armor")).toBeInTheDocument();
    expect(screen.getByText("Dagger")).toBeInTheDocument();
    // Items are rendered as list elements, not clickable buttons
    expect(screen.queryByRole("button", { name: /Option A/i })).toBeNull();
  });

  it("clicking Itens Oferecidos tab calls both onSourceModeChange and onSourceOptionChange with first kit", () => {
    const onSourceModeChange = vi.fn();
    const onSourceOptionChange = vi.fn();
    render(
      <EquipmentChecklist
        selectedClass={selectedClass}
        choicesBySource={{ class: { mode: "gold", selectedOptionId: null } }}
        onSourceModeChange={onSourceModeChange}
        onSourceOptionChange={onSourceOptionChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Itens Oferecidos/i }));

    expect(onSourceModeChange).toHaveBeenCalledWith("class", "items");
    expect(onSourceOptionChange).toHaveBeenCalledWith("class", "A");
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail** (before implementing — confirms tests check real behavior)

```bash
npx vitest run src/components/organisms/_tests_/EquipmentChecklist.test.tsx
```

Expected: Test 1 FAIL (items still render as buttons in current code), Test 2 FAIL (`onSourceOptionChange` not called on tab click).

- [ ] **Step 3: Apply Task 3 changes** (if not already done — tasks 3 and 4 run together)

If Task 3 was done first, skip this step.

- [ ] **Step 4: Run the new tests to verify they pass**

```bash
npx vitest run src/components/organisms/_tests_/EquipmentChecklist.test.tsx
```

Expected: both tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 6: Commit Tasks 3 and 4 together**

```bash
git add src/components/organisms/EquipmentChecklist.tsx \
        src/components/organisms/_tests_/EquipmentChecklist.test.tsx
git commit -m "feat(equipment): tabs as direct selection, display-only item list"
```

---

## Implementation Notes

- **Background gold fallback:** `selectedBackground.equipmentGold` is `undefined` for the 131 non-2024 backgrounds — `?? "Ouro do antecedente"` handles this transparently.
- **Single kit assumption:** Both class and background currently produce exactly one kit per source. The display loops over `source.kits` for correctness, but the visual result for a single-kit source is a flat list.
- **Store not touched:** `setEquipmentSourceMode` in `createCharacterStore.ts` is NOT changed. Auto-selection happens at the component level only.
- **No new components:** `ModeButton` stays as is; the items tab `onClick` grows an additional side-effect inline.
- **`characterDerivedAdapter.ts` NOT touched:** per spec constraint — only presentation layer changes.
- **Schema version NOT changed:** `BuilderBackground.equipmentGold` is a UI-only field, not part of `CharacterBuild` persisted state.
