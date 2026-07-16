# Forge & Fate Delivery Ruler

This is the permanent delivery ruler for product, architecture, and roadmap priority. `MANIFESTO.md` defines the north star; this file turns it into delivery gates.

## Final Product

Forge & Fate must deliver a complete D&D 5e 2024 character lifecycle:

- Local Character Vault with create, resume, duplicate, delete, search, import, and export.
- 10-step character builder (dedicated subclass step since schema v14) with guided, standard, and quick-build paths.
- Living sheet during and after creation.
- Pure rules engine outside React.
- Level 1-20 progression and living level-up.
- Subclasses, ASI/feats, spellcasting, real inventory, and play state.
- Unified 5etools rules text rendering.
- Canonical Forge & Fate JSON import/export.
- Foundry VTT export.
- Printable PDF.
- Future multiclassing without rewriting the foundations.

## Confirmed Stack

This project is a Next.js app, not Vite.

- Framework: Next.js `16.2.9`.
- UI: React `19.2.4`.
- State: Zustand `5.0.14`.
- Styling: Tailwind CSS `4`, CSS-first tokens in `app/globals.css`.
- Components: local UI primitives, shadcn/Radix, lucide-react, Font Awesome.
- Tests: Vitest, Testing Library, jsdom.
- PDF: `@react-pdf/renderer`.

Next.js 16 has breaking changes. Before touching routes, layouts, metadata, or framework APIs, read the relevant guide in `node_modules/next/dist/docs/`.

## Current Baseline

### Complete

- `CharacterBuild` schema v14 with `draft`, `progression`, `choices`, `playState`, `derivedSheet`, and `exportMetadata`.
- Local Vault with create/resume/duplicate/delete/search/import/status and direct Forge & Fate JSON export for ready characters.
- 10-step builder with validation and protected navigation.
- Guided/standard/quick-build creation modes.
- Beginner guidance, recommendation quizzes, inline help, class/species/background guidance, and personal-details help.
- Pure rules modules for core sheet derivation, skills, saves, HP, AC, attacks, level requirements, pendencies, spellcasting, rests, inventory, and rules text.
- Living level-up flow for HP, subclass, ASI/feat, feature options, and spell choices.
- Subclass data and selection in level-up.
- ASI/feat exclusivity, feat categories, prerequisites, attribute caps, and curated feat effects.
- Spell catalog, spell choices, derived spellcasting, slot spending, and rest recovery.
- Play state: HP, temp HP, damage/heal, rests, slots, resources, death saves, inspiration, conditions, overrides, notes, and campaign log.
- Real inventory: quantities, item catalog, equip/unequip, armor/shield AC, magic AC/save/weapon bonuses, weapon attacks, carry load.
- Rules text AST plus React/plain-text rendering.
- Foundry VTT export.
- Canonical JSON export/import utilities with round-trip and legacy-schema tests.
- First-class Forge & Fate JSON export actions in the Vault, conclusion, and sheet surfaces.
- Dashboard import for canonical JSON.
- Printable PDF generation and PDF matrix tests.
- Dense sheet/conclusion layout.

### Partial

- Source preferences are enforced across the main class, subclass, species, background, feat, spell, and item catalogs while preserving disabled-source legacy choices with warnings.
- Feat and feature mechanical effects are not exhaustive.
- `resistances`, `immunities`, and `vulnerabilities` exist on the summary and exports, but derivation needs broader source coverage.
- Migration logic uses the shared `migrateCharacterBuild(raw, fromVersion)` path across builder persistence, Vault normalization, and canonical import.
- Full v1 launch verification still needs a manual end-to-end pass.

### Not Started / Future

- Multiclass implementation.
- Cloud sync and public sharing.
- Homebrew/imported custom content.
- Full manual validation against every class from level 1 to 20.

## Mandatory Next Order

Do not jump to multiclass before the v1 portability and hardening gaps are closed.

1. **Portable export UX**
   - Status: complete for v1 closure on 2026-07-16.
   - Keep Foundry export and canonical JSON export as separate actions.
   - Ensure import/export errors are readable and accessible.

2. **Launch-hardening pass**
   - Verify Vault, builder, conclusion, sheet, import, Foundry export, PDF export, canonical export, and reimport.
   - Check mobile/tablet/desktop, keyboard navigation, focus, contrast, reduced motion, and horizontal overflow.

3. **Rules coverage expansion**
   - Derive defenses from actual sources.
   - Expand feat and magic item effects.
   - Tighten resource usage and recovery rules.

4. **Source preference enforcement**
   - Status: complete for the main v1 catalogs on 2026-07-16.
   - Preserve disabled-source legacy choices and warn instead of deleting data.

5. **Migration consolidation**
   - Status: shared migration entry point added on 2026-07-16.
   - Add fixture coverage for every supported schema family as new schemas are introduced.

6. **Multiclass ADR**
   - Status: ADR-001 written on 2026-07-16; implementation remains post-v1.
   - Design `classLevels[]`, total-level proficiency, per-class features, spell slots, proficiencies, equipment, and exports before implementation.

## Public Evolution Contracts

- `CharacterBuild` is the central persisted contract.
- `CharacterSheetSummary` is the central derived contract.
- `derivedSheet` is a cache of derived values, not an independent source of truth.
- External adapters consume Forge & Fate truth; they do not shape the internal model.
- Canonical JSON is versioned with `formatVersion`; the inner build is versioned with `schemaVersion`.
- Every persisted shape change requires schema bump, migration, and tests.
- Components render state and dispatch actions. D&D rules live in pure modules.

## Permanent Acceptance Criteria

Every delivery must preserve:

- The builder step sequence (10 steps as of schema v14).
- Character creation, resume, saving, import, and Vault persistence.
- Single derived truth through `CharacterSheetSummary`.
- Source isolation.
- Keyboard navigation, visible focus, semantic HTML, and contrast.
- Mobile, tablet, and desktop responsiveness.
- Long text without horizontal overflow.
- Versioned persistence and exports.
- Tests for rules, migration, validation, and UI behavior touched by the change.

## Relationship With Other Documents

All guide documents live in `guides/` (see `guides/README.md` for the reading order):

- `guides/MANIFESTO.md`: product and architecture north star.
- `guides/PRODUCT.md`: product framing and user value.
- `guides/DESIGN.md`: visual and interaction system.
- `guides/forge-fate-master-plan.md`: phase roadmap and backlog (partly historical — see its header).
- `guides/AUDITORIA.md`: current audit snapshot and risks.
- `guides/ORGANIZATION.md`: folder structure and file placement.
- `guides/AGENTS.md`: agent operating rules.

When documents conflict, prefer this order: `MANIFESTO.md`, this delivery ruler, master plan, product guide, design guide.
