# Product Guide

## Register

Product.

## Users

Forge & Fate serves Dungeons & Dragons 5e 2024 players and table organizers who need a character builder that remains useful after creation.

Primary user modes:

- New player: needs guided explanations and trustworthy recommendations without being trapped in a simplified mode.
- Experienced player: wants fast creation, dense review surfaces, precise rules, and table-ready exports.
- Returning player: needs a Vault, living sheet, level-up flow, play state, notes, imports, and exports.
- Table organizer: needs portable character data for Foundry VTT, printable PDF, and future sharing/sync.

## Product Purpose

Forge & Fate treats a character sheet as a living, calculated, versioned model, not a static form. The product should support the full lifecycle: Vault, guided/standard/quick creation, live sheet review, play state, level-up, canonical JSON import/export, Foundry VTT export, printable PDF, and a roadmap toward multiclassing and deeper rules automation.

Success means the interface is fast, immersive, accessible, and trusted. Rules remain outside React, `CharacterBuild` remains the canonical persisted shape, `selectCharacterSheetSummary` remains the single derived truth, and persisted schema changes always ship with migration coverage.

## Current Baseline

Implemented:

- Local Character Vault with create, resume, duplicate, delete, search, import, and export-ready status.
- 10-step builder with guided, standard, and quick-build entry paths.
- Beginner-mode recommendation quizzes and inline contextual help.
- Schema v14 canonical `CharacterBuild`, including `playState`.
- Pure rules/adapters for derived sheet math, level progression, HP, AC, attacks, inventory, spellcasting, rests, pendencies, rules-text AST, Foundry, canonical export/import, and PDF.
- Living sheet with level-up, play-state panels, notes, conditions, campaign log, Foundry export, and PDF export.

Current product gaps:

- Canonical Forge & Fate JSON export exists in code but needs first-class UI next to import.
- Source preferences must filter all catalogs consistently.
- Resistance/immunity/vulnerability derivation and magic item effects need deeper rules coverage.
- Multiclassing requires an ADR and deliberate schema migration before implementation.
- Launch hardening still needs a full manual browser/a11y/export pass.

## Brand Personality

Tactical, dark-fantasy, precise.

The product should feel like an advanced tactical panel for heroic character management: dense enough for serious play, restrained enough for repeated use, and dramatic only where it reinforces the fantasy. The voice is confident, direct, and player-facing.

All product UI and development-facing docs should be English.

## Anti-References

Do not make the app feel like:

- A corporate SaaS dashboard.
- A marketing landing page.
- A generic form wizard.
- A decorative fantasy skin over weak workflows.
- A static PDF-like form that stops being useful after creation.

Avoid arbitrary rule calculations in UI components, ad-hoc color literals instead of design tokens, placeholder actions without handlers, and any shortcut that would need to be undone for level 20 progression, spellcasting, exports, or future multiclassing.

## Design Principles

1. The sheet is alive: creation, vault management, review, play, export, import, and level-up are one lifecycle.
2. Domain truth stays centralized: UI surfaces consume `CharacterSheetSummary` or extend `CharacterBuild`; they do not recalculate D&D rules locally.
3. Complexity is progressive: expose dense rules, tables, and configuration only when the player needs them.
4. Source isolation is sacred: class, species, background, equipment, feats, spells, and future sources keep independent state boundaries.
5. Immersion serves the task: dark fantasy mood, crimson focus, and tactical density are useful only when they preserve clarity, speed, and keyboard access.
6. Portability is a feature: canonical JSON is round-trip data; Foundry and PDF are external adapters.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Preserve visible focus states, keyboard navigation, semantic controls, sufficient contrast, reduced-motion behavior, and accessible labels for icon-only actions. Functional text should not drop below the project's documented minimum, and crimson accents should not be used as small functional text on dark backgrounds when contrast fails.

## Next Product Priorities

1. Add explicit canonical JSON export UI and keep Foundry/PDF labels unambiguous.
2. Complete launch-hardening verification across Vault, builder, conclusion, and sheet.
3. Expand rules coverage for defenses, feat effects, magic items, and resource recovery.
4. Apply source preferences consistently across all catalogs.
5. Consolidate migration logic for builder, Vault, and canonical import.
6. Write the multiclass ADR before schema or UI work.
