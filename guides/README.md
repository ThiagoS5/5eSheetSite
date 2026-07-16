# Forge & Fate — Guides (READ THIS FIRST)

> **This folder is the mandatory entry point for every AI agent and every human contributor.**
> Do not read source code, plan a change, or write a single line before reading the documents
> listed below, in the order below. Root `AGENTS.md` / `CLAUDE.md` point here on purpose.

## Mandatory Reading Order

Read 1–3 before **any** change. Read the rest based on what you are touching.

| # | Document | What it gives you | When it is mandatory |
| --- | --- | --- | --- |
| 1 | [`AGENTS.md`](AGENTS.md) | Agent operating rules: where code goes, what is forbidden, workflow, verification | Always |
| 2 | [`MANIFESTO.md`](MANIFESTO.md) | Product north star, architecture map, non-negotiable engineering rules, Definition of Done | Always |
| 3 | [`ORGANIZATION.md`](ORGANIZATION.md) | Folder structure (Atomic Design), naming, test placement, import conventions, "where does file X go" | Always, before creating or moving any file |
| 4 | [`project-delivery-ruler.md`](project-delivery-ruler.md) | Delivery gates, current baseline, mandatory next order of work, permanent acceptance criteria | Before picking or prioritizing work |
| 5 | [`AUDITORIA.md`](AUDITORIA.md) | Latest audit snapshot: phase status, evidence, risks, recommended next work | Before picking work; after finishing a phase, update it |
| 6 | [`DESIGN.md`](DESIGN.md) | Visual grammar: tokens, typography, motion, layout, anti-patterns, a11y | Any UI/visual change |
| 7 | [`PRODUCT.md`](PRODUCT.md) | Users, product purpose, brand personality, anti-references | Product/UX decisions and copy |
| 8 | [`forge-fate-master-plan.md`](forge-fate-master-plan.md) | Full phase-by-phase roadmap (F1–F10) with per-phase scope, acceptance and status. Partly historical — see its header | Deep context on a specific phase or contract |
| 9 | [`ADR-001-multiclass.md`](ADR-001-multiclass.md) | Post-v1 multiclass architecture decision, schema direction, migration constraints | Before any multiclass implementation or class-progression schema work |

## Conflict Resolution Order

When documents disagree, this precedence wins (highest first):

1. `MANIFESTO.md`
2. `project-delivery-ruler.md`
3. `forge-fate-master-plan.md`
4. `PRODUCT.md`
5. `DESIGN.md`

`AUDITORIA.md` is a dated snapshot, not a rulebook: it describes state, it does not override rules.
`ORGANIZATION.md` is authoritative for file/folder placement only.

## Keeping These Guides Alive

The guides are part of the deliverable. A change is not done (see MANIFESTO §Definition of Done) if it invalidates a guide without updating it:

- Finished a roadmap phase or shipped a milestone → update `AUDITORIA.md` (status + date) and the status lines in `forge-fate-master-plan.md` §22.
- Changed architecture, layers, or a public contract (`CharacterBuild`, `CharacterSheetSummary`) → update `MANIFESTO.md` §6–§7 and the ruler's baseline.
- Created a new folder or file-placement convention → update `ORGANIZATION.md`.
- Changed visual tokens, component vocabulary, or a11y rules → update `DESIGN.md`.
- New agent rule or recurring agent mistake → update `AGENTS.md` here (root `AGENTS.md` stays a thin pointer).

Never fork these documents. There is exactly one copy of each, in this folder. Root-level
`AGENTS.md` and `CLAUDE.md` exist only because agent harnesses auto-load them; they must stay
thin pointers to this folder.
