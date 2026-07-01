# Sheet Fixes + Money/Skills Features — Design Spec

**Date:** 2026-07-01
**Status:** Draft (pending user approval)
**Branch:** continues on `feat/crimson-sheet-redesign`
**Follows:** `2026-07-01-crimson-sheet-redesign-design.md`

A second batch on top of the crimson redesign: two equipment-builder bug fixes plus
four sheet features. Two features (money, skill override) change the persisted
`CharacterBuild` shape, so this bumps the schema **v4 → v5** with a migration
(per MANIFESTO: schema-version + migration whenever persisted shape changes).

## Locked decisions (from user)

1. **Money:** seed initial balance from the equipment "Ouro Inicial" choice; 5 D&D coins
   (PC/PP/PE/PO/PL = cobre/prata/electro/ouro/platina); each editable with +/-; persisted.
   Include a carrying-capacity ("carga") system.
2. **Skill editing:** a config toggle exposes both training level (none/proficient/expertise)
   **and** a manual override of the final modifier number.
3. **Tab panel height:** fixed max-height with internal scroll (no runtime measurement of the Codex).
4. **Equipment mode button:** selected = crimson; unselected = neutral.

---

## Item 1 — Equipment mode-button color (bug, `EquipmentChecklist.tsx`)

`ModeButton` active state uses `border-primary bg-primary text-foreground`. Change the active
style to the crimson tone (`border-brand-crimson-alt bg-brand-crimson-alt text-white`);
inactive stays neutral (`border-border bg-white/5 text-muted-foreground`). No logic change.

## Item 2 — Gold leaks into "Itens Oferecidos" (bug, `EquipmentChecklist.tsx`)

In "items" mode the list maps every `kit.items` entry and renders any with `item.value !== undefined`
as "N GP" — so the gold-only alternative (e.g. "50 GP") shows inside the offered-items list.

**Fix:** in "items" mode, render only physical items — filter out entries where
`item.value !== undefined` (those belong to "Ouro Inicial"). The gold alternative continues to
show only under the "Ouro Inicial" toggle. Update `EquipmentChecklist.test.tsx` to assert gold
entries are absent from the items list and present under gold mode.

## Item 3 — Fixed-height tab panel with internal scroll (`ContentTabs.tsx`)

The tab content region currently grows with its content. Give the content region a fixed
max-height aligned visually with the Codex column and scroll internally when it overflows.
Apply `max-h-[640px] overflow-y-auto` to the `role="tabpanel"` content container (640px matches
the Codex `hint-size` height used in the mock). The tab bar and filter bar stay fixed above the
scroll area. Keep the existing `focusRing` on the scroll container.

## Item 4 — Inventory filter by category (`ContentTabs.tsx`)

Replace the current Todos/Classe/Manual inventory filter with category-group chips backed by the
real `CatalogItem.category`. Because packs and kits are both catalogued as `Other Gear` (no finer
data), group into four user-facing buckets:

| Chip         | Matches `category`                                   |
|--------------|------------------------------------------------------|
| Todos        | (all)                                                |
| Armas        | `Weapon`                                             |
| Armaduras    | `Armor`                                              |
| Utilitários  | `Other Gear` (packs, kits, tools, focuses, gear)     |
| Mágicos      | `Ring` `Rod` `Scroll` `Staff` `Wand` `Wondrous` `Potion` |

This requires the sheet summary's equipment entries to carry their `category`. Extend
`selectCharacterSheetSummary`'s `selectedEquipment` mapping to include `category`
(already available on the source `CatalogItem`); add `category` to `BuilderEquipmentOption`.
Empty buckets show the existing dashed empty state.

## Item 5 — Money + carrying capacity (schema v5)

**Persisted shape (added to `CharacterBuildChoices`):**
```ts
export interface CoinPouch { pc: number; pp: number; pe: number; po: number; pl: number; }
// choices additions:
money: CoinPouch;        // default all 0
moneyTouched: boolean;   // default false
carriedLoadKg: number;   // default 0
```

**Seeding without fragile migration:** a pure util `deriveStartingGoldPo(state)` computes the
starting gold (in PO) from the equipment choices — sum the parsed gold amounts for any source
whose mode is `gold` (parse integer from the source `goldLabel`/option). The selector exposes
money as: **if `!moneyTouched`**, `po = deriveStartingGoldPo(state)` and the other four coins 0;
**else** the persisted `money`. The first manual +/- sets `moneyTouched = true` and writes the
edited pouch. Migration v4→v5 only injects defaults (`money` zeros, `moneyTouched: false`,
`carriedLoadKg: 0`, `skillModifierOverrides: {}`), so existing saves auto-display their derived
starting gold.

**Store actions:** `adjustCoin(kind: keyof CoinPouch, delta: number)` and
`setCoin(kind, value)` (clamp ≥ 0; both set `moneyTouched = true` and materialize the current
derived pouch first if untouched); `setCarriedLoadKg(value)`.

**Carrying capacity:** `summary.carry = { currentKg: carriedLoadKg, maxKg }` where
`maxKg = round(finalAttributes.forca * 7.5)` (5e STR×15 lb ≈ ×7.5 kg). Current load is
user-editable (no per-item weight data exists, so it is not auto-summed) via +/-.

**UI (`ContentTabs` inventory tab):** replace the three placeholder `MoneyCard`s with:
- Five coin cards (PL/PO/PE/PP/PC labels), each showing the value with − and + buttons
  (buttons `aria-label`ed, `focusRing`); editing calls `adjustCoin`.
- One carga card: `currentKg / maxKg kg` with − / + on current (`setCarriedLoadKg`).

`summary.money`/`summary.carry` replace the `—` placeholders from the previous batch.

## Item 6 — Skill config + description modal (`SkillsPanel.tsx`, schema v5)

**Persisted shape (added to `CharacterBuildChoices`):**
```ts
skillModifierOverrides: Record<string, number>; // skillName -> forced final modifier; default {}
```

**Selector:** `computeSkills` applies an override when present: if
`skillModifierOverrides[name]` is set, the skill's `modifier` becomes that value and a new
`isOverridden: boolean` flag is set on `SheetSkill`. Training level still drives the dot.

**Store actions:** `setSkillTraining(name, level)` (add if absent) and
`setSkillOverride(name, value | null)` (null clears).

**Skill descriptions:** add `src/data/skillDescriptions.ts` — a static PT-BR map of the 18
skills to short original summaries (our own wording; the governing ability + what the skill
covers). Not copied text.

**UI (`SkillsPanel`):**
- Panel header gains a gear toggle button (`aria-pressed`, `focusRing`) switching **edit mode**.
- **Default mode:** each skill label is underlined and is a button; clicking opens a
  `SkillDetailModal` (Radix, styled like `ItemDetailModal`) showing the skill name, governing
  ability, and description.
- **Edit mode:** each row shows a training cycle control (click cycles
  none → proficient → expertise) and a small numeric input bound to the override
  (empty input clears the override via `setSkillOverride(name, null)`). Overridden rows show a
  subtle marker.

`SkillsPanel` gains props to receive the store actions (or reads the store directly like
`ContentTabs`), keeping `CharacterSheetView` composition simple.

---

## Files touched (summary)

- `src/components/organisms/EquipmentChecklist.tsx` (+test) — items 1, 2.
- `src/types/characterBuild.ts` — schema v5, `CoinPouch`, new choice fields.
- `src/store/characterBuildModel.ts` / migration — v4→v5 defaults.
- `src/store/createCharacterStore.ts` (+ `characterStore.types.ts`) — coin/load/skill actions.
- `src/store/characterSelectors.ts` — money/carry/category/skill-override derivation.
- `types/builder.ts` — `BuilderEquipmentOption.category`, `CoinPouch`, `SheetSkill.isOverridden`,
  `summary.money`/`summary.carry` types.
- `src/components/molecules/sheet/ContentTabs.tsx` (+test) — items 3, 4, 5 (inventory).
- `src/components/molecules/sheet/SkillsPanel.tsx` (+test) — item 6.
- `src/components/organisms/sheet/SkillDetailModal.tsx` (+test) — new modal for item 6.
- `src/data/skillDescriptions.ts` (+test) — item 6 data.

## Testing

Vitest: equipment gold-filter + crimson active button; store migration v4→v5 defaults;
`deriveStartingGoldPo`; coin adjust/clamp + `moneyTouched` transition; carry max from STR;
skill override apply + clear; `SkillDetailModal` open/close; inventory category filter;
tab-panel scroll container present. Persisted-store round-trip test updated for v5.

## Risks / notes

- **No per-item weight data** → carga current load is manual, not auto-summed. Documented above.
- **Gold parsing** for seeding is heuristic (parses integers from gold labels); if a label lacks a
  number, seed 0. Non-destructive (money is editable).
- Schema migration must be covered by the persist round-trip test so old saves load cleanly.
