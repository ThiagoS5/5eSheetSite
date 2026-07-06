# Product

## Register

product

## Users

Forge & Fate serves Dungeons & Dragons 5e 2024 players and table organizers who need a reliable character builder that remains useful after initial creation. They use it while planning a character, managing a growing vault, reviewing a live sheet during play, and preparing exports for virtual or physical tables.

## Product Purpose

Forge & Fate is a web character builder for D&D 5e 2024 that treats a character sheet as a living, calculated, versioned model rather than a static form. The product should support guided character creation, a Character Vault, mathematically reliable derived stats, Foundry VTT export, and a roadmap toward level 1-20 progression, multiclassing, subclasses, spellcasting, live level-up, and PDF export.

Success means the interface is fast, immersive, accessible, and trusted: rules remain outside React, `CharacterBuild` remains the canonical persisted shape, `selectCharacterSheetSummary` remains the single derived truth, and persisted schema changes always ship with migration coverage.

## Brand Personality

Tactical, dark-fantasy, precise.

The product should feel like an advanced tactical panel for heroic character management: dense enough for serious play, restrained enough for repeated use, and dramatic only where it reinforces the fantasy. The voice should be confident, direct, and player-facing, with Portuguese UI copy that helps beginners without slowing experienced users.

## Anti-references

Do not make the app feel like a corporate SaaS dashboard, a marketing landing page, or a generic form wizard. Avoid decorative fantasy flourishes that obscure task flow, arbitrary rule calculations in UI components, ad-hoc color literals instead of design tokens, and any shortcut that would need to be undone for level 20 progression, multiclassing, spellcasting, or export workflows.

## Design Principles

1. The sheet is alive: creation, vault management, review, export, and level-up should feel like one continuous character lifecycle.
2. Domain truth stays centralized: UI surfaces consume `CharacterSheetSummary` or extend `CharacterBuild`; they do not recalculate D&D rules locally.
3. Complexity is progressive: expose dense rules, tables, and configuration only when the player needs them.
4. Source isolation is sacred: class, species, background, equipment, and future rule sources keep independent state boundaries.
5. Immersion serves the task: dark fantasy mood, crimson focus, and tactical density are useful only when they preserve clarity, speed, and keyboard access.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Keep visible focus states, keyboard navigation, semantic controls, sufficient contrast, reduced-motion alternatives, and accessible labels for icon-only actions. Functional text should not drop below the project's documented minimum, and crimson accents should not be used as small functional text on dark backgrounds when contrast fails.
