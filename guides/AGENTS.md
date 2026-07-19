# Agent Operating Guide — Forge & Fate

This is the full rulebook for AI agents (and humans) working on this repository.
The root `AGENTS.md` is only a pointer to this file. If you have not read
[`guides/README.md`](README.md), [`MANIFESTO.md`](MANIFESTO.md), and
[`ORGANIZATION.md`](ORGANIZATION.md), stop and read them first.

## 1. Framework Warning

This project uses **Next.js 16 (App Router)** — it has breaking changes relative to most
training data. Before touching routes, layouts, metadata, middleware, or any framework API,
read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices.
This is **not** Vite; any old doc mentioning Vite is obsolete.

## 2. The Ten Non-Negotiables

These come from `MANIFESTO.md` §7 and the delivery ruler. Violating any of them means the
change is wrong, no matter how well it works:

1. **D&D rules never live in React components.** All rule math is a pure function in
   `rules/` or `src/adapters/`, with its own test.
2. **Single derived truth.** UI reads `CharacterSheetSummary` via
   `selectCharacterSheetSummary` (or the cached `characterBuild.derivedSheet` through
   selectors). Never recompute sheet values ad hoc.
3. **`CharacterBuild` is the canonical persisted contract.** Any persisted-shape change
   requires: schema version bump + shared `migrateCharacterBuild(raw, fromVersion)` coverage
   for builder persistence, Vault normalization, and canonical import + fixture-based
   migration tests, in the same PR. Old saves must remain readable forever.
4. **Source isolation is sacred.** Class, species, background, equipment, feats, and spells
   own independent state; one source never mutates or erases another source's choices.
5. **External formats never dictate the internal model.** Foundry VTT and PDF are adapters
   consuming `CharacterSheetSummary`; canonical JSON (`ForgeFateExportV1`) is the only
   round-trip format.
6. **The builder step sequence is canonical** (10 canonical steps; dedicated subclass step introduced in schema v14: classe,
   recursos-classe, subclasse, antecedente, especie, detalhes-especie, atributos,
   equipamento, descricao, conclusao). Never remove, reorder, or bypass steps; adding one
   requires updating `builderStepNavigation.ts`, validation, and these guides together.
7. **No UI path destroys data without explicit confirmation.**
8. **Design tokens only.** No literal colors in app components; tokens live in
   `app/globals.css`. (The PDF adapter may own a small local print palette.)
9. **Accessibility is not optional.** Keyboard access, visible focus, semantic HTML,
   accessible names, WCAG 2.2 AA contrast, reduced motion, mobile + 200% zoom.
10. **English everywhere developer-facing and product-facing.** UI copy, aria-labels,
    commits, PRs, and guide docs in native English. (Some legacy docs/data are pt-BR;
    do not add new pt-BR product copy.)

## 3. Workflow for Every Task

1. **Read the guides** (`guides/README.md` order). Then read the code you will touch —
   never assume structure from memory.
2. **Locate the right layer** with `ORGANIZATION.md`'s placement table. If you are about
   to create a file and its location is not obvious from that table, the location is
   probably wrong — re-read the table.
3. **Write/adjust tests with the change** (Vitest + Testing Library, `_tests_/` folder
   next to the module). Rule modules are tested with real 5e 2024 numbers, not mocks.
4. **Verify before claiming done** — the Definition of Done (MANIFESTO §8):
   - `npm run test` (or a focused subset first, then broaden for shared contracts)
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build` for route/app-shell/export/framework-sensitive changes
   - Browser verification for UI, layout, a11y, or export-download work
5. **Update the guides** if the change altered roadmap status, architecture, contracts,
   folder conventions, or visual rules (`guides/README.md` § Keeping These Guides Alive).

## 4. Hard "Do Not" List for Agents

Recurring mistakes that motivated this folder:

- Do **not** create files outside the structure defined in `ORGANIZATION.md`
  (e.g. dumping components in `app/`, new top-level folders, helpers inside pages).
- Do **not** add calculation logic to `src/store/characterSelectors.ts` — it is a thin
  re-export/orchestrator with a guarded line budget (`selectorPurity.test.ts`).
- Do **not** change `CharacterBuild` without the full schema-bump checklist
  (master plan §26.1.B).
- Do **not** add dependencies outside the approved list (master plan §26.2) without
  registering the justification there first.
- Do **not** write to `localStorage`/`sessionStorage` outside `src/services/` and the
  store's persist middleware. New persisted data gets its own versioned key.
- Do **not** duplicate documentation. One copy, in `guides/`.
- Do **not** import 5etools/Foundry raw shapes into UI or store — normalize through
  `src/services/` + `src/adapters/` first.
- Do **not** use relative deep imports (`../../..`). Use the `@/` alias (maps to repo root:
  `@/src/...`, `@/rules/...`, `@/src/types/...`).
- Do **not** leave `console.log`, placeholder buttons without handlers, or dead code.

## 5. Where Things Live (Quick Map)

Full detail and target-state rules in [`ORGANIZATION.md`](ORGANIZATION.md).

```text
guides/            ← you are here: canonical project guides
app/               Next.js App Router: routes, layouts, globals.css only
public/data/       raw 5e data (5eTools format) — read-only input
src/services/      data access + persistence (Vault, catalogs, preferences)
src/adapters/      normalization + export adapters (5eTools, PDF, spell, feat)
rules/             pure D&D rule modules — no React, fully tested
src/store/         Zustand store, persistence, migrations, selectors
src/components/    Atomic Design: atoms → molecules → organisms → templates → pages (+ ui/)
src/utils/         output adapters & generic helpers (canonicalExport, foundryAdapter)
src/data/          curated static app content (quizzes, glossary, profiles)
src/schemas/       zod schemas
src/types/         ALL domain contracts (imported as @/src/types/<file>)
scripts/           node maintenance scripts (data pruning, lore build)
```

## 6. Commit / PR Conventions

- Conventional commits in English: `feat(builder): ...`, `fix(sheet): ...`,
  `chore(security): ...`, `feat(docs): ...`.
- One logical change per commit; schema bumps ship with their migrations and tests in the
  same commit/PR.
- PR descriptions state what changed, why, and which verification commands ran. When a
  persisted shape changed, paste the schema-bump checklist (master plan §26.1.B) filled in.
