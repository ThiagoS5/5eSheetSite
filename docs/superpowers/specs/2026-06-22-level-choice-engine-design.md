# Design — Engine de Escolhas por Nível (Fase 1 do Level-Up)

> Status: aprovado no brainstorming · Data: 2026-06-22
> Escopo: **apenas a Fase 1** (lógica pura, sem UI). Fases 2 (componente `LevelUpFlow`) e 3 (integração wizard/ficha) têm specs próprios.

## 1. Contexto e objetivo

O `setLevel` já existe no store e o MVP de PV/features já é level-aware, mas **nada modela as escolhas que cada nível exige** (subclasse no 3, ASI/talento no 4/8/12/16/19, opções de feature). Esta fase entrega o **engine** que, dado classe + nível, sabe *quais escolhas um nível exige* e *como as escolhas feitas afetam a ficha* — a fundação que as fases de UI vão consumir.

Decisão arquitetural que dissolve a pergunta "ficha vs. wizard": o level-up não vive em nenhuma das duas. Existe **um fluxo/engine compartilhado**; wizard (níveis 1→N iniciais) e ficha (N→N+1 vivo) são apenas pontos de entrada que o invocam. Esta Fase 1 é a camada de regras desse fluxo.

### Fora de escopo (fronteiras explícitas)
- Qualquer UI (Fase 2).
- Slots/preparação de magia (projeto "Magias").
- Multiclasse (`selectedClassId` continua singular; subclasse modelada de forma que migre para `classes[]` depois sem retrabalho).
- Re-validação profunda de pré-requisitos de escolhas já gravadas (apenas "está preenchida?" + legalidade básica).

## 2. Arquitetura e fronteiras de módulo

Três unidades novas, puras (sem React), seguindo as camadas do manifesto:

```
rules/levelProgression.ts        getLevelRequirements(class, fromLevel, toLevel): LevelChoiceRequirement[]
                                 Classifica features → requisitos. Lógica pura.

src/adapters/featCatalog.ts      getFeats(), getSelectableFeats(category, ctx), meetsPrerequisite(feat, ctx)
                                 Catálogo de talentos a partir de feats.json + regra de pré-requisito.

src/store/levelChoiceResolver.ts getUnresolvedLevelChoices(state), collectAsiBonuses(state),
                                 getActiveSubclassFeatures(state). Costura engine ↔ estado.
```

Data layer adicional: `getSubclassesForClass(classId)` (no `ruleService`/adapter) expondo `subclass[]` já presente nos dados 5etools.

**Princípio:** o engine não conhece React nem o store. O `selectCharacterSheetSummary` é o único ponto que costura tudo, preservando a verdade derivada única.

## 3. Modelo de dados e persistência

### Tipos de requisito (`rules/levelProgression.ts`)

```ts
type LevelChoiceRequirement =
  | { id: string; kind: "subclass";       level: number }
  | { id: string; kind: "asi-or-feat";    level: number }
  | { id: string; kind: "feature-option"; level: number;
      featureName: string; count: number; options: BuilderChoiceOption[] };
```

### Onde cada escolha persiste

- **Subclasse** → `choices.selectedSubclassId` (**campo novo**, singular, espelha `selectedClassId`). É propriedade do personagem (features desbloqueiam em vários níveis). Migra para `classes[]` quando a multiclasse chegar.
- **ASI/Talento** → `progression.levelChoices[nível].asiOrFeat` (**campo novo**):
  ```ts
  type AsiOrFeatChoice =
    | { mode: "asi";  increases: Partial<Record<AttributeKey, number>> }       // {forca:2} ou {forca:1, destreza:1}
    | { mode: "feat"; featId: string; asi?: Partial<Record<AttributeKey, number>> }; // half-feat carrega o ASI aqui
  ```
- **feature-option** → `classFeatureChoices` (já existe), agora por nível.

```ts
interface CharacterBuildLevelChoiceState {
  asiOrFeat?: AsiOrFeatChoice;                   // NOVO
  classFeatureChoices: Record<string, string[]>; // já existe
}
```

### ASI não muta `baseAttributes`
Atributos finais permanecem derivados: o resolver agrega os deltas de ASI/half-feat (todos os níveis ≤ atual) num `AttributeBonuses`, somado a `backgroundAbilityBonuses` antes de `calculateFinalAttributes`. `baseAttributes` (point-buy/array original) nunca é mutado.

### Bump de schema
`CHARACTER_BUILD_SCHEMA_VERSION` **3 → 4**. Migração v3→v4: adiciona `choices.selectedSubclassId = ""`; `levelChoices` é retrocompatível (campo novo opcional). Coberta por teste em `characterStore.persist.test.ts`.

## 4. Classificação de features → requisitos

### Pequena melhoria no adapter (justificada)
`normalizeClassFeature` hoje descarta `gainSubclassFeature`. Estender `BuilderFeature`:
```ts
interface BuilderFeature {
  name: string; level?: number; description: string; blocks?: BuilderFeatureBlock[];
  grantsSubclass?: boolean;   // NOVO — propagado de gainSubclassFeature
}
```

### `getLevelRequirements(class, fromLevel, toLevel)`
Percorre `class.allFeatures` no intervalo `(fromLevel, toLevel]`:

| Sinal na feature | Requisito |
|---|---|
| `grantsSubclass === true` | `{ kind: "subclass" }` — **deduplicado**: um só requisito, no menor nível que concede subclasse. |
| `name === "Ability Score Improvement"` | `{ kind: "asi-or-feat" }` |
| casa com `featureChoiceGroup` da classe | `{ kind: "feature-option", featureName, count, options }` |
| demais | nenhum (ganho automático; já entra na derivação de features-por-nível do MVP) |

**Única classificação por nome:** ASI não é flagado nos dados; usa-se a feature canônica `"Ability Score Improvement"` (nome estável no SRD 2024), isolada numa constante em `rules/`. Todo o resto é estrutural.

## 5. Catálogo de talentos e pré-requisitos (`src/adapters/featCatalog.ts`)

```ts
interface BuilderFeat {
  id: string; name: string; source: string;
  category: "origin" | "general" | "fighting-style" | "epic-boon";
  prerequisites: FeatPrerequisite[];   // OU entre entradas; cada entrada é um E de condições
  abilityBonus?: FeatAbilityBonus;      // half-feat
  repeatable: boolean;
  description: string;
}
```

- `getFeats()` — normaliza `feats.json` (2024/XPHB); mapeia `category` (`G→general`, `O→origin`, `FS*→fighting-style`, `EB→epic-boon`).
- `getSelectableFeats(category, ctx)` — filtra por categoria (**General** nos níveis de ASI) e `meetsPrerequisite`; exclui não-`repeatable` já escolhidos.
- `meetsPrerequisite(feat, ctx)` — `prerequisite` é **OU** de entradas (**E** interno). Fase 1 cobre `level`, `ability` (limiares) e `feat` (cadeia). `campaign`/`race`/`background` ficam permissivos com `// TODO`.

**Half-feat:** com `mode: "feat"` e `abilityBonus`, o jogador resolve o `choose` (ex.: +1 em Força) → gravado em `asiOrFeat.asi`; somado pelo resolver.

**`ctx` de pré-requisito:** quem chama passa `{ finalAttributes, level, chosenFeatIds }`. Limiares de atributo são checados contra os atributos **acumulados até aquele nível** (incluindo ASI anterior); cadeia de talentos usa os já escolhidos.

## 6. Resolver e integração na verdade derivada (`src/store/levelChoiceResolver.ts`)

```ts
getUnresolvedLevelChoices(state): UnresolvedChoice[]   // {level, kind, label}
collectAsiBonuses(state): AttributeBonuses
getActiveSubclassFeatures(state): BuilderFeature[]
```

`getUnresolvedLevelChoices` percorre `1..currentLevel`, chama `getLevelRequirements` e verifica cada requisito:
- `subclass` → satisfeito se `selectedSubclassId` definido **e** pertence à classe (via `getSubclassesForClass`).
- `asi-or-feat` → satisfeito se `levelChoices[nível].asiOrFeat` existe e é válido (ASI soma os pontos corretos; feat existe no catálogo).
- `feature-option` → contagem correta em `classFeatureChoices`.

### Encaixe no `selectCharacterSheetSummary`
1. `asiBonuses = collectAsiBonuses(state)` — só soma números gravados; **sem circularidade**.
2. `finalAttributes = calculateFinalAttributes(base, merge(backgroundAbilityBonuses, asiBonuses))` → ASI reflete em PV (CON), CD de magia, perícias, iniciativa.
3. `features = [...classFeaturesUpToLevel, ...getActiveSubclassFeatures(state), ...]`.
4. `validationMessages = [...existentes, ...getUnresolvedLevelChoices(state).map(toMessage)]`.

**Ordem:** ASI entra antes do cálculo de PV — subir CON recalcula PV retroativamente em todos os níveis (como no 5e). Funciona "de graça" porque o PV já é level-aware.

## 7. Estratégia de testes (DoD)

TDD com dados reais (sem mocks):

- **`rules/levelProgression.test.ts`** — dedup de subclasse (Fighter 0→3 = 1 requisito); ASI em 4 e 8; `feature-option` no nível 1; classe sem subclasse num intervalo → nenhum.
- **`featCatalog.test.ts`** — mapeamento de categorias; `meetsPrerequisite` (level, ability passa/não, cadeia de feat, repeatable excluído); half-feat parseado.
- **`levelChoiceResolver.test.ts`** — `collectAsiBonuses` soma ASI + half-feat de vários níveis; pendências (ASI vazio reportado, preenchido some, subclasse ausente/errada reportada); `getActiveSubclassFeatures` filtra por nível.
- **`characterSelectors.test.ts`** — ASI +2 CON no nível 4 eleva `finalAttributes.constituicao` e recalcula `maxHp`; features de subclasse aparecem após seleção; pendência de nível em `validationMessages`.
- **`characterStore.persist.test.ts`** — save v3 migra para v4 (`selectedSubclassId=""`, `levelChoices` preservado, `schemaVersion=4`).

**Gates:** `vitest run` 100% verde · `tsc --noEmit` limpo · `eslint` nos arquivos tocados · bump v3→v4 com teste de migração · verdade derivada única preservada.

## 8. Resumo das mudanças de arquivo

| Arquivo | Mudança |
|---|---|
| `rules/levelProgression.ts` | **novo** — `getLevelRequirements` + tipos de requisito |
| `src/adapters/featCatalog.ts` | **novo** — catálogo de talentos + `meetsPrerequisite` |
| `src/store/levelChoiceResolver.ts` | **novo** — pendências, `collectAsiBonuses`, features de subclasse |
| `types/builder.ts` | `BuilderFeature.grantsSubclass`; tipos `BuilderFeat`, `FeatPrerequisite` |
| `src/types/characterBuild.ts` | `choices.selectedSubclassId`; `levelChoices[n].asiOrFeat`; bump versão 3→4 |
| `src/adapters/fiveEToolsAdapter.ts` | propagar `gainSubclassFeature`; `getSubclassesForClass` |
| `src/services/ruleService.ts` | expor `getSubclassesForClass` / `getFeats` |
| `src/store/characterBuildModel.ts` + `createCharacterStore.ts` | migração v3→v4; serialização de `selectedSubclassId`/`asiOrFeat` |
| `src/store/characterSelectors.ts` | integrar ASI em `finalAttributes`, features de subclasse, pendências |
