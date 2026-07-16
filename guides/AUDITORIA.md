# Project Audit - Forge & Fate

> Current audit snapshot: 2026-07-16. Basis: guide docs, `package.json`, domain types, rules, adapters, store, components, browser smoke QA, and focused/full tests found in the repository.
>
> Since the 2026-07-11 snapshot: dedicated subclass builder step + level-up modal with state-integrity fixes (schema v14), security hardening (CSP/headers, sanitized notes, import hardening, no external CDN), species defenses and level-up feat fixes, Foundry export compliance, data pruning, first-class Forge & Fate JSON export actions, source filtering coverage, shared migration entry point, structured magic-item bonuses, and the multiclass ADR. Guide docs were consolidated into `guides/`.

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

- Canonical persisted contract: `src/types/characterBuild.ts`, schema v14.
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
- Foundry export: `src/utils/foundryAdapter.ts`, Foundry adapter tests.
- PDF: `src/adapters/pdfAdapter.ts`, `src/adapters/pdfAdapterDocument.tsx`, `src/adapters/_tests_/pdfAdapter.test.tsx`.
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

- Foundry export likely needs a manual import verification pass against the target Foundry/dnd5e version before a public v1 claim.
- PDF layout is functionally tested, but visual print QA should still be done with real generated PDFs.

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

- Import a generated Foundry VTT JSON into the target Foundry/dnd5e version.
- Print-review at least one martial and one spellcaster PDF from real exported files.
- Run a full human keyboard/a11y pass at 200% zoom and reduced motion beyond the automated smoke.
