<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# STOP — Read `guides/` before any change

This file is intentionally thin. The canonical project guides live in the **`guides/`**
folder, and reading them is mandatory **before reading source code or writing any code**:

1. [`guides/README.md`](guides/README.md) — index, mandatory reading order, conflict resolution.
2. [`guides/AGENTS.md`](guides/AGENTS.md) — full agent operating rules and "do not" list.
3. [`guides/MANIFESTO.md`](guides/MANIFESTO.md) — product north star and non-negotiable architecture rules.
4. [`guides/ORGANIZATION.md`](guides/ORGANIZATION.md) — folder structure (Atomic Design) and file placement. Consult before creating or moving any file.

Hard invariants (details in the guides): rules never live in React components; UI consumes
`CharacterSheetSummary` via `selectCharacterSheetSummary` (single derived truth); external
adapters (Foundry, PDF) never dictate the internal model; every `CharacterBuild` shape change
requires schema bump + migration + tests on both persistence paths; source isolation is
sacred; product UI, a11y labels, commits, PRs, and guide docs stay in native English.

Do not duplicate guide content here — update the files in `guides/` instead.
