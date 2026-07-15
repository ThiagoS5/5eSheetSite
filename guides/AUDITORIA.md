# Project Audit - Forge & Fate

> Current audit snapshot: 2026-07-15. Basis: guide docs, `package.json`, domain types, rules, adapters, store, components, and focused tests found in the repository.
>
> Since the 2026-07-11 snapshot: dedicated subclass builder step + level-up modal with state-integrity fixes (schema v14), security hardening (CSP/headers, sanitized notes, import hardening, no external CDN), species defenses and level-up feat fixes, Foundry export compliance, and data pruning. Guide docs were consolidated into `guides/`.

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
| 8 | Canonical JSON export/import and rich description | Complete core, export UI partial |
| 9 | PDF | Complete core |
| 10 | Multiclass preparation | Not started |

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
- Canonical export/import: `src/utils/canonicalExport.ts`, `src/types/export.ts`, `src/utils/_tests_/canonicalExport.test.ts`.
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

- Canonical JSON export is not yet a first-class visible action across the sheet/conclusion/Vault surfaces, even though the export utility exists.
- Launch readiness has not been proven through a full manual end-to-end browser/a11y/export pass.
- Multiclassing still requires a significant schema migration and should not begin without an ADR.

### Medium

- Source preferences are not consistently enforced across every catalog.
- Feat, feature, defense, and magic item effects are only partially mechanized.
- Migration logic should be consolidated to avoid divergence between builder persistence, Vault normalization, and canonical import.
- Some historical Portuguese/internal field names remain in domain objects for compatibility; UI/docs should stay English around them.

### Low

- Foundry export likely needs a manual import verification pass against the target Foundry/dnd5e version before a public v1 claim.
- PDF layout is functionally tested, but visual print QA should still be done with real generated PDFs.

## 5. Recommended Next Work

1. Add canonical Forge & Fate JSON export UI and tests.
2. Run and document launch-hardening verification across Vault, builder, sheet, imports, Foundry, and PDF.
3. Apply source filtering consistently.
4. Expand defense/effect derivation.
5. Consolidate migrations.
6. Write the multiclass ADR.

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
