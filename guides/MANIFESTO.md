# Forge & Fate Manifesto

> This is the project's living vision and architecture guide. Before any feature, refactor, UI polish, export change, or schema change, ask: does this move Forge & Fate toward the complete level 1-20 living character lifecycle, or does it create debt that must be undone later?

Forge & Fate is not a form filler. It is a web character builder for Dungeons & Dragons 5e 2024 that treats the sheet as a living, calculated, portable, versioned model.

## 1. North Star

Forge & Fate must become a serious, table-ready D&D 5e character builder:

- Fast enough for repeated use.
- Clear enough for new players.
- Dense enough for experienced players.
- Accurate enough to trust at the table.
- Portable enough to leave the app through canonical JSON, Foundry VTT, and printable PDF.
- Structured enough to survive level 20, subclasses, spellcasting, future multiclassing, and export growth without rewrites.

The app should feel like an advanced dark-fantasy tactical panel, not a corporate SaaS dashboard, generic form wizard, or static character-sheet clone.

## 2. Canonical Language

Forge & Fate is an English-language product.

Use native English for product UI, static text, `aria-label`s, validation messages, empty states, tooltips, tests that lock copy, metadata, commits, PRs, and development docs. Use canonical D&D 5e vocabulary.

Portuguese copy is legacy unless it is required for old saves, historical internal field names, or immutable external data. When raw 5etools terms are shown, protect canonical rule names with `translate="no"` / `notranslate` when browser translation could corrupt names, abbreviations, or rule values.

## 3. Product Lifecycle

The product lifecycle is one continuous loop:

1. Create or import a character in the Vault.
2. Choose guided, standard, or quick-build creation.
3. Complete the 10-step builder.
4. Review the living sheet.
5. Play with current HP, conditions, rests, spell slots, resources, notes, and campaign log.
6. Level up without reopening the whole wizard.
7. Export to table formats.
8. Return later and keep the same canonical character evolving.

Any new feature should plug into that lifecycle instead of becoming an isolated panel.

## 4. Current Implemented Baseline

This is the current audited baseline as of 2026-07-16.

### Product Surfaces

- Character Vault with local saves, create, resume, duplicate, delete, import, search, status, and ready-to-export state.
- 10-step builder: class, class features, subclass, background, species, species details, ability scores, equipment, description, conclusion. (The dedicated subclass step landed with schema v14; older docs may still say "9-step".)
- Creation modes: guided mode, standard mode, and quick build.
- Dedicated subclass builder step and level-up modal with state-integrity guarantees (cancel reverts).
- Security hardening: CSP + headers in `next.config.ts`, sanitized notes preview (DOMPurify), import hardening with anti-prototype-pollution reviver and 2 MB size limit, no external CDN assets.
- Beginner guidance with recommendation quizzes and inline contextual help.
- Dense `/sheet` and builder conclusion surfaces that share `CharacterSheetView`.

### Domain And Persistence

- `CharacterBuild` is the canonical persisted model at schema v16.
- The persisted shape is split into `draft`, `progression`, `choices`, `playState`, `derivedSheet`, and `exportMetadata`.
- Store persistence, Vault reads, and canonical import normalize old saves through the shared `migrateCharacterBuild(raw, fromVersion)` path.
- Schema migrations are covered for the important historical shapes, with fixture-based tests.
- Imported external sheet snapshots can mark historical non-subclass level choices as resolved through the imported level, without fabricating Forge & Fate ASI/feat history.
- Imported inventory can preserve Foundry-only item metadata when no 5eTools/Plutonium catalog match exists, instead of converting carried items into review notes.

### Rules Engine

- D&D math lives outside React in `rules/`, `src/adapters/`, and services.
- `selectCharacterSheetSummary` remains the single derived truth boundary and delegates to pure rule modules.
- Current derived coverage includes ability scores, proficiency, HP, hit dice, AC, initiative, speed, skills, saving throws, passives, features, pendencies, money, carry, inventory, attacks, spellcasting, defenses fields, languages, tools, and play-state values.

### Level 1-20 And Living Play

- Level-aware proficiency, HP, hit dice, class features, subclass requirements, ASI/feat requirements, feature choices, and spellcasting exist.
- `LevelUpFlow` supports HP choice, subclass choice, ASI/feat choice, feature-option choice, and spell choices for spellcasters.
- Play state supports damage, healing, temporary HP, short rest, long rest, spent spell slots, resource uses, conditions, death saves, inspiration, HP/AC overrides, notes, and campaign log.

### Character Options

- Classes, species, backgrounds, languages, feats, spells, and item catalogs are normalized from local 5e data.
- Subclasses are modeled with a dedicated builder step and through level-up requirements.
- Feats and ASI are mutually exclusive at the choice point, with categories, prerequisites, attribute caps, and curated mechanical effects.
- Spellcasting has normalized spells, class spell lists, filters, slot derivation, save DC, spell attack, cantrip/known/prepared limits, and sheet/export visibility.
- Inventory has quantities, equip/unequip, item catalog search/filtering, imported custom items, armor/shield AC effects, magic AC/save/weapon bonuses, weapon attacks, carried load, and carried inventory rendering.

### Exports

- Foundry VTT export consumes `CharacterSheetSummary` and includes identity, abilities, skills, tools, traits, inventory, equipment, weapons, spells, and class/species/background items.
- Canonical Forge & Fate JSON export/import exists in `src/utils/canonicalExport.ts` with a versioned envelope, first-class export actions in the Vault/sheet/conclusion surfaces, and lossless round-trip tests.
- Dashboard import writes imported characters into the Vault with a new save id.
- Printable PDF generation exists through `@react-pdf/renderer`, with matrix tests for martial, spellcaster, high-level, rich-description, inventory, portrait, and long-notes cases.

## 5. Real Gaps And Next Features

The next work should focus on closing product gaps, not rebuilding completed foundations.

### P0: Finish Portable Export UX

Status: complete for v1 closure on 2026-07-16.

- Forge & Fate canonical JSON is an explicit first-class export action in the Vault, conclusion, and sheet surfaces.
- Foundry VTT JSON remains a separate action from Forge & Fate JSON.
- `ForgeFateExportV1` remains the internal round-trip format; Foundry/PDF remain external adapters.

### P0: Launch-Hardening Pass

- Run a full manual browser pass across Vault, builder, conclusion, and sheet at mobile/tablet/desktop.
- Verify keyboard navigation, focus order, labels, reduced-motion behavior, and no horizontal overflow.
- Confirm one martial and one spellcaster can be created, leveled, saved, reopened, exported to Foundry, exported to PDF, exported to canonical JSON, and imported back.
- Keep a11y at WCAG 2.2 AA.

### P1: Rules Coverage Expansion

- Derive `resistances`, `immunities`, and `vulnerabilities` from species, feats, class features, spells, items, and manual overrides where appropriate.
- Expand feat mechanical effects beyond the current curated subset.
- Model magic item effects without leaking ad-hoc calculations into UI. The v1 closure covers structured item AC, saving throw, weapon bonus, and resistance fields; broader item effects remain ongoing.
- Connect feature/resource usage more tightly to short-rest and long-rest recovery rules.

### P1: Source Preferences And Catalog Scope

- Apply `creationPreferences.activeSources` consistently across class, species, background, feat, spell, and item catalogs.
- Show clear warnings when a save contains a choice from a source that is currently disabled.
- Keep source isolation intact: one source cannot mutate or erase another source's choices.

### P1: Migration Consolidation

- Shared `migrateCharacterBuild(raw, fromVersion)` is the migration entry point for the builder store, Vault normalization, and canonical import.
- Keep fixture coverage for every supported schema family.
- Never change `CharacterBuild` shape without a schema bump, migration, and tests.

### P2: Multiclass Design Then Implementation

- Use [`ADR-001-multiclass.md`](ADR-001-multiclass.md) before code changes.
- Plan the migration from `choices.selectedClassId` to `classLevels: { classId, level, subclassId }[]`.
- Define total-level proficiency, per-class features, multiclass spell slots, proficiencies, starter equipment limits, and Foundry/PDF mapping.
- Implement only after the export and launch-hardening gaps are closed.

### P2: Vault Evolution

- Consider cloud sync, public share links, backup/restore, and cross-device continuity after local v1 is stable.
- Keep the local Vault useful and reliable even if cloud features never ship.

## 6. Architecture Map

```text
public/data/*.json
  -> src/services/
  -> src/adapters/
  -> rules/
  -> src/store/
  -> CharacterBuild
  -> selectCharacterSheetSummary()
  -> UI, Vault, canonical JSON, Foundry VTT, PDF
```

### Layer Responsibilities

- `public/data/`: local D&D data.
- `src/services/`: data access, character storage, preferences, spell/item/class catalog services.
- `src/adapters/`: domain transforms and export adapters.
- `rules/`: pure rule modules with no React dependency.
- `src/store/`: Zustand store, persistence, migrations, `CharacterBuild` serialization, and selectors.
- `src/components/`: UI composition using the project's atomic-ish component structure and shadcn/Radix primitives.
- `src/types/`: all domain contracts (consolidated 2026-07-15; imported as `@/src/types/*`).

## 7. Non-Negotiable Engineering Rules

- Rules do not live in React components.
- UI consumes `CharacterSheetSummary` or writes explicit `CharacterBuild` choices.
- External formats never dictate the internal model.
- Foundry and PDF are adapters; canonical JSON is Forge & Fate's own round-trip format.
- `CharacterBuild` changes require schema bump, migration, and tests.
- Persisted old saves must remain readable.
- Source isolation is sacred.
- Use the existing design tokens for app UI. Do not scatter literal colors in components.
- PDF print styling may own a small print-specific palette inside the PDF adapter.
- Keep text and controls usable at mobile width and 200 percent zoom.
- Keep commands, docs, commits, PRs, and UI copy in English.

## 8. Definition Of Done

A change is not done until the relevant slice passes:

- Focused Vitest coverage for behavior.
- `npm run typecheck`.
- `npm run lint`.
- `npm run build` for route, app-shell, export, or framework-sensitive changes.
- Browser verification for UI, layout, a11y, or export-download work.
- Migration tests when persisted shape changes.
- `CharacterSheetSummary` remains the derived-truth boundary.
- Guide docs are updated when roadmap status, architecture, or workflow changes.

## 9. Glossary

- `CharacterBuild`: canonical persisted character model.
- `CharacterSheetSummary`: derived sheet truth used by UI and exports.
- `Source isolation`: class, species, background, equipment, feats, spells, and future sources stay independently owned.
- `Vault`: local character library backed by `characterService`.
- `Play state`: table-session state such as HP, slots, conditions, resources, notes, and log.
- `Canonical export`: versioned Forge & Fate JSON envelope for round-trip import.
- `External adapter`: Foundry VTT and PDF outputs derived from Forge & Fate truth.
