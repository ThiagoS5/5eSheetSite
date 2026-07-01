# Crimson Sheet Redesign — Design Spec

**Date:** 2026-07-01
**Status:** Approved (design), pending implementation plan
**Source design:** `Tela de Conclusão.dc.html` (claude_design export, "D&D 5e Sheet Redesign")

## Goal

Replace the character sheet **and** the builder's "Conclusão" step with the crimson
redesign from the claude_design mock, matching the zip's visual **on both desktop and
mobile**, without losing existing functionality.

Both surfaces render through the single `CharacterSheetView` component (the `/sheet` page
via `CharacterSheetPage`, and the builder conclusion via `BuilderStepPanel` with
`embedded`), so rebuilding `CharacterSheetView` and its children covers both.

## Scope decisions (locked with user)

1. **Design "tweaks" are NOT exposed.** The mock has configurable props (accentTheme,
   layoutDensity, originColorCoding). We hardcode the zip default: **crimson + compacta +
   origin color-coding on**. No new user-facing controls. (YAGNI.)
2. **Level-up: keep the existing `LevelUpFlow`.** The mock's single-screen level-up modal
   is illustrative only. We preserve the real multi-step flow and only restyle the trigger
   button to the crimson pill. No level-up logic changes.
3. **Detail modal: include it, wired to real data.** New `ItemDetailModal` opens from
   Ações/Inventário and binds to `selectCharacterSheetSummary` data.
4. **Data gap → visual fidelity, wire only real data.** The mock is populated with rich
   sample data (spell catalog, spell DC/attack, item cost/weight, gold, carry, weapon
   damage) that the app's selector does **not** compute today. We rebuild the exact
   layout + crimson theme, bind tabs/modal to what the selector actually provides, and use
   **graceful empty/placeholder states** where no real data exists. We do **not** fabricate
   a spell system, item prices, money, or carry. This respects the MANIFESTO's
   single-derived-truth rule.

## Non-goals

- No changes to `selectCharacterSheetSummary`'s core computations or the persisted
  `CharacterBuild` schema (no migration needed).
- No new spell/money/carry/weapon-damage data systems (that would be a separate data
  project — the "full parity" option was declined).
- No exposure of theme/density/color toggles.

## Architecture & data flow

Unchanged one-way flow: `selectCharacterSheetSummary(state)` → `CharacterSheetView` →
children. New interaction state (active tab, per-tab filter, open detail item) stays local
to the component that owns it, as `ContentTabs` already does. No new global store slices.

## Theme (crimson, scoped)

The sheet root wrapper sets `--primary` and `--brand-crimson-alt` to the design's crimson
oklch values (mirroring the mock's `cardThemeVars`):

```
--primary: oklch(0.59 0.23 27);
--brand-crimson-alt: oklch(0.53 0.2 28);
```

Scoping the override to the sheet root makes the sheet pixel-identical to the zip while
leaving the rest of the app (builder wizard chrome) visually untouched. Do **not** edit
global tokens in `app/globals.css`.

Origin color-coding is hardcoded (matches the mock's `originColor`):

| selector `source` | mock origin | color token          |
|-------------------|-------------|----------------------|
| `class`           | classe      | `--brand-gold-alt`   |
| `species`         | espécie     | `--brand-green`      |
| `background`      | antecedente | `--brand-blue`       |

## Desktop layout (mock 3a) — three stacked regions

1. **Hero block** (centered, radial-gradient bg, `--surface-nested`):
   - Top row: `Exportar` button (left) · centered title block
     (`◆ Nível N · Regras 2024 ◆` / character name / `species class · background`) ·
     `Subir de Nível` button (right).
   - Combat row: Iniciativa (`CombatStatFrame` square) · **CA shield** (inline SVG crest) ·
     Deslocamento (`CombatStatFrame` square).
   - Divider row: centered HP `/` maxHP + Proficiência pill, flanked by crimson gradient
     rules.
   - **Attribute grid**: 6 cells (flex-wrap, `max-width:660px`), each with top accent line,
     abbr, big serif modifier, score pill. Lives **inside** the hero.
2. **Middle row** (flex-wrap, align-start):
   - Left column: **SavingThrowsGrid** (new) + **skills grouped by attribute**.
   - Middle column (flex-2, min 320px): **tabs panel** (`ContentTabs` reworked).
   - Right column (flex-1, min 230px): existing **CodexColumn**.
3. **Bottom grid** (`auto-fit, minmax(220px,1fr)`): **DefensesPanel · PassivesPanel ·
   SensesPanel · Conditions** section.

## Saving-throws grid (new `SavingThrowsGrid`)

Section card ("Testes de Resistência", shield icon). 3-column grid of 6 cells; each cell:
abbr + serif modifier; a primary dot in the top-right corner when `isProficient`. Binds to
`summary.savingThrows` (already provided by the selector).

## Skills (grouped by attribute)

Section card ("Perícias", list icon). Skills grouped by `attributeKey` in canonical order
(FOR/DES/CON/INT/SAB/CAR); per group a crimson attr-abbr subheading, then rows: proficiency
dot (`transparent` / `--primary` / `--brand-gold` for expertise), right-aligned serif
modifier, label. Binds to `summary.skills`. Restyle within existing `SkillsColumn`.

## Tabs panel (reworked `ContentTabs`)

Five tabs, each exposing the filter axis that fits its content:

| Tab             | Filter axis | Content (real data)                                      | Empty/placeholder                          |
|-----------------|-------------|----------------------------------------------------------|--------------------------------------------|
| Ações           | origin      | real weapons as cards grouped by category, source-colored left border, attack bonus + damage; click → detail modal | "Nenhuma ação desta origem." |
| Magias          | circle      | spell DC/attack meta strip + groups by circle **when data exists** | mock structure + "Nenhuma magia desta origem." (selector computes no spells today) |
| Inventário      | category    | money/carry summary cards (placeholder `—` where no value) + item chips grouped; click → detail modal | "Nenhum item desta origem." |
| Características  | origin      | real features as source-bordered cards                   | "Nenhuma característica desta origem."      |
| Anotações       | none        | existing store-persisted textarea (`description.notas`)  | n/a                                         |

**Weapon/equipment mapping notes:**
- Weapons: real weapons currently have `damage: "—"` and no `category`; render damage as-is
  and treat un-categorized weapons under "Armas". No fabricated Conjuração group.
- Equipment: map `summary.selectedEquipment` → chips with `qty` default 1, color by
  `source`/`sourceType`. Cost/weight/description shown in the modal only where present.
- Money/carry: the app has no value → summary cards render with `—` placeholders (structure
  preserved, no invented numbers).

Filter bars mirror the mock: chip buttons, active chip uses the axis color at 20% mix +
solid border. Filters are local state (`originFilter` / `spellFilter` / `invFilter`).

## New `ItemDetailModal`

Radix dialog (matching the app's existing modal pattern), styled like the mock's detail
panel, header with crimson kicker + serif title + ✕. Variant bodies:
- **spell**: grid of casting time / range / target / duration / components / classes +
  description.
- **weapon**: acerto / dano / alcance stat tiles + properties + description.
- **equipment**: quantidade / peso / custo tiles + description.

Only fields with real data are rendered; missing fields are omitted (not shown blank).
Opens from Ações and Inventário. Closes on overlay click / ✕ / Esc.

## Level-up

`LevelUpFlow` preserved unchanged. `LevelUpButton` trigger restyled to the mock's crimson
pill (icon + "Subir de Nível", uppercase, crimson border/fill). Disabled at level 20 as
today.

## Mobile (mock 4a) — single column

Same components stacked in one column, **no fixed bottom-nav**:
header (export / title / level-up) → combat frames → HP/prof pill → attribute grid →
SavingThrowsGrid → skills → tabs card → bottom panels (Defenses/Passives/Senses/Conditions)
→ Codex. The inline content tabs remain functional inside the card.

**Trade-off (accepted):** this removes today's fixed bottom tab-bar (Atributos/Perícias/
Ações/Códice) in favor of the zip's single scrolling column.

## Components

- **New**: `SavingThrowsGrid` (molecule), `ItemDetailModal` (organism). A `SheetHero`
  organism (or a restructured `SheetHeader`) for the centered hero block.
- **Reworked**: `CharacterSheetView` (new three-region layout + single-column mobile),
  `ContentTabs` (per-tab filter bars, card-based Ações, detail-modal wiring, empty states),
  `AttributesColumn`/`SkillsColumn` (attribute-cell + grouped-skills restyle),
  `LevelUpButton` (trigger style).
- **Reused as-is**: `DefensesPanel`, `PassivesPanel`, `SensesPanel`, `ConditionsPanel`,
  `CodexColumn`, `CombatStatFrame`.

## Testing

Vitest component tests:
- `SavingThrowsGrid`: renders 6 cells; proficiency dot appears only for proficient saves.
- `ItemDetailModal`: opens/closes; renders the correct variant fields; omits missing fields.
- `ContentTabs`: filter switching per tab; empty states for Magias and filtered-out origins.
- `CharacterSheetView`: smoke test for both `embedded` and standalone rendering.
- Update existing `BuilderStepPanel` / `CharacterSheetPreview` tests if props/selectors
  shift.

## Risks / watch-items

- **Visual parity** depends on matching the mock's exact spacing/typography tokens; verify
  against the zip in the browser preview at both 390px (mobile) and ~1180px (desktop).
- **Removing the mobile bottom-nav** changes established navigation; accepted by user.
- **Empty Magias/Inventário** must read as intentional design (styled empty states), not
  broken — verify copy and layout.
