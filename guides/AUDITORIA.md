# Project Audit - Forge & Fate

> Current audit snapshot: 2026-09-07. The latest pass covers local 5etools integration, permanent character mechanics, source preferences, quick builds, and targeted responsive/browser verification. Earlier route-wide, PDF, and Foundry evidence is dated separately below.
>
> Since the 2026-07-16 snapshot: schema v17 adds flexible choice preferences and isolated extras, a bounded Foundry-origin snapshot, complete semantic Foundry 5.2/5.3 profiles, a shared PDF/Foundry projection, resilient rich-note persistence, an independent Session Log, grouped spell tables, responsive builder controls, and route-wide accessibility/layout corrections.

## 1. Phase Status

| Phase | Title | Status |
| --- | --- | --- |
| 1 | Pure rules engine and trust UX | Complete |
| 2 | Level 1-20 progression, subclasses, creation preferences | Complete |
| 3 | Beginner mode and creation modes | Complete |
| 4 | Feats and ASI | Complete foundation, partial mechanical breadth |
| 5 | Spellcasting | Complete foundation |
| 5b | Play state | Complete foundation |
| 6 | Real inventory | Complete foundation |
| 7 | Rules text AST and accordion cards | Complete |
| 8 | Canonical JSON export/import and rich description | Complete |
| 9 | PDF | Complete core |
| 10 | Multiclass preparation | ADR written, implementation not started |

## 2. Evidence

- Canonical persisted contract: `src/types/characterBuild.ts`, schema v17.
- Derived truth boundary: `src/store/characterSelectors.ts` delegates to `rules/characterSheetSummaryRules.ts`.
- Vault: `src/services/characterService.ts`.
- Creation modes and quick build: `src/components/pages/Dashboard.tsx`, `src/data/quickBuildProfiles.ts`.
- Guided recommendations and inline help: `src/data/classQuiz.ts`, `src/data/guidedChoiceQuiz.ts`, `src/data/personalDetailsRecommendations.ts`, `src/components/pages/BuilderStepPanel.tsx`, `src/components/organisms/PersonalDetailsEditor.tsx`.
- Level-up: `src/components/organisms/levelup/*`, `rules/levelProgression.ts`, `rules/hitPointRules.ts`.
- Feats/ASI: `src/adapters/featCatalog.ts`, `src/store/levelChoiceResolver.ts`, `AsiOrFeatStep.tsx`.
- Spellcasting: `src/services/spellService.ts`, `src/adapters/spellAdapter.ts`, `rules/spellcastingRules.ts`, `src/components/organisms/spells/SpellCatalogPicker.tsx`, `src/types/spells.ts`.
- Play state: `CharacterBuildPlayState`, `rules/restRules.ts`, `PlayStatePanel`, `ConditionsPanel`, `NotesPanel`, `SessionLogPanel`.
- Inventory: `src/services/itemCatalogService.ts`, `src/adapters/itemCatalogAdapter.ts`, `rules/inventoryRules.ts`, `rules/armorClassRules.ts`, `rules/attackRules.ts`, `InventoryManager.tsx`, `EquipmentChecklist.tsx`.
- Rules text AST: `src/adapters/rulesTextAst.ts`, `RulesTextView.tsx`, golden tests.
- Canonical export/import: `src/utils/canonicalExport.ts`, `src/types/export.ts`, `src/utils/_tests_/canonicalExport.test.ts`, `CharacterSheetView`, `SheetHero`, `Dashboard`.
- Foundry import/export: profile adapters under `src/adapters/foundry`, semantic projection, fixtures, round-trip tests, and installed-system schema checks for dnd5e 5.2.4 and 5.3.3.
- PDF: `src/adapters/pdfAdapter.ts`, `src/adapters/pdfAdapterDocument.tsx`, the shared semantic projection, real A4/Letter renders, and `src/adapters/_tests_/pdfAdapter.test.tsx`.
- Sheet/conclusion: `CharacterSheetView`, `SheetHero`, `ContentTabs`, `BuilderStepPanel` conclusion embed.

## 3. Confirmed Strengths

- The project has a real domain model instead of UI-owned rule calculations.
- Most table-facing capabilities now consume `CharacterSheetSummary`.
- Schema migration discipline is present and tested.
- The sheet is no longer a passive preview; it supports play-state workflows and export outputs.
- PDF generation is not hypothetical; it renders real buffers for multiple character shapes.
- Canonical export/import has round-trip tests and legacy-schema import coverage.
- The UI has moved toward dense, utility-driven sheet surfaces.

## 4. Remaining Risks

### High

- Launch readiness has not been proven through a full manual end-to-end browser/a11y/export pass.
- Multiclassing still requires a significant schema migration and must remain behind ADR-001 until post-v1 implementation begins.

### Medium

- Source preferences now cover the main catalogs, but long-tail catalog surfaces should keep the same filter/warning behavior as they are added.
- Feat, feature, defense, and magic item effects are only partially mechanized.
- Historical migration fixtures should continue to expand whenever a new schema is introduced.
- Some historical Portuguese/internal field names remain in domain objects for compatibility; UI/docs should stay English around them.

### Low

- A live Foundry application import remains a release-environment check because no Foundry executable/runtime was available during this audit. Fixtures were validated against the local 5.2.4 system and an isolated official 5.3.3 package without touching worlds.

## 5. Recommended Next Work

1. Run and document launch-hardening verification across Vault, builder, sheet, imports, Foundry, and PDF.
2. Continue expanding defense/effect derivation.
3. Keep historical migration fixtures current for every future schema bump.
4. Use ADR-001 before any multiclass implementation.

## 6. Verification Commands For This Family

Use the relevant subset, then broaden when touching shared contracts:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

For export-focused work, include:

```bash
npm test -- src/utils/_tests_/canonicalExport.test.ts src/adapters/_tests_/pdfAdapter.test.tsx src/components/pages/_tests_/CharacterSheetView.test.tsx
```

## 7. V1 Closure Verification - 2026-07-16

Automated gates run for this closure pass:

- `npm run test` - passed, 133 files / 633 tests.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm run build` - passed with Next.js 16.2.9.

Focused coverage added or re-run:

- Forge & Fate JSON export actions in Vault, sheet, and conclusion/sheet embed.
- Export labels and filenames for Forge & Fate JSON, Foundry VTT JSON, and PDF.
- Canonical import through shared migration path.
- Source filtering across class, subclass, species, background, feats, spells, and items, preserving disabled-source saves with warnings.
- Magic-item AC, saving throw, weapon bonus, and resistance fields through rules modules and `CharacterSheetSummary`.
- Long-rest recovery preserving non-rest play-state data.
- Selector purity guardrail after extracting equipment effects and starting gold rules.

Browser smoke QA run on `http://localhost:3001`:

- Dashboard desktop, tablet, and mobile: no horizontal overflow.
- Sheet mobile: no horizontal overflow.
- Sheet export actions visible as `Export Forge & Fate JSON`, `Export Foundry VTT JSON`, and `Export PDF`.
- Keyboard tab reaches `Export Forge & Fate JSON` with an accessible button name and visible focus-ring class.
- Vault cards show direct `Export Forge & Fate JSON for ...` actions separately from `View ... sheet`; incomplete drafts keep export disabled.
- Console is clean of CSP errors after removing remote Google images and disabling local-dev Vercel Analytics script loading.

Residual manual release checks before a public v1 announcement:

- Import generated Foundry VTT JSON through live dnd5e 5.2.4 and 5.3.3 applications when those runtimes are available.
- Run a final human screen-reader pass; automated semantics, keyboard behavior, 200%-equivalent layout, and reduced-motion rules are covered.

## 8. Schema v17 And Route Audit - 2026-07-19

Closed contract and behavior findings:

- Flexible choices are opt-in per character, keep normal minimums blocking, preserve extras when disabled, and never relax class/species/subclass or ASI-versus-feat exclusivity.
- Personality Traits and other rich-note documents synchronize after late Zustand hydration, debounce safely, flush on document changes/unmount, and survive Vault reload.
- Notes and Session Log are independent keyboard-accessible tabs. Spells are deduplicated and grouped by present level with fixed, identical table columns.
- Foundry 5.2/5.3 import/export covers semantic sheet data, historical external baselines, custom entities, unknown metadata preservation, and cross-profile conversion.
- PDF output includes narrative and play-state content, level-grouped spells, long inventory/features/notes/logs, and visually inspected A4 and Letter high-level fixtures without clipped content or orphaned Session Log headings.

Route QA covered Dashboard, create/import modal, all 10 builder steps, locked state, preferences, detail/level-up dialogs, conclusion, and `/sheet` at 1440 px, tablet/200%-equivalent width, and 390 px. Closed findings included dead builder navigation actions, inaccessible mobile menu wiring, stacked mobile sheet statistics, undersized touch targets, Portuguese quick-build labels, and duplicate SVG IDs. The final automated scan found no page-level horizontal overflow, unnamed controls, duplicate IDs, or dead links in the audited public routes.

Final gates: `npm run lint` passed; `npm run typecheck` passed; `npm test` passed with 140 files and 721 tests; `npm run build` passed with Next.js 16.2.9 and 16 generated pages.

## 9. Character Creator Refinement - 2026-09-07

Data coverage and repairs:

- `npm run audit:data -- --write` parses all 36 local JSON files and inventories 7,045 collection records. Every file has a service consumer. See [`5etools-data-audit.md`](5etools-data-audit.md) for the file-by-file inventory and scope limits.
- Class `_copy` inheritance and full class/subclass feature references now resolve before normalization. The initial catalog regression exposed 156 missing-feature-text or empty-subclass cases; all resolve in the current catalog tests.
- Equipment with an absent local reprint remains available. Both string and tagged-object reprint references are supported.
- Tests compare eligible raw records with normalized classes, species, backgrounds, and feats, and verify every supplied spell file and class-list join.

Rules and creation behavior:

- Unarmored Defense and class movement follow the actual Monk/Barbarian features and equipment restrictions.
- Dwarven Toughness, Tough, and Boon of Fortitude contribute to HP, including level changes. Each level grants at least 1 HP; breakdown totals match the result.
- Worn armor uses its actual formula, and multiple shields produce a blocking conflict instead of stacking AC.
- The preview uses canonical ability modifiers and initiative, including Alert, with expandable HP/AC explanations.
- Quick Build remains accessible after the first character, initializes full HP, and fills level-1 cantrip/spell selections from permitted class lists. Disabled-source classes are excluded. Its factory lives in `src/store/quickBuildFactory.ts`; rule choices live in `rules/quickBuildRules.ts`, with starter suggestions in `src/data/quickBuildProfiles.ts`.
- Source preferences have searchable book names/codes/content types, real catalog counts, and preserved hidden selections. The font-token cycle is repaired; interface text renders in Geist, with serif headings.

Persisted schema v17 and both persistence paths are unchanged. This pass does not establish full automation of every 5etools field: conditional item effects, optional-feature systems, full spellbook/species/subclass spell automation, and multiclass remain separate work. Earlier full release, screen-reader, and live Foundry checks are not replaced by this focused browser pass.

## 10. Portraits, Progression And Export Integration - 2026-09-09

Implemented:

- Schema v18 stores a bounded custom portrait alongside the gallery selection. PNG/JPEG/WebP uploads are decoded locally, resized to a maximum 512-pixel edge, and encoded as JPEG. The same portrait survives Vault/canonical round trips and appears in the sheet, PDF, Foundry actor and token. Remote/SVG/oversized values are rejected at normalization.
- Fixed the Foundry dialog download: defer the download until its interaction lock is released, and retain blob URLs long enough for the browser to consume them. New actors no longer clone an unrelated large reference character. Imported actor baselines remain preserved.
- PDF generation loads on demand, reports busy/error states, and prevents duplicate concurrent requests. Identity fields persist only changed values.
- Short rests roll individual Hit Dice, honor minimum healing and partial class-resource recovery. Rests require positive HP; healing clears death-save marks; temporary HP does not stack. Explicit 2024 resource pools replace prose-based rest guesses, including Second Wind and Arcane Recovery. All 12 reviewed classes export their supported counters as Foundry item uses.
- Fixed class/subclass known/prepared spell grants unlock at their required level without consuming player choices. Expanded lists are not treated as grants. Class-feature completion requires spell selections; slot tests include full, half and Pact Magic progressions.
- Feat prerequisites include spellcasting and armor proficiency, use earlier level choices, reject duplicate non-repeatable feats, and validate ability-choice amounts. Resilient derives the selected saving-throw proficiency; duplicate non-repeatable effects are not applied twice.
- Recommendation quizzes are available in guided and standard modes, retain key play-style questions, reject invalid answers, and respect permitted catalogs. The reviewed pt-BR glossary explains ambiguous D&D terms without machine-translating identifiers.

Verification:

- Full Vitest run: 148 files, 784 tests passed. A subsequent type-only correction to the new resource-export assertion was checked separately.
- Production build completed with 16 generated pages. Lint and type checking are recorded in `output/review-lint.log` and `output/review-types.log`; data reachability in `output/review-data.log`.
- Browser QA: uploaded 1024 x 768 PNG became 512 x 384 JPEG; portrait persisted after reload. PDF, canonical JSON and Foundry JSON downloaded successfully. Fighter level 1 -> 2 increased HP from 11 to 18 using the average choice, persisted after reload. At 390 px the sheet had no horizontal overflow. The temporary QA character was removed without changing the existing draft.
- Automated export tests render a real PDF containing an image and round-trip portrait JSON through both Foundry profiles. Browser download success is not equivalent to validation inside a running Foundry installation.

Remaining release scope:

- Live Foundry dnd5e 5.2/5.3 import and play validation remains required; do not claim universal or 100% compatibility from adapter tests alone.
- Species innate spells, third-caster subclasses, spellbook learning/replacement, optional invocations/maneuvers, and conditional combat effects still need dedicated modeling and acceptance fixtures. Resource counters do not automatically execute healing, transformations, damage or spell-slot conversion.
- This pass does not establish that every imported feat or nested 5etools mechanic executes automatically. File reachability measures catalog consumption, not rules completeness.
- The pt-BR glossary is curated assistance, not complete localization or verification of every Google Translate result. Full Brazilian terminology review remains necessary.
