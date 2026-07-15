# Project Organization Guide — Forge & Fate

Authoritative rules for **where every file lives**, how folders are structured, and how new
code is placed. If a file's location is not justified by this document, it is in the wrong
place. Reference model: Atomic Design
([source article](https://medium.com/@yashsisodiya/creating-a-well-organized-react-typescript-project-structure-with-atomic-design-principles-72c5c2e0a8e8)),
adapted to this project's real stack: **Next.js 16 App Router + Tailwind 4 + Zustand**.

Adaptations from the generic model (do not "fix" these back):

- `routes/` and `pages/` from the generic model **are the Next.js `app/` router** here.
  Page composition lives in `src/components/pages/`; `app/` routes stay thin.
- `contexts/` is not used — global state is Zustand (`src/store/`). Do not introduce React
  context for domain state.
- `styles/` is `app/globals.css` (Tailwind 4 CSS-first tokens). There is no `tailwind.config`.
- `i18n/` is not used — the product is English-only (MANIFESTO §2).
- `assets/` is Next.js `public/` (static files served as-is).
- This project adds layers the generic model does not have: `rules/` (pure D&D engine) and
  `src/adapters/` — they are the heart of the architecture (MANIFESTO §6).

## 1. Top-Level Map (current + target)

```text
5e Fichas/
├── guides/                  # Canonical project guides — read before coding (guides/README.md)
├── app/                     # Next.js App Router ONLY: route segments, layout.tsx, globals.css
│   ├── builder/[step]/      #   thin route wrappers that render src/components/pages/*
│   ├── sheet/
│   └── _tests_/
├── public/                  # Static assets served as-is
│   ├── data/                #   raw 5e data (5eTools JSON) — read-only input, never edited by hand
│   └── portraits/           #   local portrait gallery
├── src/
│   ├── components/          # Atomic Design — see §2
│   ├── adapters/            # normalization + export adapters (5eTools, spells, feats, items, PDF, rules-text AST)
│   ├── services/            # data access & persistence (Vault, catalogs, preferences, raw 5e loading)
│   ├── store/               # Zustand store, persist + migrations, selectors, level-choice resolver
│   ├── schemas/             # zod schemas (form validation)
│   ├── data/                # curated static app content (quizzes, glossary, quick-build profiles, portraits index)
│   ├── hooks/               # shared custom hooks (use-mobile, ...)
│   ├── lib/                 # generic UI helpers (cn/styles) — shadcn convention
│   ├── utils/               # output adapters & pure helpers (canonicalExport, foundryAdapter, truncate)
│   ├── types/               # ALL domain contracts (characterBuild, builder, dnd, spells, export, rulesText, fiveETools, Character)
│   └── _references/         # frozen external fixtures (e.g. Foundry reference JSON)
├── rules/                   # PURE D&D rule modules — no React, no store imports, 100% tested
├── scripts/                 # node maintenance scripts (prune-data, build-player-lore, verify-tokens)
├── templates/               # local-only reference artifacts (Foundry actor exports, PDF sample) — gitignored
└── docs/superpowers/        # agent planning output — gitignored, never canonical
```

**Rule: no new top-level folders.** If a file does not fit the map above, it goes in the
closest existing layer, or you propose a map change by editing this guide in the same PR.

## 2. `src/components/` — Atomic Design

Levels and their meaning (dependency flows downward only — an atom never imports a molecule):

| Level | Contains | Examples here |
| --- | --- | --- |
| `ui/` | shadcn/Radix primitives, added via shadcn CLI. Do not hand-edit beyond theming | `button.tsx`, `sheet.tsx`, `accordion.tsx` |
| `atoms/` | Smallest reusable visual units, no domain knowledge | `StatBadge`, `Spinner`, `TraitText` |
| `molecules/` | Small compositions of atoms; may know domain display shapes | `CharacterCard`, `HelpHint`, `RulesTextView` |
| `organisms/` | Complex panels composed of molecules/atoms; may read the store via hooks/selectors | `BuilderSidebar`, `InventoryManager`, `levelup/*`, `sheet/*`, `spells/*` |
| `templates/` | Layout shells that arrange organisms | `BuilderShell`, `builderStepNavigation` |
| `pages/` | Full page compositions rendered by `app/` routes | `Dashboard`, `CharacterSheetPage`, `BuilderStepPanel` |

### Component file convention

Application-owned components use folder-per-component. The `ui/` folder is the exception:
shadcn/Radix primitives stay in their generated flat files unless the shadcn CLI changes that
structure. Non-component helpers may stay as direct module files when they are not React
components (`attributeIcons.ts`, `sanitizeNotesHtml.ts`, `sheetTheme.ts`).

```text
src/components/molecules/CharacterCard/
├── index.tsx           # the component (named export, e.g. CharacterCard)
├── index.types.ts      # component-specific public props/types when the component accepts props
├── index.css           # ONLY if Tailwind genuinely cannot express it (rare)
└── _tests_/
    └── index.test.tsx
```

No-prop components may omit `index.types.ts`; do not create empty type files just to satisfy
the shape. Tests are always colocated under `_tests_/index.test.tsx` next to the component.
Styling is Tailwind classes with tokens from `app/globals.css`; a component `.css` file is
the exception (`MarkdownEditor/index.css` is the precedent), never the default.

### Placement decision for a new component

1. Used by exactly one page and nowhere else? → subfolder of that page's domain
   (`organisms/sheet/`, `organisms/levelup/`) or next to the page component.
2. Reusable and dumb (props in, JSX out)? → `atoms/` or `molecules/`.
3. Reads the store / orchestrates domain flows? → `organisms/`.
4. Arranges layout only? → `templates/`.
5. Is a route's whole content? → `pages/` + a thin wrapper in `app/`.

## 3. Non-UI Placement Table ("where does X go?")

| You are writing... | It goes in... | Test goes in... |
| --- | --- | --- |
| D&D rule math (anything combining two rule inputs: attribute+PB, item+DEX, level+table) | `rules/<topic>Rules.ts` — pure, no React | `rules/_tests_/` |
| Normalization of raw 5e/foundry data into builder models | `src/adapters/` | `src/adapters/_tests_/` |
| Export to an external format (Foundry, PDF) | adapter: `src/utils/foundryAdapter.ts`, `src/adapters/pdfAdapter*` | mirrored `_tests_/` |
| Canonical JSON export/import | `src/utils/canonicalExport.ts` | `src/utils/_tests_/` |
| localStorage/sessionStorage access, catalog loading, caching | `src/services/` | `src/services/_tests_/` |
| Store state, actions, persistence, migrations, selectors | `src/store/` | `src/store/_tests_/` (+ frozen schema fixtures in `fixtures/`) |
| Form validation schema | `src/schemas/` | mirrored `_tests_/` |
| Curated static content (quiz questions, glossary, quick-build kits) | `src/data/` | `src/data/_tests_/` |
| Shared React hook | `src/hooks/` (`useXyz.ts`) | mirrored `_tests_/` |
| Generic pure helper (formatting, truncation) | `src/utils/` | `src/utils/_tests_/` |
| Domain contract/type | see §5 | — |
| One-off maintenance script | `scripts/` | run instructions in script header |

**Never** put: rule math in components or the store; storage access in components;
raw-data parsing in the UI layer; React imports in `rules/`.

## 4. Tests

- Framework: Vitest 4 + Testing Library + jsdom (`vitest.config.ts`, `vitest.setup.ts`).
- Convention: a `_tests_/` folder **next to the code it tests**, mirroring the module name.
  This is the single pattern — the legacy sibling `*.test.ts` files in `rules/` were
  consolidated into `rules/_tests_/` on 2026-07-15; do not create sibling test files.
- Rule modules are tested with real 5e 2024 numbers, not mocks (master plan §7.4).
- Schema migrations keep one frozen fixture per historical schema version in
  `src/store/_tests_/fixtures/` — fixtures are never "updated" to the new shape.
- Guard tests are load-bearing: `selectorPurity.test.ts` enforces the selector line budget
  and summary snapshot. Do not delete or loosen guard tests to make a change pass.

## 5. Types: single home in `src/types/`

**Consolidated on 2026-07-15.** All domain contracts live in `src/types/`
(`characterBuild.ts`, `Character.ts`, `builder.ts`, `dnd.ts`, `export.ts`, `spells.ts`,
`rulesText.ts`, `fiveETools.ts`), imported as `@/src/types/<file>`. The legacy root-level
`types/` and `hooks/` folders were merged into `src/types/` and `src/hooks/` — do not
recreate them.

- New types belong next to their domain family: a new spell type goes in
  `src/types/spells.ts`, a new persisted-shape type goes in `src/types/characterBuild.ts`.
- Component-local types stay in the component (`index.types.ts` or inline).
- All shared hooks live in `src/hooks/` (`useCharacterFilters.ts`, `use-mobile.ts`).

## 6. Imports

- Path alias: `@/*` maps to the **repo root** (`tsconfig.json` and `vitest.config.ts`).
  Use it always: `@/src/components/...`, `@/rules/attackRules`, `@/src/types/builder`.
- Never use deep relative walks (`../../../`).
- Dependency direction (MANIFESTO §6): `public/data` → `services` → `adapters` → `rules` →
  `store` → `components`. Lower layers never import from higher ones; nothing imports
  from `app/` except Next itself.
- No barrel `index.ts` re-export files for whole layers — import modules directly. (Barrels
  hide dependency direction and hurt tree-shaking in Next.)

## 7. Naming

- Components: `PascalCase` (`InventoryManager.tsx`); folder-per-component also `PascalCase`.
- Hooks: `useCamelCase.ts`. shadcn-generated hooks keep their kebab names (`use-mobile.ts`).
- Rule modules: `<topic>Rules.ts`. Services: `<topic>Service.ts`. Adapters: `<topic>Adapter.ts`.
- Data modules: `camelCase.ts` describing content (`quickBuildProfiles.ts`).
- Tests: `<module>.test.ts(x)` inside `_tests_/`.
- No `index.ts` except inside a folder-per-component (where it *is* the component).

## 8. Migration Policy (how we get from current to target)

The structure above is enforced **forward**, not retroactively:

1. Every **new** file follows this guide exactly.
2. Opportunistic moves are allowed only when you are already rewriting the file, and the
   move + import updates ship in the same commit with green `typecheck`/`test`.
3. Mass reorganizations (types consolidation, root `hooks/` merge, flat→folder component
   renames) are **dedicated chores**: their own branch/PR, zero behavior change, full suite
   green, and this guide updated if the target changes.
4. Never leave the tree in a mixed state within one domain folder (e.g. half of
   `organisms/sheet/` moved, half not).

## 9. Checklist Before Creating Any File

- [ ] I checked the placement table (§2/§3) and this location matches.
- [ ] The name follows §7.
- [ ] A `_tests_/` test exists next to it (or a documented reason it cannot).
- [ ] Imports use `@/` and respect the dependency direction (§6).
- [ ] No rule math outside `rules/`/`src/adapters/`; no storage access outside `src/services/`.
- [ ] If I created a new folder or convention, this guide was updated in the same change.
