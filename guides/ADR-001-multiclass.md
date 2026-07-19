# ADR-001: Multiclass Architecture

Status: Proposed for post-v1 implementation.

Date: 2026-07-16.

## Context

Forge & Fate v1 is built around a single selected class in `CharacterBuild`, while the rules engine already separates persisted character choices from derived sheet truth through `CharacterSheetSummary`. Multiclass support changes the meaning of level, proficiencies, class features, subclass choices, spell slots, equipment grants, export mapping, and validation. Adding it directly to UI would violate the project's source-isolation and single-derived-truth rules.

The v1 release remains local/offline and does not implement multiclassing. This ADR preserves the migration direction so post-v1 work can land without rewriting the builder, sheet, Vault, canonical JSON, Foundry export, or PDF adapters.

## Decision

Multiclass will be implemented as a persisted class progression list, not as duplicated class-specific fields inside UI state.

Future shape direction:

```ts
type CharacterClassLevel = {
  classId: string;
  level: number;
  subclassId?: string;
  startingClass?: boolean;
};
```

The future persisted model should replace singular class progression with:

```ts
classLevels: CharacterClassLevel[];
```

Rules modules will receive normalized class progression data and derive:

- total character level from the sum of `classLevels[].level`;
- proficiency bonus from total character level;
- hit points from the starting class plus per-class hit dice at later levels;
- class and subclass features from each class's own level;
- multiclass spell slots from the multiclass caster table;
- class-specific spell preparation/known limits from each class entry;
- saving throw, armor, weapon, skill, and tool proficiencies from multiclass rules;
- starter equipment only from the starting class unless a future rule explicitly grants more.

`CharacterSheetSummary` remains the only UI-facing derived truth. React components must not reason over multiclass math directly.

## Migration Plan

The future schema bump should migrate the current v15 single-class fields into:

```ts
classLevels: [
  {
    classId: selectedClassId,
    level,
    subclassId: selectedSubclassId,
    startingClass: true,
  },
]
```

The migration must run through the shared `migrateCharacterBuild(raw, fromVersion)` path used by builder persistence, Vault normalization, and canonical import.

Schema-bump requirements:

- increment `CHARACTER_BUILD_SCHEMA_VERSION`;
- add fixture coverage for the previous schema;
- update builder persistence migration tests;
- update Vault normalization tests;
- update canonical export/import legacy tests;
- keep Foundry and PDF as adapters over `CharacterSheetSummary`, not direct readers of raw multiclass fields.

## Consequences

This delays multiclass implementation until after v1 export and launch-hardening work, but avoids partial UI-only support that would corrupt saves or exports.

Feature work that touches classes before multiclass should keep function signatures easy to widen from one class to a list of class-progress entries. It should not add new assumptions that only one class can ever contribute features, spellcasting, or proficiencies.

## Non-Goals For V1

- Implementing multiclass UI.
- Migrating `CharacterBuild` to `classLevels`.
- Supporting multiclass spell-slot calculation in the current v15 schema.
- Changing canonical export format for multiclass before the schema bump exists.
