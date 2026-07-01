# Sheet Fixes + Money/Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fix two equipment-builder bugs and add four sheet features (fixed-height tabs, inventory category filter, money+carga, skill config+description modal) on top of the crimson redesign.

**Architecture:** Bugs are local to `EquipmentChecklist`. Features extend the persisted `CharacterBuild` (schema **v4→v5**) with a coin pouch, carried-load, and skill overrides, surfaced through `selectCharacterSheetSummary` and rendered in `ContentTabs` (inventory) and `SkillsPanel`. The store uses a flat-state pattern (`FlatCharacterBuilderState` ↔ `CharacterBuild`); new persisted fields get defaults in `getDefaultFlatState`, are mapped in `flattenCharacterBuild`/`normalizeFlatState`/`createBuildFromFlatState`, so pre-v5 saves load with defaults (the migration).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Zustand, Radix dialog, Vitest + @testing-library/react.

## Global Constraints

- **Schema:** bump `CHARACTER_BUILD_SCHEMA_VERSION` to `5`. New persisted fields on `CharacterBuildChoices`: `money: CoinPouch`, `moneyTouched: boolean`, `carriedLoadKg: number`, `skillModifierOverrides: Record<string, number>`. Old saves must load cleanly (defaults). Cover with the persist round-trip test.
- **Coins:** exactly five — `pc, pp, pe, po, pl` (cobre, prata, electro, ouro, platina). Values clamp `>= 0`.
- **No `app/globals.css` edits.** Crimson tokens already exist.
- **Wire only real data / no fabrication:** carga current load is user-manual (no per-item weights); money seeded from equipment gold via `moneyTouched` gate.
- **Accessibility:** `focusRing` on hand-rolled interactive elements; `aria-hidden` on decorative icons; +/- buttons get `aria-label`; skill labels that open the modal are `<button>`s.
- **Language:** all user-facing copy pt-BR. Skill descriptions are original wording (not copied from any source text).
- **Tests** live in `_tests_/` (single underscores). Run one file: `npx vitest run <path>`. Because a stray `.claude/worktrees/*` copy pollutes broad globs, verify with narrow paths (e.g. `npx vitest run src/store`).

---

### Task 1: Equipment fixes — crimson active button + gold no longer leaks into items

**Files:**
- Modify: `src/components/organisms/EquipmentChecklist.tsx`
- Test: `src/components/organisms/_tests_/EquipmentChecklist.test.tsx`

**Change A (item 1):** in `ModeButton`, change the active branch from
`"border-primary bg-primary text-foreground"` to
`"border-brand-crimson-alt bg-brand-crimson-alt text-white"`. Inactive branch unchanged.

**Change B (item 2):** in the "items" mode list, render only physical items. Where the code maps
`kit.items`, filter out gold entries first:
```tsx
{kit.items.filter((item) => item.value === undefined).length > 0 ? (
  <ul className="grid gap-1 text-base text-subdued">
    {kit.items
      .filter((item) => item.value === undefined)
      .map((item, index) => (
        <li key={`${kit.id}-${item.id}-${index}`} className="flex gap-2">
          <span className="font-semibold text-foreground">{item.quantity}×</span>
          <span>{item.label}</span>
        </li>
      ))}
  </ul>
) : (
  /* keep the existing summary-fallback <ul> unchanged */
)}
```
(The gold alternative still renders under the "Ouro Inicial" toggle via the existing `mode === "gold"` branch.)

- [ ] **Step 1: Write/extend the failing test** — add cases: (a) in items mode, a kit containing a `{ value: 5000 }` gold entry does NOT render "50 GP" in the items list; (b) switching to gold mode renders the gold text; (c) the active mode button has the `bg-brand-crimson-alt` class and the inactive one does not.
- [ ] **Step 2: Run test, verify it fails** — `npx vitest run src/components/organisms/_tests_/EquipmentChecklist.test.tsx`
- [ ] **Step 3: Apply Change A and Change B.**
- [ ] **Step 4: Run test, verify pass.**
- [ ] **Step 5: Commit** — `fix(builder): crimson active equipment toggle + keep gold out of items list`

---

### Task 2: Schema v5 — persisted money/carga/skill-override fields + migration

**Files:**
- Modify: `src/types/characterBuild.ts`
- Modify: `src/store/characterStore.types.ts` (add fields to `FlatCharacterBuilderState`)
- Modify: `src/store/characterBuildModel.ts` (defaults, flatten, normalize, build mapping)
- Test: `src/store/_tests_/characterStore.persist.test.ts` (extend), and a new
  `src/store/_tests_/schemaV5Migration.test.ts`

**Interfaces (produced):**
```ts
// characterBuild.ts
export interface CoinPouch { pc: number; pp: number; pe: number; po: number; pl: number; }
export const EMPTY_COIN_POUCH: CoinPouch = { pc: 0, pp: 0, pe: 0, po: 0, pl: 0 };
export const CHARACTER_BUILD_SCHEMA_VERSION = 5;
// added to CharacterBuildChoices:
money: CoinPouch;
moneyTouched: boolean;
carriedLoadKg: number;
skillModifierOverrides: Record<string, number>;
```

**Migration mechanics (flat-state pattern):**
- `getDefaultFlatState()` adds: `money: { ...EMPTY_COIN_POUCH }`, `moneyTouched: false`, `carriedLoadKg: 0`, `skillModifierOverrides: {}`.
- `FlatCharacterBuilderState` (in `characterStore.types.ts`) adds the four fields with the same types.
- `flattenCharacterBuild` reads them from `build.choices?.money` etc. (undefined for pre-v5 saves).
- `normalizeFlatState` falls back to defaults when undefined (so pre-v5 saves get defaults).
- `createBuildFromFlatState` writes the four fields into the `choices` block.

- [ ] **Step 1: Write failing tests** — (a) `schemaV5Migration.test.ts`: `normalizeCharacterBuild` on a v4-shaped build (no money fields) returns a build whose `exportMetadata.schemaVersion === 5` and `choices.money` deep-equals `EMPTY_COIN_POUCH`, `moneyTouched === false`, `carriedLoadKg === 0`, `skillModifierOverrides` deep-equals `{}`. (b) persist round-trip: a build with `money.po = 42`, `moneyTouched: true`, `carriedLoadKg: 3`, `skillModifierOverrides: { Arcana: 9 }` survives `createStoreStateFromBuild`→`createCharacterBuildFromFlatState` unchanged.
- [ ] **Step 2: Run tests, verify they fail** — `npx vitest run src/store/_tests_/schemaV5Migration.test.ts`
- [ ] **Step 3: Implement the type + model changes** per the mechanics above. Read each file first; make the minimal additions following the existing field patterns (each new field mirrors how e.g. `skillTraining` is threaded through all four functions).
- [ ] **Step 4: Run the store test suite** — `npx vitest run src/store` — all pass.
- [ ] **Step 5: Commit** — `feat(store): schema v5 — coin pouch, carried load, skill overrides`

---

### Task 3: Store actions — coins, carried load, skill training + override

**Files:**
- Modify: `src/store/createCharacterStore.ts` (add actions), `src/store/characterStore.types.ts` (action signatures on the store interface)
- Test: `src/store/_tests_/characterStore.test.ts` (extend)

**Interfaces (produced) — action signatures:**
```ts
adjustCoin(kind: keyof CoinPouch, delta: number): void; // clamps >=0; sets moneyTouched=true; if untouched, first materialize the derived starting pouch
setCoin(kind: keyof CoinPouch, value: number): void;    // clamps >=0; sets moneyTouched=true (materialize as above)
setCarriedLoadKg(value: number): void;                  // clamps >=0
setSkillTraining(skillName: string, level: SkillTrainingLevel): void; // add if not already present
setSkillOverride(skillName: string, value: number | null): void;      // null deletes the key
```
`adjustCoin`/`setCoin` "materialize" means: when `moneyTouched` is false, seed `money` from `deriveStartingGoldPo(state)` (Task 4) into `po` before applying the edit, then set `moneyTouched=true`. If `deriveStartingGoldPo` isn't available yet at this task's time, seed from the current `summary.money` computed by the selector. (Task 4 lands the derivation; keep this action logic reading through the selector-provided starting pouch to avoid duplication.)

- [ ] **Step 1: Write failing tests** — (a) `adjustCoin("po", 5)` on an untouched pouch with class gold "50 GP" yields `po === 55` and `moneyTouched === true`; (b) `adjustCoin("po", -1000)` clamps to 0; (c) `setCarriedLoadKg(-3)` clamps to 0; (d) `setSkillOverride("Arcana", 9)` then `setSkillOverride("Arcana", null)` removes the key; (e) `setSkillTraining("Stealth", "expertise")` persists.
- [ ] **Step 2: Run tests, verify fail** — `npx vitest run src/store/_tests_/characterStore.test.ts`
- [ ] **Step 3: Implement actions**, following the existing action patterns in `createCharacterStore.ts` (read it first; each mutator rebuilds the flat state then re-derives via the existing helper, exactly like `setSkillTraining`-style mutators already there — if `setSkillTraining` doesn't exist, model the new ones on the closest existing mutator such as the equipment-choice setters).
- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Commit** — `feat(store): coin, carried-load, and skill training/override actions`

---

### Task 4: Selector — money/carry/category/skill-override derivation

**Files:**
- Modify: `src/store/characterSelectors.ts`, `types/builder.ts`
- Test: `src/store/_tests_/characterSelectors*.test.ts` (add a focused test file `characterSelectors.money.test.ts`)

**Interfaces (produced):**
```ts
// types/builder.ts
export interface CoinPouchView { pc: number; pp: number; pe: number; po: number; pl: number; }
// BuilderEquipmentOption gains:
category: ItemCategory;
// SheetSkill gains:
isOverridden: boolean;
// CharacterSheetSummary gains (replacing the previous absence):
money: CoinPouchView;
carry: { currentKg: number; maxKg: number };
```
```ts
// characterSelectors.ts — new exported pure util
export function deriveStartingGoldPo(state: CharacterBuilderState): number;
// sums parsed integer gold (in PO) from each equipment source whose choice.mode === "gold",
// parsing the leading integer out of the source goldLabel; non-numeric -> 0.
```

**Derivation rules:**
- `selectedEquipment` mapping adds `category: item.category` (from the source `CatalogItem`).
- `money`: if `!state.moneyTouched`, return `{ ...EMPTY_COIN_POUCH, po: deriveStartingGoldPo(state) }`; else return `state.money`.
- `carry`: `{ currentKg: state.carriedLoadKg, maxKg: Math.round(finalAttributes.forca * 7.5) }`.
- In `computeSkills`, after computing `modifier`, if `skillModifierOverrides[name]` is a number, set `modifier` to it and `isOverridden = true`, else `isOverridden = false`.

- [ ] **Step 1: Write failing tests** — (a) with class equipment mode `gold` and gold label "50 GP" and `moneyTouched=false`, `summary.money.po === 50` and other coins 0; (b) with `moneyTouched=true` and `money.po=7`, `summary.money.po === 7`; (c) `summary.carry.maxKg === round(forca*7.5)`; (d) a skill with `skillModifierOverrides` set reports that modifier and `isOverridden===true`; (e) `selectedEquipment[0].category` is populated.
- [ ] **Step 2: Run tests, verify fail.**
- [ ] **Step 3: Implement** the type additions and selector logic. Read `characterSelectors.ts` first; extend the existing `selectedEquipment`, `computeSkills`, and the summary return object.
- [ ] **Step 4: Run** `npx vitest run src/store` — all pass (also confirms no existing selector test broke).
- [ ] **Step 5: Commit** — `feat(store): derive money, carry, item category, and skill overrides`

---

### Task 5: ContentTabs — fixed-height scroll, category filter, money + carga UI

**Files:**
- Modify: `src/components/molecules/sheet/ContentTabs.tsx`
- Test: `src/components/molecules/sheet/_tests_/ContentTabs.test.tsx` (extend)

**Item 3 — fixed height:** add `max-h-[640px] overflow-y-auto` (and keep `focusRing`) to the
`role="tabpanel"` content container so it scrolls internally; the tab bar and filter bar stay outside the scroll area.

**Item 4 — category filter:** replace the `InvFilter` (all/class/manual) with category buckets:
```ts
type InvFilter = "all" | "weapons" | "armor" | "utility" | "magic";
const INV_FILTERS = [
  { id: "all",     label: "Todos" },
  { id: "weapons", label: "Armas" },
  { id: "armor",   label: "Armaduras" },
  { id: "utility", label: "Utilitários" },
  { id: "magic",   label: "Mágicos" },
] as const;
const MAGIC_CATS = new Set(["Ring","Rod","Scroll","Staff","Wand","Wondrous","Potion"]);
function matchInv(cat: ItemCategory, f: InvFilter): boolean {
  if (f === "all") return true;
  if (f === "weapons") return cat === "Weapon";
  if (f === "armor") return cat === "Armor";
  if (f === "utility") return cat === "Other Gear";
  return MAGIC_CATS.has(cat);
}
```
Filter `summary.selectedEquipment` with `matchInv(item.category, invFilter)`. Keep the dashed empty state per bucket.

**Item 5 — money + carga cards:** replace the three placeholder `MoneyCard`s. Read the store actions
(`adjustCoin`, `setCoin`, `setCarriedLoadKg`) and `summary.money` / `summary.carry`. Render:
- Five coin cards (label order PL, PO, PE, PP, PC). Each: value (serif) + a `−` and `+` button
  (`aria-label={"Reduzir "+label}` / `"Aumentar "+label}`, `focusRing`, `type="button"`) calling
  `adjustCoin(kind, -1)` / `adjustCoin(kind, +1)`.
- One carga card: `{currentKg} / {maxKg} kg` with `−`/`+` calling `setCarriedLoadKg(current-1)` / `(current+1)` (clamped in the store).

Coin card component (add near `MoneyCard`, then remove `MoneyCard`):
```tsx
function CoinCard({ label, value, onDec, onInc }: { label: string; value: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="flex flex-1 basis-[90px] flex-col items-center gap-[3px] rounded-[10px] border border-border bg-surface-nested p-[11px]">
      <span className="font-serif text-xl font-extrabold text-foreground">{value}</span>
      <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-1">
        <button type="button" aria-label={`Reduzir ${label}`} onClick={onDec} className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}>−</button>
        <button type="button" aria-label={`Aumentar ${label}`} onClick={onInc} className={cn("h-6 w-6 rounded-md border border-border text-muted-foreground hover:text-foreground", focusRing)}>+</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 1: Extend the test** — (a) tabpanel container has `overflow-y-auto`; (b) inventory shows five coin labels (PL/PO/PE/PP/PC) and a carga card; (c) clicking a coin `+` calls the store (mock the store like the existing test does and assert `adjustCoin` called with `("po", 1)`); (d) the "Armas" inventory filter shows only `Weapon`-category items. Extend the existing store mock to provide `money`, `carry`, and the new actions, and give `selectedEquipment` items a `category`.
- [ ] **Step 2: Run test, verify fail** — `npx vitest run src/components/molecules/sheet/_tests_/ContentTabs.test.tsx`
- [ ] **Step 3: Implement** items 3, 4, 5.
- [ ] **Step 4: Run test, verify pass.**
- [ ] **Step 5: Commit** — `feat(sheet): fixed-height tabs, inventory category filter, editable money + carga`

---

### Task 6: Skill descriptions data

**Files:**
- Create: `src/data/skillDescriptions.ts`
- Test: `src/data/_tests_/skillDescriptions.test.ts`

**Produces:** `export const SKILL_DESCRIPTIONS: Record<string, { ability: string; text: string }>` keyed by
the same English skill names used in `characterSelectors` (`"Acrobatics"`, `"Animal Handling"`, `"Arcana"`,
`"Athletics"`, `"Deception"`, `"History"`, `"Insight"`, `"Intimidation"`, `"Investigation"`, `"Medicine"`,
`"Nature"`, `"Perception"`, `"Performance"`, `"Persuasion"`, `"Religion"`, `"Sleight of Hand"`, `"Stealth"`,
`"Survival"`), each with its governing ability (pt-BR, e.g. "Destreza") and a 1–2 sentence **original** pt-BR
summary of what the skill covers. Do not copy wording from any rulebook — describe in your own words.

- [ ] **Step 1: Write failing test** — assert the map has all 18 keys and each entry has a non-empty `ability` and `text`.
- [ ] **Step 2: Run test, verify fail** — `npx vitest run src/data/_tests_/skillDescriptions.test.ts`
- [ ] **Step 3: Implement** the map with original pt-BR summaries.
- [ ] **Step 4: Run test, verify pass.**
- [ ] **Step 5: Commit** — `feat(sheet): add pt-BR skill descriptions catalog`

---

### Task 7: SkillDetailModal

**Files:**
- Create: `src/components/organisms/sheet/SkillDetailModal.tsx`
- Test: `src/components/organisms/sheet/_tests_/SkillDetailModal.test.tsx`

**Produces:** `SkillDetailModal({ skillName, onClose }: { skillName: string | null; onClose: () => void })` —
Radix dialog styled like `ItemDetailModal` (read it for the pattern). Open iff `skillName != null`. Looks up
`SKILL_DESCRIPTIONS[skillName]` (plus a pt-BR display label — reuse the `SKILL_DISPLAY` mapping approach; accept a
`label` prop `{ skillName, label, onClose }` so the caller passes the localized label). Header shows the label +
governing ability kicker; body shows the description. Close button `aria-label="Fechar"`, visible focus ring.
Renders nothing when `skillName`/entry is null.

- [ ] **Step 1: Write failing test** — null → no dialog; open with `skillName="Arcana"` → dialog shows the ability + description text; close button fires `onClose`.
- [ ] **Step 2: Run test, verify fail.**
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run test, verify pass.**
- [ ] **Step 5: Commit** — `feat(sheet): add SkillDetailModal`

---

### Task 8: SkillsPanel — config edit mode + description modal

**Files:**
- Modify: `src/components/molecules/sheet/SkillsPanel.tsx`
- Test: `src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx` (extend)

**Behavior:**
- `SkillsPanel` reads the store (like `ContentTabs`) for `setSkillTraining` and `setSkillOverride`, or accepts
  them as props from `CharacterSheetView` — choose the store-read approach for consistency with `ContentTabs`.
- Header gains a gear toggle button (`aria-pressed={editMode}`, `aria-label="Configurar perícias"`, `focusRing`).
- **Default mode:** each skill label becomes a `<button>` with `underline` styling that sets the open
  `skillName` state → renders `SkillDetailModal` (pass localized label). Dot + modifier unchanged.
- **Edit mode:** each row shows (instead of the static dot) a training cycle control — a `<button>` cycling
  `none → proficient → expertise → none` calling `setSkillTraining(skill.name, next)`; and a small numeric
  `<input type="number">` (`aria-label={"Ajustar "+label}`) bound to the override: on change, empty →
  `setSkillOverride(name, null)`, numeric → `setSkillOverride(name, value)`. Rows where `skill.isOverridden`
  show a subtle marker (e.g. a dot or asterisk with an sr-only "valor ajustado").
- Keep the existing grouping-by-attribute and empty-group filtering.

- [ ] **Step 1: Extend the test** — (a) clicking a skill label opens the modal (assert dialog + description visible); (b) toggling the gear reveals training-cycle buttons and number inputs; (c) clicking the training cycle calls `setSkillTraining` with the next level; (d) typing in the override input calls `setSkillOverride(name, value)`, clearing it calls `setSkillOverride(name, null)`. Mock the store actions.
- [ ] **Step 2: Run test, verify fail** — `npx vitest run src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx`
- [ ] **Step 3: Implement.** (Add a `SKILL_DISPLAY`-style localized-label lookup or reuse the label already on `SheetSkill`.)
- [ ] **Step 4: Run test, verify pass.**
- [ ] **Step 5: Commit** — `feat(sheet): skill config edit mode + description modal in SkillsPanel`

---

### Task 9: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Narrow test gates** — `npx vitest run src/store src/components src/data` — all pass (avoids the stray `.claude/worktrees` glob pollution).
- [ ] **Step 2: Typecheck + lint** — `npm run typecheck` (clean); `npm run lint` (no new errors in real source).
- [ ] **Step 3: Browser check** — start `next-dev`; on `/sheet`: inventory tab shows five editable coin cards + carga; clicking `+`/`−` updates values; category filter narrows items; the tab panel scrolls internally at `max-h-[640px]`. Perícias: gear toggles edit mode (training cycle + override input work); clicking a skill label opens the description modal. Check `preview_console_logs` (error) = none. On `/builder/equipamento`: selected mode button is crimson; gold no longer appears in the items list.
- [ ] **Step 4: Commit any browser fixes** — `fix(sheet): browser parity for money/skill features` (only if needed).

---

## Self-Review

**Spec coverage:** item 1 → Task 1A; item 2 → Task 1B; item 3 → Task 5; item 4 → Tasks 4+5; item 5 (money+carga) → Tasks 2+3+4+5; item 6 (skill config+modal) → Tasks 2+3+4+6+7+8. ✅
**Placeholder scan:** greenfield pieces (skill data, SkillDetailModal, CoinCard) have concrete code; existing-file edits give exact types, test cases, and edit locations with instruction to read the file first. No TBD/TODO. ✅
**Type consistency:** `CoinPouch`/`EMPTY_COIN_POUCH` (Task 2) consumed by Tasks 3/4/5; `deriveStartingGoldPo` (Task 4) referenced by Task 3's materialize note (ordering: Task 3 reads the selector-provided pouch so it doesn't hard-depend on Task 4's util pre-landing — if built strictly in order, Task 3 seeds via the selector's `summary.money`); `summary.money`/`summary.carry`/`SheetSkill.isOverridden`/`BuilderEquipmentOption.category` (Task 4) consumed by Tasks 5/8; `SKILL_DESCRIPTIONS` (Task 6) consumed by Task 7; `SkillDetailModal` (Task 7) consumed by Task 8. ✅
**Ordering note:** Tasks 2→3→4 (schema→actions→selector) must precede UI Tasks 5 and 8. Task 3's coin-seeding reads the selector-computed starting pouch to avoid a hard dependency on Task 4 landing first; if the implementer finds the selector money field not yet present when building Task 3, seed `po` from `deriveStartingGoldPo` inline and note it for Task 4 to converge.
