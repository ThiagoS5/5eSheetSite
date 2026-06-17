# Equipment Data Quality Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three display bugs in the Equipment screen: class gold tab shows generic label instead of the real GP value; gold-value items (like "15 GP included in kit A") render as "1× Gold" instead of "15 GP"; background items tab shows the full combined "Choose A or B…" string instead of a structured item list.

**Architecture:** All three bugs stem from incomplete data extraction in the 5etools adapter and an insufficient display branch in the component. Task 1 fixes the adapter for class gold. Task 2 adds a new extractor for background option-A items and a new `equipmentItemsA` field on `BuilderBackground`. Task 3 wires the new field into the component and fixes gold-entry rendering in the item list.

**Tech Stack:** TypeScript, React (TSX), Tailwind v4 (hex literals only), Vitest + Testing Library

---

## Current bugs (as shown in screenshots)

| Area | Current | Expected |
|------|---------|----------|
| Class — "Ouro Inicial" tab | "Ouro inicial" (generic label) | "75 GP" |
| Class — "Itens Oferecidos" list | `1× Gold` as a list item | `15 GP` inline in the list |
| Background — "Itens Oferecidos" panel | Full string "Choose A or B: (A)… or (B)…" | Structured list: Dagger, Disguise Kit…, 16 GP |

## Root causes

1. **Class gold tab:** `normalizeClass` reads `rawClass.startingEquipment?.goldAlternative` which is undefined for all XPHB classes. The actual gold amount is at `defaultData[0].B[0].value` (copper). No extractor for this exists yet.

2. **Gold item rendering:** The adapter creates a `BuilderEquipmentPackageItem` with `label:"Gold"` and `value:1500` for raw `{ "value": 1500 }` entries. The component renders every item as `N× label`, so gold shows as `1× Gold`.

3. **Background items tab:** `buildEquipmentSources` sets `items: []` for the background kit (Task 3 of previous plan left a `items: []` placeholder). With no items, the component falls back to `kit.summary` which is the full combined text from `extractEquipmentSummary(background.entries)`.

---

## File Map

| File | Change |
|------|--------|
| `src/adapters/fiveEToolsAdapter.ts` | Add `extractClassGoldAlternative()` + `extractBackgroundItemsA()`, wire both into their normalize functions |
| `types/builder.ts` | Add `equipmentItemsA?: BuilderEquipmentPackageItem[]` to `BuilderBackground` |
| `src/adapters/_tests_/fiveEToolsAdapter.test.ts` | Extend with tests for both new functions |
| `src/components/organisms/EquipmentChecklist.tsx` | Use `equipmentItemsA` for background kit; render gold-value items as "X GP" |
| `src/components/organisms/_tests_/EquipmentChecklist.test.tsx` | Add tests for gold-item rendering and background items list |

---

### Task 1: Fix class gold tab — extract gold from `defaultData.B`

**Files:**
- Modify: `src/adapters/fiveEToolsAdapter.ts`
- Test: `src/adapters/_tests_/fiveEToolsAdapter.test.ts`

**Context:** XPHB class raw data stores the gold alternative in `startingEquipment.defaultData[0].B`, e.g. `[{ "value": 7500 }]` (7500 cp = 75 GP). The `goldAlternative` string field is absent for all XPHB classes. `formatCopperAsGold` is a private function in the adapter at line 770: `String(value / 100).replace(/\.0$/, "")`.

- [ ] **Step 1: Write the failing tests**

Append to the existing `describe` block in `src/adapters/_tests_/fiveEToolsAdapter.test.ts`:

```ts
import { extractBackgroundGold, extractClassGoldAlternative } from "@/src/adapters/fiveEToolsAdapter";

describe("extractClassGoldAlternative", () => {
  it("returns GP string from B package copper value", () => {
    expect(extractClassGoldAlternative([{ B: [{ value: 7500 }] }])).toBe("75 GP");
  });

  it("returns empty string when defaultData is undefined", () => {
    expect(extractClassGoldAlternative(undefined)).toBe("");
  });

  it("returns empty string when no B package exists", () => {
    expect(extractClassGoldAlternative([{}])).toBe("");
    expect(extractClassGoldAlternative([{ A: [{ value: 1500 }] }])).toBe("");
  });

  it("sums multiple copper values in B package", () => {
    expect(extractClassGoldAlternative([{ B: [{ value: 5000 }, { value: 2500 }] }])).toBe("75 GP");
  });

  it("handles lowercase b key as fallback", () => {
    expect(extractClassGoldAlternative([{ b: [{ value: 10000 }] }])).toBe("100 GP");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts
```

Expected: FAIL — `extractClassGoldAlternative` is not exported.

- [ ] **Step 3: Add `extractClassGoldAlternative` after `extractBackgroundGold` in the adapter**

In `src/adapters/fiveEToolsAdapter.ts`, add after the `extractBackgroundGold` function (around line 402):

```ts
export function extractClassGoldAlternative(
  defaultData: Array<Record<string, Raw5eStartingEquipmentItem[]>> | undefined,
): string {
  const packages = defaultData?.[0];
  const bPackage = packages?.B ?? packages?.b;
  if (!bPackage) return "";
  const copper = bPackage.reduce((sum, item) => sum + (item.value ?? 0), 0);
  return copper > 0 ? `${formatCopperAsGold(copper)} GP` : "";
}
```

- [ ] **Step 4: Wire into `normalizeClass`**

In `normalizeClass` (around line 182–184), replace:

```ts
startingEquipmentGold: formatTaggedTextAsPlain(
  rawClass.startingEquipment?.goldAlternative ?? "",
),
```

With:

```ts
startingEquipmentGold: rawClass.startingEquipment?.goldAlternative
  ? formatTaggedTextAsPlain(rawClass.startingEquipment.goldAlternative)
  : extractClassGoldAlternative(rawClass.startingEquipment?.defaultData),
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts
```

Expected: all tests PASS (including the 6 existing `extractBackgroundGold` tests + 5 new tests).

- [ ] **Step 6: Run typecheck and full suite**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: no errors, 121+ tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/adapters/fiveEToolsAdapter.ts src/adapters/_tests_/fiveEToolsAdapter.test.ts
git commit -m "feat(adapter): extract class gold alternative from defaultData.B"
```

---

### Task 2: Add `equipmentItemsA` — extract structured background items from option A

**Files:**
- Modify: `types/builder.ts`
- Modify: `src/adapters/fiveEToolsAdapter.ts`
- Test: `src/adapters/_tests_/fiveEToolsAdapter.test.ts`

**Context:** 30 of the 131 backgrounds have `startingEquipment[0].a` with structured items. Example for "Aberrant Heir":
```json
"a": ["dagger|xphb", "disguise kit|xphb", "costume|xphb", "traveler's clothes|xphb", { "value": 1600 }]
```
Some backgrounds have object entries like `{ "item": "holy water|xphb", "displayName": "Holy Water (1 flask)" }` or `{ "equipmentType": "setGaming", "displayName": "Gaming Set" }`. Old-format backgrounds have no `startingEquipment[0].a` and will return `undefined` → no change.

The function uses `toTitleCase`, `toSlug`, and `toKebabCase`, which are private functions in the adapter (lines 624, 59, 630). Since this function lives in the same file, it can call them directly.

`BuilderEquipmentPackageItem` is already imported in the adapter (line 10).

- [ ] **Step 1: Add `equipmentItemsA` to `BuilderBackground` type**

In `types/builder.ts`, the `BuilderBackground` interface currently has:

```ts
  equipmentSummary: string;
  equipmentGold?: string;
  rewardSummary: string[];
```

Change to:

```ts
  equipmentSummary: string;
  equipmentGold?: string;
  equipmentItemsA?: BuilderEquipmentPackageItem[];
  rewardSummary: string[];
```

Also add the import for `BuilderEquipmentPackageItem` if it's not already imported at the top of the file. Check first — if `BuilderEquipmentPackageItem` is already defined in the same file (it is, at line ~112), no import is needed.

- [ ] **Step 2: Run typecheck to confirm interface change compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (field is optional).

- [ ] **Step 3: Write the failing tests**

Append to `src/adapters/_tests_/fiveEToolsAdapter.test.ts`:

```ts
import { extractBackgroundGold, extractClassGoldAlternative, extractBackgroundItemsA } from "@/src/adapters/fiveEToolsAdapter";

describe("extractBackgroundItemsA", () => {
  it("returns empty array when startingEquipment is undefined or missing a", () => {
    expect(extractBackgroundItemsA(undefined)).toEqual([]);
    expect(extractBackgroundItemsA([])).toEqual([]);
    expect(extractBackgroundItemsA([{ b: [] }])).toEqual([]);
  });

  it("parses string item references into title-cased items", () => {
    const result = extractBackgroundItemsA([{ a: ["dagger|xphb", "disguise kit|xphb"] }]);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ label: "Dagger", quantity: 1 });
    expect(result[1]).toMatchObject({ label: "Disguise Kit", quantity: 1 });
  });

  it("parses gold value objects as items with value field", () => {
    const result = extractBackgroundItemsA([{ a: [{ value: 1600 }] }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ label: "Gold", quantity: 1, value: 1600 });
  });

  it("uses displayName for object entries that provide it", () => {
    const result = extractBackgroundItemsA([{
      a: [{ item: "holy water|xphb", displayName: "Holy Water (1 flask)" }],
    }]);
    expect(result[0]?.label).toBe("Holy Water (1 flask)");
  });

  it("handles a full real-world option A (Aberrant Heir)", () => {
    const result = extractBackgroundItemsA([{
      a: [
        "dagger|xphb",
        "disguise kit|xphb",
        "costume|xphb",
        "traveler's clothes|xphb",
        { value: 1600 },
      ],
    }]);
    expect(result).toHaveLength(5);
    expect(result[4]).toMatchObject({ value: 1600 });
  });
});
```

- [ ] **Step 4: Run tests to confirm they fail**

```bash
npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts
```

Expected: FAIL — `extractBackgroundItemsA` is not exported.

- [ ] **Step 5: Implement `extractBackgroundItemsA` in the adapter**

In `src/adapters/fiveEToolsAdapter.ts`, add after `extractClassGoldAlternative`:

```ts
export function extractBackgroundItemsA(
  startingEquipment: unknown[] | undefined,
): BuilderEquipmentPackageItem[] {
  const first = (startingEquipment ?? [])[0];
  if (!first || typeof first !== "object") return [];
  const aArr = (first as Record<string, unknown>).a;
  if (!Array.isArray(aArr)) return [];

  return aArr.flatMap((entry, i): BuilderEquipmentPackageItem[] => {
    if (typeof entry === "string") {
      const name = toTitleCase(entry.split("|")[0] ?? "");
      if (!name) return [];
      return [{ id: toSlug(name, "xphb"), label: name, quantity: 1 }];
    }
    if (typeof entry === "object" && entry !== null) {
      const obj = entry as Record<string, unknown>;
      if (typeof obj.value === "number") {
        return [{ id: `gold-${i}`, label: "Gold", quantity: 1, value: obj.value }];
      }
      const label =
        typeof obj.displayName === "string"
          ? obj.displayName
          : typeof obj.item === "string"
          ? toTitleCase(obj.item.split("|")[0] ?? "")
          : null;
      if (!label) return [];
      const quantity = typeof obj.quantity === "number" ? obj.quantity : 1;
      const ref = typeof obj.item === "string" ? obj.item : null;
      return [{
        id: ref
          ? toSlug(toTitleCase(ref.split("|")[0] ?? label), "xphb")
          : toKebabCase(label),
        label,
        quantity,
      }];
    }
    return [];
  });
}
```

- [ ] **Step 6: Wire into `normalizeBackground`**

In `normalizeBackground` (around line 119), add `equipmentItemsA` to the return object:

```ts
equipmentSummary: formatTaggedTextAsPlain(extractEquipmentSummary(background.entries)),
equipmentGold: extractBackgroundGold(background.startingEquipment),
equipmentItemsA: extractBackgroundItemsA(background.startingEquipment),
```

- [ ] **Step 7: Run tests to confirm they pass**

```bash
npx vitest run src/adapters/_tests_/fiveEToolsAdapter.test.ts
```

Expected: all tests PASS.

- [ ] **Step 8: Run typecheck and full suite**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: no errors, all tests pass.

- [ ] **Step 9: Commit**

```bash
git add types/builder.ts src/adapters/fiveEToolsAdapter.ts src/adapters/_tests_/fiveEToolsAdapter.test.ts
git commit -m "feat(adapter): extract background option-A items into equipmentItemsA"
```

---

### Task 3: Component — use `equipmentItemsA` for background kit and render gold entries as "X GP"

**Files:**
- Modify: `src/components/organisms/EquipmentChecklist.tsx`
- Modify: `src/components/organisms/_tests_/EquipmentChecklist.test.tsx`

**Context:** After Tasks 1 and 2, the data layer is correct. This task updates the component to use it. Two changes:

1. **Background kit items:** Change `items: []` to `items: selectedBackground.equipmentItemsA ?? []`. Remove the now-stale comment about "no structured item data yet". When `equipmentItemsA` is `undefined` (old-format backgrounds), it stays `[]` and falls back to `kit.summary`.

2. **Gold-value item rendering:** Items with `item.value !== undefined` are pure gold entries (e.g. `{ label: "Gold", value: 1500 }`). Render them as `"15 GP"` instead of `"1× Gold"`. The `value` field on `BuilderEquipmentPackageItem` is ONLY set for raw gold entries — regular items (Greataxe, Dagger etc.) have `value: undefined`.

- [ ] **Step 1: Write the new tests first**

In `src/components/organisms/_tests_/EquipmentChecklist.test.tsx`, add to the existing `selectedClass` fixture a second package item with a gold value, then add 2 new tests. The existing fixture already has:

```ts
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
```

Change the `items` in the fixture to include a gold entry:

```ts
items: [
  { id: "studded-leather-armor-xphb", label: "Studded Leather Armor", quantity: 1 },
  { id: "dagger-xphb", label: "Dagger", quantity: 1 },
  { id: "gold-2", label: "Gold", quantity: 1, value: 1500 },
],
```

Then add new tests (keep the existing 2 tests intact):

```ts
it("renders a gold-value item as 'X GP' instead of quantity and label", () => {
  render(
    <EquipmentChecklist
      selectedClass={selectedClass}
      choicesBySource={{ class: { mode: "items", selectedOptionId: "A" } }}
      onSourceModeChange={vi.fn()}
      onSourceOptionChange={vi.fn()}
    />,
  );

  expect(screen.getByText("15 GP")).toBeInTheDocument();
  expect(screen.queryByText("Gold")).toBeNull();
  // The gold entry should not render as a quantity
  expect(screen.queryByText("1×")).toBeNull();
});

const selectedBackground: BuilderBackground = {
  id: "aberrant-heir-xphb",
  name: "Aberrant Heir",
  source: "XPHB",
  ruleset: "2024",
  summary: "Aberrant Heir background.",
  description: "Aberrant Heir description.",
  descriptionBlocks: [],
  abilityOptions: [],
  originFeat: "",
  skillProficiencies: [],
  toolProficiencies: [],
  languageChoiceCount: 0,
  equipmentSummary: "Choose A or B: (A) Dagger, 16 GP; or (B) 50 GP",
  equipmentGold: "50 GP",
  equipmentItemsA: [
    { id: "dagger-xphb", label: "Dagger", quantity: 1 },
    { id: "gold-4", label: "Gold", quantity: 1, value: 1600 },
  ],
  rewardSummary: [],
  detail: "",
};

it("renders background items from equipmentItemsA as a list", () => {
  render(
    <EquipmentChecklist
      selectedBackground={selectedBackground}
      choicesBySource={{ background: { mode: "items", selectedOptionId: "background-kit" } }}
      onSourceModeChange={vi.fn()}
      onSourceOptionChange={vi.fn()}
    />,
  );

  expect(screen.getByText("EQUIPAMENTO DO ANTECEDENTE")).toBeInTheDocument();
  expect(screen.getByText("Dagger")).toBeInTheDocument();
  expect(screen.getByText("16 GP")).toBeInTheDocument();
  // Must NOT show the old combined-text fallback
  expect(screen.queryByText(/Choose A or B/)).toBeNull();
});

it("falls back to equipmentSummary text for backgrounds without equipmentItemsA", () => {
  const bgNoItems: BuilderBackground = {
    ...selectedBackground,
    equipmentItemsA: undefined,
  };

  render(
    <EquipmentChecklist
      selectedBackground={bgNoItems}
      choicesBySource={{ background: { mode: "items", selectedOptionId: "background-kit" } }}
      onSourceModeChange={vi.fn()}
      onSourceOptionChange={vi.fn()}
    />,
  );

  expect(screen.getByText(/Choose A or B/)).toBeInTheDocument();
});
```

Note: `BuilderBackground` must be imported at the top. Add it to the existing import:
```ts
import type { BuilderClass, BuilderBackground } from "@/types/builder";
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/components/organisms/_tests_/EquipmentChecklist.test.tsx
```

Expected: 3 new tests FAIL (gold still renders as "1× Gold", background still shows combined text).

- [ ] **Step 3: Update `buildEquipmentSources` — wire background `equipmentItemsA`**

In `src/components/organisms/EquipmentChecklist.tsx`, in `buildEquipmentSources`, replace the background kit block (lines 62–78):

```tsx
if (selectedBackground?.equipmentSummary) {
  sources.push({
    key: "background",
    heading: "EQUIPAMENTO DO ANTECEDENTE",
    kits: [
      {
        id: "background-kit",
        label: "Itens do Antecedente",
        summary: selectedBackground.equipmentSummary,
        items: selectedBackground.equipmentItemsA ?? [],
      },
    ],
    goldLabel: selectedBackground.equipmentGold ?? "Ouro do antecedente",
  });
}
```

(Remove the two comment lines about "no structured item data yet".)

- [ ] **Step 4: Update item rendering — gold entries show as "X GP"**

In the items `<ul>`, replace the `<li>` content (lines 145–150):

```tsx
{kit.items.map((item) => (
  <li key={item.id} className="flex gap-2">
    {item.value !== undefined ? (
      <span className="text-white">{item.value / 100} GP</span>
    ) : (
      <>
        <span className="font-semibold text-white">{item.quantity}×</span>
        <span>{item.label}</span>
      </>
    )}
  </li>
))}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npx vitest run src/components/organisms/_tests_/EquipmentChecklist.test.tsx
```

Expected: all 5 tests PASS (2 existing + 3 new).

Note: if the existing test "renders class equipment items as a display list when mode is items" was checking for `Studded Leather Armor` and `Dagger` — those still render the same since they have no `value`. The test should still pass. The gold entry `1× Gold` assertion `expect(screen.queryByText("1×")).toBeNull()` will catch any regression.

- [ ] **Step 6: Run typecheck and full suite**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: no errors, all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/organisms/EquipmentChecklist.tsx \
        src/components/organisms/_tests_/EquipmentChecklist.test.tsx
git commit -m "feat(equipment): render gold entries as GP, use equipmentItemsA for background"
```

---

## Implementation Notes

- **`value` field on items:** Only set for pure gold entries (no `item` reference in raw data). Regular items (Greataxe, Dagger…) always have `value: undefined`. Safe to use as gold discriminator.
- **`formatCopperAsGold(N)` vs `N / 100`:** The adapter private `formatCopperAsGold` strips trailing `.0` (e.g. `"15"` not `"15.0"`). In the component, `item.value / 100` will be clean integers for all real data (multiples of 100 cp). `15 GP`, `16 GP`, `75 GP` all display correctly.
- **Background fallback:** Old-format backgrounds (131 of 131 without `startingEquipment[0].a`) will have `equipmentItemsA: undefined` → `items: []` → fallback to `kit.summary` text. Unchanged behavior for them.
- **Class gold tab:** After Task 1, `startingEquipmentGold` for Barbarian will be `"75 GP"`. The display already uses `selectedClass.startingEquipmentGold || "Ouro inicial"` so no component change needed.
- **Schema version:** No change — `equipmentItemsA` is adapter/UI data, not in persisted `CharacterBuild`.
- **`characterDerivedAdapter.ts`:** Do not touch.
