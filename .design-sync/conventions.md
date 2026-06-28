---
name: conventions
description: Design-system conventions header for the claude.ai/design agent
metadata:
  type: project
---

## D&D 5e Character Sheet — Component Conventions

### Wrapping and setup

Most leaf and UI components (Button, Card, Input, Accordion, Badge variants, Sidebar, Tooltip, etc.) render standalone with no wrapper.

Components that read character state from the Zustand store — anything in the `sheet/` group (`AbilityScoresGrid`, `AttributesColumn`, `CombatStatsCard`, `AttributeEditor`, `SkillsColumn`, `ConditionsPanel`, `DefensesPanel`, `PassivesPanel`, `SensesPanel`, `DeathSavesOverlay`, `CodexColumn`, `MainContentColumn`, `ContentTabs`) plus `CharacterSheetPreview` and `CharacterRoster` — **must be wrapped in `<CharacterStoreProvider>`**. Without it the component throws a Zustand context error and renders nothing.

```jsx
import { CharacterStoreProvider, AbilityScoresGrid } from 'ficha-5e-app';

<CharacterStoreProvider>
  <AbilityScoresGrid />
</CharacterStoreProvider>
```

Level-up flow components (`LevelUpFlow`, `AsiOrFeatStep`, `FeatureOptionStep`, `SubclassStep`) also read from the store — wrap them too.

### Styling idiom

**Tailwind v4 utility classes only.** No CSS modules, no style props, no `className` overrides on DS components. To add layout glue around DS components, write Tailwind classes on wrapper `<div>`s you author; never invent class names that don't exist in the bundle.

Key semantic-token classes used across all components — all resolve via the shipped `styles.css`:

| Purpose | Classes |
|---|---|
| Backgrounds | `bg-background`, `bg-card`, `bg-muted`, `bg-surface-nested`, `bg-surface-raised` |
| Text | `text-foreground`, `text-muted-foreground`, `text-subdued` |
| Brand accent | `text-primary`, `bg-primary`, `text-brand-gold-alt`, `text-brand-crimson-alt` |
| Borders | `border-border`, `border-primary`, `border-white/[0.06]` |
| Class tones (background) | `bg-tone-arcane-deep`, `bg-tone-druid-deep`, `bg-tone-gold-deep` — crimson and deepest variants are gradient-only (`via-tone-crimson-deepest`) |
| Typography | `font-serif`, `font-mono`, `text-xs`…`text-3xl`, `tracking-[0.14em]` |

The app is dark-mode-first — never add `dark:` variants; all tokens are already dark.

### Where the truth lives

- All token and component CSS: `styles.css` → `_ds_bundle.css` (the full compiled Tailwind output; every semantic token is defined there).
- Per-component API: `<Name>.prompt.md` next to each component folder.

### Idiomatic build snippet

```jsx
import { CharacterCard, Button } from 'ficha-5e-app';

// A roster card with a CTA — no wrapper needed for these leaf components
<div className="grid gap-4 p-6 bg-background">
  <CharacterCard
    name="Thalindra Moonwhisper"
    race="Elfo"
    className="Mago"
    level={7}
    onClick={() => {}}
  />
  <Button variant="outline" size="sm">Ver ficha</Button>
</div>
```
