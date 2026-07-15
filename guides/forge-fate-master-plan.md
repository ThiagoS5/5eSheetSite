# Forge & Fate — Master Plan

> **Documento mestre do projeto.** Este arquivo consolida visão, estado atual, arquitetura-alvo, contratos de domínio, roadmap por fases e critérios de aceite do Forge & Fate. Ele complementa (não substitui) o `MANIFESTO.md`: o Manifesto define a estrela-guia; este plano define **o caminho ordenado até ela**. Ao concluir uma fase, atualize a seção 2 (Estado Atual) e a tabela da seção 22.
>
> **⚠️ Nota de atualização (2026-07-15):** as **Fases 1–9 estão concluídas** (status por fase na seção 22) e o schema atual é `CHARACTER_BUILD_SCHEMA_VERSION = 14`. As seções 2–21 descrevem a auditoria de planejamento de 2026-07-06 (schema v10) e permanecem como **registro histórico e racional das decisões** — para o estado atual consolidado, leia `AUDITORIA.md` e `project-delivery-ruler.md` nesta mesma pasta (`guides/`). Em conflito, vale a ordem: `MANIFESTO.md` → `project-delivery-ruler.md` → este plano.
>
> **Data da auditoria original:** 2026-07-06 · **Schema na época:** v10 · **Schema atual:** v14

---

## 1. Visão do Produto

**O que é.** O Forge & Fate é um construtor web completo de personagens de **Dungeons & Dragons 5e (regras 2024)**: criação guiada em wizard de 9 etapas, ficha viva calculada automaticamente, cofre de personagens (Vault), progressão do nível 1 ao 20, export para JSON canônico, Foundry VTT e PDF imprimível.

**Público-alvo.** Dois perfis simultâneos, sem sacrificar nenhum:

1. **Jogador iniciante** — nunca jogou D&D. Precisa que o sistema explique *o que* está escolhendo e *por que* isso importa na mesa. Hoje o site pressupõe conhecimento prévio; isso muda com o **Modo Iniciante** (seção 9).
2. **Jogador veterano** — quer montar uma ficha correta em minutos, sem fricção didática. As explicações devem ser opcionais, discretas e desligáveis.

**Proposta de valor.** Uma ficha **matematicamente impecável** (verdade derivada única), **portátil** (JSON reimportável, Foundry, PDF) e **viva** (level-up pós-criação sem reabrir o wizard), com identidade visual dark fantasy — "painel tático avançado", não formulário corporativo.

**Experiência esperada.** Do clique em "Criar Personagem" até uma ficha jogável: cada escolha alimenta imediatamente a ficha viva lateral; nenhuma escolha é perdida ao voltar etapas; pendências são visíveis o tempo todo; ao concluir, o personagem está no Vault, exportável e evoluível.

---

## 2. Estado Atual do Projeto

### 2.1 Stack real (confirmada no `package.json`)

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | **Next.js 16.2.9** (App Router, `app/`) | ⚠️ Next 16 tem breaking changes — consultar `node_modules/next/dist/docs/` antes de codar. **Não é Vite**; qualquer doc antiga citando Vite é obsoleta. |
| UI | React 19.2.4, TypeScript 5 | |
| Estado | Zustand 5 (`persist` + `migrate`) | Wizard em `sessionStorage`, Vault em `localStorage`. |
| Estilos | Tailwind CSS 4 (CSS-first, tokens OKLCH em `app/globals.css`) | Sem `tailwind.config`; tokens documentados no `MANIFESTO.md` §4.1. |
| Componentes | shadcn/ui (`src/components/ui/`), Radix UI, `radix-ui` | |
| Ícones | lucide-react + Font Awesome (`src/components/atoms/FontAwesomeIcon.tsx`) | |
| Formulários | react-hook-form + zod 4 (`src/schemas/personalDetailsSchema.ts`) | |
| Testes | Vitest 4 + Testing Library + jsdom (`vitest.config.ts`) | |
| Toasts | sonner | |

### 2.2 O que já existe (✅)

| Capacidade | Onde |
|---|---|
| Contrato canônico `CharacterBuild` v10 (`draft/progression/choices/playState/derivedSheet/exportMetadata`) | `src/types/characterBuild.ts` |
| Vault (listar/salvar/duplicar/excluir, normalização na leitura, cache) | `src/services/characterService.ts` (`localStorage forge-fate-character-saves:v1`) |
| Dashboard de heróis | `src/components/pages/Dashboard.tsx`, `organisms/CharacterRoster.tsx`, `molecules/CharacterCard.tsx` |
| Wizard de 9 etapas com rota dinâmica | `app/builder/[step]/page.tsx`, `src/components/templates/builderStepNavigation.ts`, `BuilderShell.tsx`, `organisms/BuilderSidebar.tsx` |
| Verdade derivada única | `src/store/characterSelectors.ts` → `selectCharacterSheetSummary()` |
| Matemática base (mod, PB por nível, atributos finais, PV médio 2024, CA) | `src/adapters/characterDerivedAdapter.ts` |
| Regras puras fora da UI | `rules/builderValidation.ts`, `rules/pointBuyRules.ts`, `rules/levelProgression.ts`, `rules/itemCatalogFilters.ts` |
| Persistência versionada com migrações (v1→v10) + testes | `src/store/createCharacterStore.ts`, `characterBuildModel.ts`, `_tests_/characterStore.persist.test.ts`, `schemaV*Migration.test.ts` |
| Level-up parcial (UI de subclasse, ASI/feat, feature-option) | `src/components/organisms/levelup/*` + `src/store/levelChoiceResolver.ts` |
| Catálogo de feats com pré-requisitos | `src/adapters/featCatalog.ts` (`normalizeFeats`, `meetsPrerequisite`, `getSelectableFeats`) |
| Catálogo de itens + inventário real com busca/filtros/badges, skeletons, carga derivada e equipar/desequipar | `src/services/itemCatalogService.ts`, `src/adapters/itemCatalogAdapter.ts`, `organisms/InventoryManager.tsx`, `EquipmentChecklist.tsx`, `rules/armorClassRules.ts`, `rules/attackRules.ts` |
| Equipamento isolado por fonte (`equipmentChoicesBySource`) + modo ouro | `EquipmentChecklist.tsx`, `deriveStartingGoldPo()` |
| Export Foundry VTT | `src/utils/foundryAdapter.ts` (consome `CharacterSheetSummary`) |
| Play mode persistido (PV atual/temp, death saves, condições, inspiração, slots gastos) | `playState` em `CharacterBuild`, `rules/playStateSummaryRules.ts`, `organisms/sheet/*` |
| Página de ficha (sheet) com tema, modais de skill/item, death saves e painéis de jogo | `src/components/pages/CharacterSheetPage.tsx`, `organisms/sheet/*` |
| Spellcasting derivado (CD, ataque mágico, slots, escolhas por classe) | `rules/spellcastingRules.ts`, `types/spells.ts`, `organisms/spells/SpellCatalogPicker.tsx`, `CharacterSheetSummary.spellcasting` |
| AST de texto de regras e render unificado | `src/adapters/rulesTextAst.ts`, `types/rulesText.ts`, `molecules/RulesTextView.tsx`, golden tests |
| Dados 5e brutos (classes, spells, feats, itens, espécies, antecedentes, idiomas) | `public/data/**` (~9 MB, formato 5eTools + espelhos foundry-*) |
| Descrições de perícias pt-BR | `src/data/skillDescriptions.ts` |

### 2.3 O que está parcial (🟡)

- **Progressão 1–20:** derivação é level-aware (PB, PV, features por nível) e `rules/levelProgression.ts` calcula requisitos de subclasse/ASI/feature por intervalo de nível; o `LevelUpFlow` já cobre subclasse, ASI/feat, feature-options e PV por nível, mas ainda não fecha recursos com usos por feature em todos os casos.
- **Feats:** catálogo e pré-requisitos existem; **efeitos mecânicos dos feats não são aplicados** na ficha derivada (só ASI embutido via `collectAsiBonuses`).
- ~~**Ataques/armas:** stub `+PB`/`damage: "—"`~~ — **resolvido na F1** (`rules/attackRules.ts`: atributo correto, finesse, ranged, proficiência por categoria, dano real com breakdown).
- ~~**Testes de resistência:** proficiência por *label* pt-BR~~ — **resolvido na F1** (`rules/savingThrowRules.ts` calcula por `AttributeKey` via `normalizeSavingThrowAttributes`).
- **Magias:** domínio funcional para spellcasting derivado, slots e catálogo de escolha; feats/subclasses que concedem magias especiais ainda precisam de efeitos mecânicos completos.
- **Inventário:** normalização real, peso/carga, CA/ataques por itens equipados e catálogo navegável existem; conflitos avançados e efeitos mágicos textuais ainda ficam como dados descritivos.
- **Renderização de texto:** AST e `RulesTextView` existem com golden tests; `textParser.tsx` permanece só como legado a ser removido quando nenhum consumidor histórico depender dele.
- ~~**Selector gigante:** `characterSelectors.ts` acumula regra~~ — **resolvido na F1**: regra extraída para `rules/skillRules|savingThrowRules|attackRules|armorClassRules|pendencyRules`; a montagem do summary vive em `rules/characterSheetSummaryRules.ts` (orquestrador, com orçamento de linhas guardado por `selectorPurity.test.ts`); `characterSelectors.ts` é um re-export fino.

### 2.4 O que falta (⛔)

- **Efeitos especiais de magias/itens/feats** além dos campos estruturados já normalizados.
- **Subclasse no wizard/dados normalizados por classe** — `selectedSubclassId` existe no contrato; a normalização de subclasses de `public/data/class/*.json` é parcial (só features ativas via `levelChoiceResolver`).
- ~~**Modo Iniciante** (modal inicial + ajuda contextual).~~ — resolvido na F3.
- **Export JSON canônico + import** (hoje só Foundry).
- **PDF imprimível.**
- **Epic Boons** e separação formal Origin/General/Epic no catálogo de feats.
- **Multiclasse** (contrato é singular: `choices.selectedClassId`).
- **Sentidos, resistências, imunidades** ainda precisam de cobertura completa por fonte/feature especial.

### 2.5 Riscos imediatos identificados na auditoria

1. 🔴 **CRÍTICO — Persistência dupla e sincronização** — wizard persiste flat state em `sessionStorage` (`ficha-5e-builder`) e o Vault em `localStorage` (`forge-fate-character-saves:v1`). São **dois caminhos de migração independentes**: o `migrate` do persist middleware (builder) e o `normalizeCharacterBuild` na leitura do Vault. Uma mudança de shape migrada em só uma das pontas **corrompe silenciosamente** a outra — o bug só aparece quando o usuário retoma um personagem antigo. Salvaguardas obrigatórias na seção 26.1.
2. 🟡 **Atenção — Verdade derivada precisa continuar isolada** — a F1 extraiu a engine para `rules/*` e `rules/characterSheetSummaryRules.ts`; fases novas devem continuar entrando como regra pura testada, não como cálculo inline no selector. Salvaguardas obrigatórias na seção 26.1.
3. **`skillModifierOverrides`** permite ficha inconsistente com a engine — manter como override explícito e sinalizado (`isOverridden`), nunca como caminho normal de cálculo.

---

## 3. Princípios de Produto

1. **Ficha como documento vivo** — a ficha não termina na conclusão do wizard; level-up, inventário e magias evoluem depois, sempre recalculados pela engine.
2. **Wizard utilitário** — as 9 etapas existem para *produzir uma ficha jogável*, não para exibir conteúdo. Cada etapa consome escolhas anteriores e produz dados para as seguintes.
3. **Dados reaproveitados** — a classe escolhida na etapa 1 determina recursos (etapa 2), perícias, PV, equipamento (etapa 7), magias e subclasse. Nada é perguntado duas vezes.
4. **Iniciante guiado** — quem nunca jogou consegue terminar uma ficha correta entendendo o que escolheu (Modo Iniciante, seção 9).
5. **Veterano eficiente** — zero fricção obrigatória; explicações são opt-in/opt-out; navegação por teclado rápida.
6. **Regra confiável** — todo número exibido vem de `selectCharacterSheetSummary` / engine pura, coberta por testes unitários. Nunca da UI.
7. **Export portátil** — o personagem sai da plataforma: JSON canônico reimportável (formato interno), Foundry VTT (adapter externo), PDF (adapter externo).
8. **Reversível e sem perda** — voltar etapas nunca apaga escolhas; excluir exige confirmação; ficha incompleta é retomável do Dashboard.

---

## 4. Princípios de Arquitetura

Camadas com dependência unidirecional (UI depende de tudo; nada depende da UI):

```
public/data/*.json  (dados 5e brutos, formato 5eTools)
        │
        ▼
src/services/        acesso a dados: ruleService, raw5eService, itemCatalogService,
                     characterService (Vault), [novo] spellService
        │
        ▼
src/adapters/        normalização + matemática: fiveEToolsAdapter, itemCatalogAdapter,
                     characterDerivedAdapter, featCatalog, [novos] spellAdapter, pdfAdapter
        │
        ▼
rules/               regras puras sem React: builderValidation, pointBuyRules,
                     levelProgression, itemCatalogFilters, [novos] attackRules,
                     armorClassRules, spellcastingRules, savingThrowRules
        │
        ▼
src/store/           Zustand: flat state + ações + persist/migrate +
                     selectCharacterSheetSummary (orquestra a engine, não implementa regra)
        │
        ▼
src/components/      Atomic Design (atoms → molecules → organisms → templates → pages)
                     + ui/ (shadcn). Renderiza CharacterSheetSummary; dispara ações.
        │
        ▼
src/utils/           adapters de saída: foundryAdapter, [novos] canonicalExport, textParser→AST
```

**Invariantes (do `MANIFESTO.md` §8, reafirmados):**

- **Verdade derivada única:** PV/CA/modificadores/validações vêm de `selectCharacterSheetSummary` — componentes React **nunca** recalculam regra.
- **Source isolation:** escolhas de Classe/Antecedente/Espécie vivem em estados separados (`equipmentChoicesBySource` é a implementação de referência).
- **Persistência versionada:** mudou o shape de `CharacterBuild` → bump `CHARACTER_BUILD_SCHEMA_VERSION` + migração + teste.
- **Adapters externos isolados:** Foundry e PDF consomem `CharacterSheetSummary` (e o JSON canônico consome `CharacterBuild`); nenhum formato externo contamina o modelo interno.
- **Regra evolutiva do selector:** `selectCharacterSheetSummary` deve **orquestrar** funções puras; qualquer novo cálculo entra como função em `rules/` ou `src/adapters/` com teste próprio, nunca inline no selector.

---

## 5. Contrato de Domínio

### 5.1 `CharacterBuild` (auditado na época em schema v5 — hoje v14; as "extensões planejadas" abaixo já aterrissaram)

O contrato existente já tem os cinco blocos exigidos. Abaixo, o papel de cada um e as extensões planejadas (cada extensão = bump de schema + migração):

#### `draft` — estado temporário de navegação/edição

Hoje: `currentStepSlug`, `maxUnlockedStepIndex`, `pendingChoiceIds`, `inventory` (temporário), `equipmentChoicesBySource`, `description`.

Regras: nada em `draft` afeta cálculo diretamente — é UX (onde o usuário está, o que falta). Extensões planejadas: nenhuma estrutural; `pendingChoiceIds` passa a ser **derivado** (a engine calcula pendências; o campo persiste só como cache, como já ocorre com `derivedSheet`).

#### `progression` — progressão mecânica por nível

Hoje: `level`, `levelChoices: Record<levelStr, { asiOrFeat?, classFeatureChoices }>`.

Extensões planejadas (Fase 2/5):

```ts
interface CharacterBuildLevelChoiceState {
  asiOrFeat?: AsiOrFeatChoice;                 // existente
  classFeatureChoices: Record<string, string[]>; // existente
  hpRoll?: number | "average";                 // NOVO: PV ganho no nível (rolado ou média)
  spellsLearned?: string[];                    // NOVO: ids de magias aprendidas neste nível
  spellsReplaced?: { removed: string; added: string }[]; // NOVO: troca (classes "known")
}
```

Multiclasse futura (Fase 10) entra aqui como `classLevels: { classId: string; level: number }[]` — ver seção 26.

#### `choices` — decisões consolidadas

Hoje: `ruleset`, `selectedSpeciesId`, `selectedClassId`, `selectedSubclassId`, `selectedBackgroundId`, `classSkillProficiencies`, `skillTraining`, `classFeatureChoices`, `speciesChoices`, `speciesLanguages`, `attributeGenerationMethod`, `baseAttributes`, `backgroundAbilityBonuses`, `money`, `moneyTouched`, `carriedLoadKg`, `skillModifierOverrides`.

Extensões planejadas:

```ts
interface CharacterBuildChoices {
  // ...existente...
  spellcasting?: {                    // NOVO (Fase 5)
    cantripIds: string[];
    knownSpellIds: string[];          // classes "known" (bardo, feiticeiro…)
    preparedSpellIds: string[];       // classes "prepared" (clérigo, mago…)
  };
  beginnerMode?: boolean;             // NOVO (Fase 3) — preferência didática do save
  creationPreferences?: {             // NOVO (Fase 2) — "Etapa 0" estilo DDB, via dialog no header
    activeSources: string[];          // fontes de dados habilitadas (badges/filtros nos catálogos)
    progressionMode: "xp" | "milestone";
  };
}
```

`AttributeGenerationMethod` ganha o quarto método `"roll-4d6"` (rolagem 4d6 descarta o menor, com reordenação dos resultados — Fase 2, mesmo bump).

#### `playState` (novo bloco — Fase 5b, "modo de jogo")

Estado de mesa mutável, separado de `choices` (decisões de construção) e de `derivedSheet` (valores calculados). Sem ele, a ficha não é jogável na sessão:

```ts
interface CharacterBuildPlayState {
  currentHp: number;                  // PV atual (dano/cura)
  tempHp: number;
  hitDiceSpent: number;
  usedSpellSlots: Record<number, number>;   // por círculo
  resourceUses: Record<string, number>;     // usos gastos por recurso (Fúria, Canalizar…)
  deathSaves: { successes: number; failures: number };
  inspiration: boolean;
  conditions: string[];
  overrides?: { maxHp?: number; armorClass?: number }; // ajustes manuais sinalizados (padrão skillModifierOverrides)
}
```

Regras: descanso curto/longo são **ações do store** que resetam campos conforme a engine (`rules/restRules.ts`); overrides aparecem na UI com badge "manual" e botão de reset.

#### `derivedSheet` — só valores calculados (cache de `CharacterSheetSummary`)

Recalculado a cada gravação por `selectCharacterSheetSummary`. **Nunca é fonte de verdade**: no load, a engine recalcula; `derivedSheet` serve para o Dashboard exibir classe/nível/PV sem hidratar a engine, e para export. Campos completos na seção 17.

#### `exportMetadata`

Hoje: `schemaVersion`, `saveId`, `createdAt`, `updatedAt`. Extensão planejada (Fase 8): `exportVersion` gravado **no arquivo exportado** (não no save) — o save usa `schemaVersion`; o envelope de export usa `formatVersion` próprio (seção 19).

### 5.2 Modelos derivados necessários (novos types)

| Type | Onde | Papel |
|---|---|---|
| `BuilderSubclass` | `types/builder.ts` | Subclasse normalizada: `id`, `name`, `classId`, `unlockLevel`, `features[]` (Fase 2). |
| `BuilderSpell` | `types/spells.ts` (novo) | Magia normalizada — seção 15 (Fase 5). |
| `SpellcastingProfile` | `types/spells.ts` | Perfil por classe: habilidade, tipo (known/prepared), tabela de slots, cantrips por nível (Fase 5). |
| `NormalizedInventoryItem` | `types/builder.ts` | Item com peso/dano/propriedades/CA/conflitos — seção 16 (Fase 6). |
| `SheetAttack` | `types/builder.ts` | Substitui `SheetWeapon` stub: bônus real, dano real, atributo usado (Fase 1). |
| `RulesTextNode` (AST) | `types/rulesText.ts` (novo) | AST de texto de regras — seção 18 (Fase 7). |
| `ForgeFateExportV1` | `types/export.ts` (novo) | Envelope do JSON canônico — seção 19 (Fase 8). |

---

## 6. Arquitetura de Estado e Persistência

### 6.1 Como é hoje (preservar)

- **Store do builder** (`src/store/createCharacterStore.ts`): Zustand com `persist` em `sessionStorage` (`ficha-5e-builder`), estado *flat* (`FlatCharacterBuilderState`) + ações (`CharacterBuilderActions`), `migrate` por versão, `extractFlatState`.
- **Serialização** (`src/store/characterBuildModel.ts`): flat ↔ `CharacterBuild`, `normalizeFlatState`, `deriveSheet`, defaults, `createSaveId`, `getStepHref`.
- **Vault** (`src/services/characterService.ts`): `localStorage` (`forge-fate-character-saves:v1`), mapa `saveId → CharacterBuild`, normaliza/migra todo build **na leitura**, cache com invalidação por raw value, evento `forge-fate-character-saves:changed` para sincronizar Dashboard.
- **Hooks**: `useCharacterStore.tsx`, `useCharacterBuilderState.ts`.

### 6.2 Regras de evolução

1. **Toda mudança de shape persistido**: bump `CHARACTER_BUILD_SCHEMA_VERSION`, escrever migração em `createCharacterStore.ts` (flat) **e** garantir que `normalizeCharacterBuild` cobre o Vault, com teste em `characterStore.persist.test.ts` + teste dedicado (padrão de `schemaV5Migration.test.ts`).
2. **Autosave**: o wizard já persiste a cada mutação (persist middleware). Ao concluir ou ao sair do builder com build válido, gravar no Vault via `saveCharacter`. Adicionar **feedback visual de salvamento** (toast/indicador `sonner`) — hoje o save é silencioso.
3. **Retomada**: "Continuar" no Dashboard carrega o `CharacterBuild` do Vault para o store do builder (hidratar flat state) e navega para `draft.currentStepSlug`. Ficha incompleta é identificável por `validationMessages`/pendências no `derivedSheet`.
4. **Prevenção de perda**: antes de "Criar Personagem" sobrescrever um draft em andamento no `sessionStorage`, perguntar (dialog) se o usuário quer descartar ou retomar. Critério de aceite: nenhum caminho de UI zera o draft sem confirmação.
5. **Import** grava no Vault com `saveId` novo (nunca sobrescreve por colisão) — seção 19.

### 6.3 Testes de persistência exigidos

- Round-trip: `CharacterBuild` → flat → `CharacterBuild` sem perda (já parcialmente coberto; estender a cada campo novo).
- Migração N→N+1 para **cada** bump, com fixture do shape antigo real.
- Leitura de save corrompido/JSON inválido → Vault ignora a entrada sem quebrar a listagem.

---

## 7. Engine de Regras

### 7.1 Situação e objetivo

A matemática hoje vive em `src/adapters/characterDerivedAdapter.ts` (correta e testada) e em `rules/`, mas parte da regra vazou para `src/store/characterSelectors.ts` (perícias, saves, passivas, armas, XP, moedas). O objetivo da Fase 1 é **consolidar a engine em módulos puros** e reduzir o selector a orquestrador.

### 7.2 Módulos-alvo (todos puros, sem React, 100% testados)

| Módulo | Entradas | Saídas | Origem do código |
|---|---|---|---|
| `src/adapters/characterDerivedAdapter.ts` | scores, level, hitDie | mod, PB, atributos finais, PV, CA base | existente |
| `rules/skillRules.ts` (novo) | atributos finais, proficiências, training, PB, overrides | `SheetSkill[]`, passivas | extrair `computeSkills` + `passives` do selector |
| `rules/savingThrowRules.ts` (novo) | atributos finais, **ids** de saves proficientes (não labels), PB | `SheetSavingThrow[]` | extrair + corrigir para `AttributeKey` |
| `rules/attackRules.ts` (novo) | inventário normalizado, atributos, PB, proficiências com armas | `SheetAttack[]` (bônus e dano reais) | novo — substitui stub de `weapons` |
| `rules/armorClassRules.ts` (novo) | inventário normalizado (armadura/escudo), DES | CA com regra leve/média/pesada + escudo + unarmored defense (monge/bárbaro via feature flag) | evolui `calculateArmorClass` |
| `rules/levelProgression.ts` | classe, fromLevel, toLevel | `LevelChoiceRequirement[]` | existente |
| `rules/spellcastingRules.ts` (novo) | classe, nível, atributos, escolhas de magia | CD, ataque mágico, slots, limites de conhecidas/preparadas, cantrips | novo (Fase 5) |
| `rules/pendencyRules.ts` (novo) | build completo | lista tipada de pendências (`{ id, stepSlug, label, severity }`) | consolida `getUnresolvedLevelChoices` + `validateBuilderStep` |
| `rules/builderValidation.ts` | step, state | mensagens por etapa | existente |
| `src/adapters/featCatalog.ts` | raw feats, contexto | feats selecionáveis + **[novo] `applyFeatEffects`** | existente + Fase 4 |

### 7.3 Exemplo de contrato (padrão a seguir em todos os módulos)

```ts
// rules/attackRules.ts — assinatura-alvo
export function deriveAttacks(input: {
  items: NormalizedInventoryItem[];
  finalAttributes: CharacterAttributes;
  proficiencyBonus: number;
  weaponProficiencies: string[]; // ids/categorias vindas da classe
}): SheetAttack[];
// Regras: melee usa FOR; finesse usa max(FOR, DES); ranged usa DES;
// bônus de ataque = mod + (proficiente ? PB : 0); dano = dado do item + mod.
```

### 7.4 Testes da engine

Cada módulo tem arquivo de teste espelhado testando **comportamento com números do 5e 2024**, não mocks. Exemplos obrigatórios:

- `getProficiencyBonus`: níveis 1→+2, 4→+2, 5→+3, 8→+3, 9→+4, 13→+5, 17→+6, 20→+6.
- `calculateMaxHitPoints(10, 14, 5)` = 12 + 4×8 = 44 (d10, CON 14).
- Espada longa (1d8, FOR 16, proficiente, PB +2) → ataque +5, dano `1d8+3`.
- Cota de malha (CA 16, pesada) ignora DES; couro (11) soma DES inteiro; escudo +2 acumula.

---

## 8. Wizard de Criação (9 etapas — preservar)

Rota: `app/builder/[step]/page.tsx`; navegação: `src/components/templates/builderStepNavigation.ts`; shell: `BuilderShell.tsx` + `BuilderSidebar.tsx` (ficha viva). Validação de avanço: `rules/builderValidation.ts`. **Nenhuma etapa é removida ou reordenada.**

| # | Etapa (slug) | Consome | Produz (em `choices`/`draft`) | Validações (avanço) | Impacto na ficha derivada |
|---|---|---|---|---|---|
| 1 | Classe (`classe`) | `getBuilderClasses()` | `selectedClassId`, `classSkillProficiencies` | classe escolhida; nº correto de perícias | hit die→PV, PB(saves), perícias, spellcasting flag, features nível 1, pacotes de equipamento |
| 2 | Recursos de Classe (`recursos-classe`) | classe escolhida (`featureChoiceGroups`) | `classFeatureChoices`; no nível ≥ unlock: `selectedSubclassId` | grupos de escolha resolvidos p/ nível inicial | features ativas, opções (ex.: estilo de luta → CA/ataque) |
| 3 | Antecedente (`antecedente`) | `getBuilderBackgrounds()` | `selectedBackgroundId`, `backgroundAbilityBonuses`, perícias/idiomas/ferramentas do BG | antecedente escolhido; bônus +2/+1 ou +1/+1/+1 válidos (2024) | bônus de atributo, perícias, origin feat, equipamento do BG |
| 4 | Raça/Espécie (`especie`) | `getBuilderSpecies()` | `selectedSpeciesId` | espécie escolhida | traits, tamanho, deslocamento, sentidos |
| 5 | Detalhes da Espécie (`detalhes-especie`) | espécie escolhida | `speciesChoices`, `speciesLanguages` | escolhas internas + idiomas (`getRequiredLanguageCount`) | traits opcionais, idiomas |
| 6 | Atributos (`atributos`) | método + classe (sugestões) | `attributeGenerationMethod`, `baseAttributes` | standard array completo / point-buy = 27 pts (`rules/pointBuyRules.ts`) / manual 3–18 / **rolagem 4d6 descarta menor** (`rules/abilityRollRules.ts`, com reordenação dos 6 resultados) | tudo: mods, PV, CA, iniciativa, perícias, saves, magia |
| 7 | Equipamento (`equipamento`) | classe + antecedente (pacotes/ouro) | `equipmentChoicesBySource`, `inventory`, `money` | uma opção por fonte (itens **ou** ouro) | CA, ataques, inventário, moedas |
| 8 | Descrição (`descricao`) | antecedente (sugestões de personalidade em `backgrounds.json`), galeria de retratos (`public/portraits/`), gerador de nomes por espécie | `draft.description` **estendida** (zod: `personalDetailsSchema.ts`): nome, aparência, personalidade/ideais/vínculos/defeitos (com botão "sugerir" por antecedente), história, notas, **alinhamento, fé, altura, peso, idade, olhos, cabelo, pele** (opcionais), `portraitId`, botão 🎲 de nome aleatório | nome obrigatório; demais opcionais | identidade na ficha, `CharacterCard` do Dashboard (retrato), export e PDF |
| 9 | Conclusão (`conclusao`) | ficha derivada completa | grava no Vault | zero pendências bloqueantes p/ "ficha completa" (pendências não-bloqueantes permitem salvar como incompleta) | — (exibe e exporta) |

**Regras transversais do wizard:**

- **Volta sem perda:** navegar para trás nunca limpa campos; trocar de classe invalida apenas escolhas dependentes da classe (recursos, perícias de classe, equipamento de classe, magias) — com **dialog de diff item a item** (padrão DDB): lista exatamente o que será resetado ("2 perícias, Estilo de Luta, kit de equipamento, 4 magias"), nunca aviso genérico.
- **Stepper com estados:** cada etapa exibe ✓ (completa), ● (atual), ⚠ (com pendência) ou 🔒 (bloqueada), derivado de `pendencyRules` (F1), com `aria-current="step"` e mudanças anunciadas em `aria-live`. `maxUnlockedStepIndex` controla acesso (`aria-disabled` nas bloqueadas).
- **Contadores de escolha inline:** todo grupo de escolha mostra progresso ("2 de 3 perícias escolhidas", "1 escolha restante") derivado dos mesmos validadores de `builderValidation` — elimina pendência invisível.
- **Pendências visíveis:** `pendencyRules` alimenta o sidebar e a etapa 9; cada pendência linka para a etapa de origem (`stepSlug`).
- **Preview da ficha a qualquer momento:** botão "Ver ficha" em todas as etapas abre o `CharacterSheetPreview` completo em modal/drawer — não só o resumo lateral.
- **Mobile:** barra de navegação inferior fixa ("Voltar · etapa X/9 · Avançar"; Avançar bloqueado sempre com tooltip do motivo) + barra compacta de identidade (retrato · nome · classe · nível · PV · CA) que expande a ficha viva como drawer (`ui/sheet.tsx` + `use-mobile.ts`).
- **Preferências da criação ("Etapa 0" via dialog):** botão no header do builder abre dialog com fontes ativas e progressão XP/marco (`choices.creationPreferences`), com defaults globais em `forge-fate-preferences:v1` — não é uma 10ª etapa; o wizard permanece com 9.
- **Autosave visível:** indicador "Salvo ✓ HH:MM" no header; toast `sonner` apenas em falha.
- **Edição posterior:** abrir personagem salvo no builder reidrata o flat state e permite editar qualquer etapa; salvar recalcula `derivedSheet`.

---

## 9. Modo Iniciante

### 9.1 Modal inicial (modos de criação)

Ao clicar em **Criar Personagem** no Dashboard, antes de navegar para `/builder/classe`, abrir dialog acessível (Radix Dialog, `src/components/ui/`) com a pergunta **"É sua primeira vez jogando Dungeons & Dragons 5e?"** e **três caminhos** (padrão DDB, adaptado):

> **[ Modo Guiado ]** — "Sim, me guie" — ativa o modo didático (beginner mode).
> **[ Modo Padrão ]** — "Já conheço as regras" — wizard normal, sem conteúdo didático extra.
> **[ Construção Rápida ]** — escolhe uma classe e o sistema aplica o kit recomendado (perícias, recursos, atributos sugeridos, equipamento padrão) e cai direto na etapa 8 para nomear — ficha jogável em ~1 minuto; tudo revisável depois voltando às etapas.

- Resposta grava em `choices.beginnerMode: boolean` (por personagem) **e** em preferência global `localStorage forge-fate-preferences:v1` (default para próximos personagens).
- O modal só reaparece se não houver preferência global; um link "mudar depois" aponta para o toggle permanente.
- A Construção Rápida usa dados recomendados por classe (`quickBuildProfiles` em `src/data/`) e passa pelas **mesmas ações do store** do wizard — nenhum atalho de cálculo; a engine valida o resultado como qualquer ficha.
- Modo Aleatório e personagens pré-montados: pós-v1 (registrados na seção 28).

### 9.2 Estado e toggle

- Toggle visível no header do builder ("Modo guiado: on/off"), acessível por teclado, refletindo `beginnerMode`. Desligar/ligar a qualquer momento, sem recarregar.
- Veteranos: com `beginnerMode=false`, **nenhum** elemento didático extra ocupa espaço (só os affordances padrão de tooltip que já existem).

### 9.3 Mecanismos de explicação (3 níveis, todos reutilizando o mesmo catálogo)

1. **`HelpHint` (novo molecule)** — ícone `?` discreto ao lado de termos (CA, PV, PB…); tooltip curto (1–2 frases) via `HoverTooltip.tsx` existente; em beginner mode, o hint fica levemente destacado.
2. **Card introdutório por etapa** — bloco colapsável no topo de cada etapa ("O que é uma Classe?"), aberto por padrão em beginner mode, colapsado (e memorizado como colapsado) fora dele.
3. **`ConceptDialog`** — modal "saiba mais" com explicação longa, reutilizando `DetailDialog.tsx`.
4. **Quiz "Me ajude a escolher"** — na etapa 1 (Classe), em beginner mode, botão que abre um quiz de 5 perguntas imersivas sorteadas de um banco maior (`src/data/classQuiz.ts`; perguntas e ordem das respostas randomizadas a cada sessão) e **destaca** (não trava) exatamente 2 classes nos cards do catálogo: a principal com borda/flag verde "Recomendado" e a segunda opção em âmbar "2ª opção", com cards de resultado explicando por que cada classe combinou com as respostas.

### 9.4 Catálogo de conceitos

Criar `src/data/conceptGlossary.ts` (padrão de `skillDescriptions.ts`): `Record<ConceptId, { term, short, long }>` em pt-BR, com **texto próprio escrito para iniciantes** (linguagem simples, exemplos de mesa). Cobertura mínima exigida: classe, espécie, antecedente, atributo, modificador, proficiência, perícia, CA, PV, iniciativa, deslocamento, teste de resistência, magia, cantrip (truque), círculo de magia, slot, CD de magia, ataque mágico, subclasse, feat, ASI, equipamento inicial, inventário, dado de vida, descanso, "o que você vai usar na mesa".

Teste: snapshot garantindo que todo `ConceptId` referenciado por um `HelpHint` existe no glossário.

### 9.5 Acessibilidade do modo

Hints são botões reais (`aria-label="O que é Classe de Armadura?"`); dialogs Radix com foco preso e `Esc`; conteúdo didático nunca bloqueia o fluxo (sem gates obrigatórios).

---

## 10. Progressão 1–20

### 10.1 O que o nível governa (tudo derivado, nada manual)

| Grandeza | Fonte | Estado |
|---|---|---|
| Bônus de proficiência | `getProficiencyBonus(level)` | ✅ |
| PV máximo | `calculateMaxHitPoints` (média fixa 2024) → evoluir p/ somar `progression.levelChoices[n].hpRoll` quando o jogador rolar | 🟡 |
| Hit dice | `${level}d${hitDie}` no summary | ✅ |
| Features de classe desbloqueadas | filtro `feature.level <= state.level` | ✅ |
| Subclasse (nível de desbloqueio) | `rules/levelProgression.ts` (`grantsSubclass`) | ✅ regra / 🟡 UI |
| ASI/feat (níveis 4, 8, 12, 16, 19 conforme classe) | `levelProgression` + `AsiOrFeatStep` | 🟡 |
| Magias/slots/cantrips por nível | `spellcastingRules` (Fase 5) | ⛔ |
| Epic Boons (nível 19+) | catálogo de feats categoria `epic-boon` (Fase 4) | ⛔ |

### 10.2 Level-up vivo (fechar o ciclo — Fase 2)

Fluxo: na `CharacterSheetPage`, botão "Subir de Nível" (o `LevelUpButton` já tem teste) abre `LevelUpFlow` (existente) que:

1. Chama `getLevelRequirements(class, currentLevel, currentLevel + 1)`.
2. Renderiza um passo por requirement (`SubclassStep`, `AsiOrFeatStep`, `FeatureOptionStep` — existentes) + **novo `HitPointsStep`** (média ou rolagem manual, gravada em `levelChoices[n].hpRoll`) + **novo `SpellsStep`** (Fase 5).
3. Ao confirmar: `setLevel(n+1)` + grava `levelChoices[n+1]` + recalcula `derivedSheet` + `saveCharacter`.

Critério de aceite: subir do 1 ao 20 um Fighter (4 ASIs+, subclasse no 3) e um Wizard (magias por nível) sem inconsistência de PB/PV/features, com testes de integração no store.

### 10.3 Nível inicial > 1

`StartingLevelStepper` (existente) permite começar acima do 1: o wizard então exige resolver todos os requirements de 1..N na etapa 2 (recursos de classe) — reusar exatamente `getLevelRequirements(class, 0, N)`.

---

## 11. Classes e Subclasses

**Dados:** `public/data/class/class-*.json` (formato 5eTools: `class`, `subclass`, `classFeature`, `subclassFeature`). Normalização em `src/adapters/fiveEToolsAdapter.ts` → `BuilderClass` (com `allFeatures`, `featureChoiceGroups`, `startingEquipmentPackages`, `savingThrows`, `spellcastingAbility`, `hitDie`).

**Tarefas (Fase 2):**

- Normalizar subclasses para `BuilderSubclass { id, name, classId, unlockLevel, features: BuilderFeature[] }` no `fiveEToolsAdapter`, expostas via `ruleService.getBuilderSubclasses(classId)`.
- `choices.selectedSubclassId` (já existe) validado contra a classe: trocar de classe zera subclasse.
- `getActiveSubclassFeatures` (existente em `levelChoiceResolver.ts`) passa a consumir a normalização oficial, filtrando por nível.
- Excluir do builder classes não-2024/não-suportadas (`class-mystic.json`, `class-sidekick.json`) via allowlist no `ruleService` — não deletar os dados.
- UI: `SubclassStep` ganha cards com descrição curta + `ConceptDialog` "o que é subclasse" em beginner mode.
- Resumo/ficha exibem features de subclasse com `source: "subclass"` (novo valor no union de `SheetFeature.source`).

**Testes:** normalizador (cada classe 2024 gera ≥1 subclasse com `unlockLevel` = 3); seleção inválida (subclasse de outra classe) rejeitada; features de subclasse aparecem no summary somente no nível correto.

---

## 12. Espécies, Subespécies e Traits

**Dados:** `public/data/races.json` (+ `foundry-races.json`). Normalização atual → `BuilderSpecies` com `traits`, `speed`, escolhas internas (`speciesChoices`) e idiomas (`speciesLanguages`).

**Tarefas:**

- Garantir no modelo: `size`, `speed` (✅), `senses` (darkvision etc. → alimenta `summary.senses`, hoje `[]`), `traits` com nível quando aplicável.
- Subespécie/linhagens (quando a espécie tiver variantes 2024): modelar como `speciesChoices["lineage"]` — já suportado pelo shape `Record<string, string>`; validar obrigatoriedade em `builderValidation`.
- Etapa 5 (Detalhes) cobre: escolhas internas, traits opcionais, idiomas (`getRequiredLanguageCount` existente), proficiências concedidas por espécie.
- Beginner mode: card "O que é Espécie?" + explicação de deslocamento/tamanho na ficha viva.

**Testes:** espécie com darkvision popula `senses`; espécie com escolha interna pendente gera pendência com `stepSlug: "detalhes-especie"`.

---

## 13. Antecedentes

**Dados:** `public/data/backgrounds.json`. Normalização atual → `BuilderBackground` com `originFeat`, `equipmentGold`, `equipmentSummary`, bônus de atributos.

**Tarefas:**

- 2024: antecedente concede **+2/+1 ou +1/+1/+1** em atributos fixos do BG — validar combinação em `builderValidation` (hoje `backgroundAbilityBonuses` é livre).
- **Origin Feat real:** hoje o feat de origem entra como feature textual (`{ name: background.originFeat, description: background.equipmentSummary }` — inclusive com descrição errada, usando o resumo de equipamento). Corrigir na Fase 4: resolver o feat no `featCatalog` e aplicar efeitos mecânicos.
- Perícias/ferramentas/idiomas do BG entram nas proficiências derivadas com `source: "background"` (source isolation).
- Equipamento do BG: opção itens/ouro já isolada em `equipmentChoicesBySource.background` (✅).

**Testes:** bônus 2024 inválido (ex.: +2/+2) bloqueia avanço; origin feat aparece com descrição do feat, não do equipamento.

---

## 14. Atributos e Perícias

**Métodos (etapa 6):** standard array (15/14/13/12/10/8), point buy 27 pontos (`rules/pointBuyRules.ts` ✅), manual (3–18 com aviso) e **rolagem 4d6 descarta o menor** (`rules/abilityRollRules.ts` novo — rolagem pura com seed injetável para teste; a UI rola os 6 conjuntos, exibe os dados e permite **reordenar** os resultados entre os atributos). `attributeGenerationMethod` persiste (`"roll-4d6"` entra no union com bump de schema — Fase 2); trocar de método mantém valores quando compatíveis, senão reseta com confirmação.

**Pipeline de cálculo:** `baseAttributes` + `backgroundAbilityBonuses` + `collectAsiBonuses(progression)` (+ efeitos de feats na Fase 4) → `calculateFinalAttributes` → mods → tudo.

**Perícias:** `skillTraining: Record<skill, "none"|"half"|"proficient"|"expertise">` já suporta half (bardo) e expertise. Tarefas: extrair `computeSkills` para `rules/skillRules.ts`; manter `skillModifierOverrides` como override explícito com badge `isOverridden` na UI; expertise só selecionável quando feature de classe conceder (validação nova).

**Didática:** beginner mode explica modificador ("(valor − 10) ÷ 2, arredondado para baixo"), mostra recomendação por classe ("Magos usam Inteligência"), e cada perícia usa `skillDescriptions.ts` (✅ já em pt-BR) no `SkillDetailModal` (✅).

**Testes:** point buy não fecha com >27 pts; expertise sem fonte é rejeitada; override NaN é ignorado (regressão do commit `9ae63dd`).

---

## 15. Magias (Fase 5 — maior lacuna)

### 15.1 Domínio

- **`src/services/spellService.ts`** — carrega `public/data/spells/spells-xphb.json` (base 2024; demais fontes atrás de flag de fonte), com índice por classe via `sources.json`.
- **`src/adapters/spellAdapter.ts`** — normaliza para:

```ts
interface BuilderSpell {
  id: string;               // slug name+source
  name: string;
  level: number;            // 0 = cantrip/truque
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: { v: boolean; s: boolean; m?: string };
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: RulesTextNode[];   // AST (Fase 7); antes dela, entries brutos
  higherLevels?: RulesTextNode[]; // escalonamento
  classIds: string[];             // listas por classe
  source: string;
}
```

- **`rules/spellcastingRules.ts`** — funções puras:
  - `getSpellcastingProfile(classId)` → habilidade, tipo known/prepared, full/half caster.
  - `getSpellSlots(classId, level)` → tabela de slots (full caster; half caster; pact magic do warlock).
  - `getMaxPreparedOrKnown(classId, level, abilityMod)` e `getCantripsKnown(classId, level)`.
  - `deriveSpellcasting(build, classData, spells)` → `{ spellSaveDC: 8 + PB + mod, spellAttackBonus: PB + mod, slots, cantrips, known/prepared, maxSpellLevel }`.
  - `canSelectSpell(spell, profile, level)` → bloqueia círculo acima do permitido, magia fora da lista da classe, exceder limites.

### 15.2 Estado e UI

- `choices.spellcasting` (seção 5.1) — bump de schema + migração (ausente → `undefined`).
- Seleção de magias entra na **etapa 2 (Recursos de Classe)** para conjuradores de nível 1, e no `SpellsStep` do level-up — sem criar 10ª etapa.
- UI: lista filtrável por círculo/escola/nome, cards com `DetailDialog`, contador "3 de 4 truques escolhidos", grupo separado para cantrips vs. magias.
- Ficha (`CharacterSheetPage`): painel de magias com CD, ataque mágico, slots por círculo, preparadas/conhecidas.

### 15.3 Didática e testes

Beginner mode explica truque vs. magia, círculos, slots ("baterias que recarregam no descanso"), preparadas vs. conhecidas, concentração e ritual.

Testes obrigatórios: wizard nível 1 → 3 truques + 6 no grimório (2024); impedir magia de 2º círculo no nível 1; CD do clérigo SAB 16 nível 1 = 13; slots do warlock seguem pact magic; trocar de classe limpa `spellcasting`.

---

## 16. Equipamento e Inventário (Fase 6)

### 16.1 Item normalizado

Evoluir `itemCatalogAdapter.ts` para produzir:

```ts
interface NormalizedInventoryItem {
  id: string; name: string;
  type: "weapon" | "armor" | "shield" | "tool" | "pack" | "gear" | "consumable";
  quantity: number;
  origin: "class" | "background" | "species" | "manual" | "import";
  weightKg?: number; valuePo?: number;
  damage?: { dice: string; type: string; versatile?: string };
  properties?: string[];            // finesse, light, two-handed, ammunition…
  armor?: { baseAC: number; category: "light"|"medium"|"heavy"; maxDexBonus?: number; strengthMin?: number; stealthDisadvantage?: boolean };
  shieldBonus?: number;
  requirements?: string[];
  conflicts?: string[];             // ex.: duas armaduras vestidas
}
```

### 16.2 Efeitos mecânicos na ficha

- **CA** via `rules/armorClassRules.ts`: leve = base+DES; média = base+min(DES, 2); pesada = base (com aviso de FOR mínima); escudo soma +2; conflito (2 armaduras) gera pendência.
- **Ataques** via `rules/attackRules.ts` (seção 7.3) — substitui o stub atual de `weapons`.
- **Carga**: somatório de `weightKg` alimenta `carry.currentKg` (hoje manual via `carriedLoadKg` — manter override manual, mas derivar default).
- **Equipado vs. carregado:** adicionar `equippedItemIds: string[]` ao draft/choices (bump de schema) — só itens equipados afetam CA/ataques.
- Pacotes (packs) expandem em itens individuais na aquisição.
- Gold buy: comprar do catálogo debitando `money` (fluxo já iniciado por `deriveStartingGoldPo` + `InventoryManager`).

**Testes:** cota de malha + escudo + DES 18 → CA 18 (16+2, DES ignorada); rapieira (finesse) usa DES; conflito de armadura gera pendência; peso do pacote do explorador soma corretamente.

---

## 17. Ficha Derivada (`CharacterSheetSummary`)

Campo a campo (estado atual → alvo). Tudo produzido por `selectCharacterSheetSummary` orquestrando a engine:

| Campo | Fonte | Estado |
|---|---|---|
| `finalAttributes`, `attributes[]` (score+mod) | base + BG + ASI (+feats F4) via `calculateFinalAttributes` | ✅ (feats ⛔) |
| `proficiencyBonus` | `getProficiencyBonus(level)` | ✅ |
| `hitPoints/maxHp/currentHp/tempHp`, `hitDice` | `calculateMaxHitPoints` + `playState` | ✅ |
| `armorClass` | `armorClassRules` + itens equipados | ✅ |
| `initiative` | mod DES (+feats F4) | ✅ |
| `speedFeet/speedMeters` | espécie (`feetToMeters`) | ✅ |
| `skills[]`, `passives` | `skillRules` | ✅ |
| `savingThrows[]` | `savingThrowRules` por `AttributeKey` | ✅ |
| `weapons[]` → `attacks[]` | `attackRules` + itens equipados | ✅ |
| `features[]` (classe/subclasse/espécie/BG/feats) | filtros por nível + resolvers | 🟡 |
| `spellcasting` (CD, ataque, slots, listas) | `deriveSpellcasting` (F5) | ✅ |
| `senses`, `resistances`, `immunities` | traits de espécie/feats (F2/F4) | ⛔ (hoje `[]`) |
| `languages` | espécie + BG | 🟡 |
| `selectedEquipment` → inventário normalizado | `itemCatalogAdapter` (F6) | ✅ |
| `money`, `carry` | pouch + `deriveStartingGoldPo` | ✅ |
| `xp/xpThreshold` | tabela `XP_BY_LEVEL` | ✅ |
| `validationMessages` → `pendencies[]` tipadas | `pendencyRules` (F1) | ✅ |
| identidade (`name/className/speciesName/backgroundName/level/ruleset`) | choices + catálogos | ✅ |

**Regra:** campo novo no summary ⇒ função pura nova/estendida + teste + consumo idêntico em UI, Foundry, JSON canônico e PDF.

---

## 18. Renderização de Texto de Regras (Fase 7)

**Problema:** `src/utils/textParser.tsx` interpreta tags 5eTools (`{@dice}`, `{@spell}`, listas, tabelas, entries aninhados) direto para JSX, e os testes estão quintuplicados (`src/services/_tests_`, `src/utils/_tests_`, `molecules/organisms/templates/_tests_`) — sinal de acoplamento. Cards, modais, resumo, ficha, export e PDF precisam do **mesmo** conteúdo em alvos diferentes (JSX, texto puro, PDF).

**Solução — AST intermediário:**

1. `src/adapters/rulesTextAst.ts` (puro): `parseRulesText(raw5eToolsEntries) → RulesTextNode[]` com nós `paragraph | list | table | bold | italic | dice | internalRef | text`. Tags desconhecidas degradam para `text` (nunca quebram). Sanitização: nenhum HTML bruto passa sem escape; refs internas viram nós tipados, não links arbitrários.
2. Renderers finos por alvo: `RulesTextView.tsx` (React — tabelas semânticas `src/components/ui/table.tsx`, listas reais `<ul>/<ol>`), `astToPlainText()` (export/Foundry/busca), `astToPdfFragments()` (Fase 9).
3. Migrar consumidores (cards, `DetailDialog`, `FeatureListCard`, ficha) para `RulesTextView` e **consolidar os 5 testes duplicados em um** (`src/adapters/_tests_/rulesTextAst.test.ts` + um de renderização).

**Acessibilidade:** tabelas com `<caption>`/`scope`; dados de rolagem com texto legível ("2d6+3"); sem overflow horizontal em textos longos (quebra em `min-w-0`).

**Testes:** golden tests com entries reais de `public/data` (feature com tabela, magia com escalonamento, lista aninhada); propriedade "nunca lança exceção" com entries malformados.

---

## 19. Export, Import, Foundry e PDF

### 19.1 JSON canônico Forge & Fate (Fase 8)

`src/utils/canonicalExport.ts`:

```ts
interface ForgeFateExportV1 {
  format: "forge-fate-character";
  formatVersion: 1;                    // versão do ENVELOPE de export
  exportedAt: string;
  app: { name: "Forge & Fate"; schemaVersion: number }; // schema do build
  build: CharacterBuild;               // estado completo (choices+progression+draft+derivedSheet+metadata)
}
```

- `exportCharacter(build): ForgeFateExportV1` e `importCharacter(json): CharacterBuild` — import valida com zod, roda `normalizeCharacterBuild` (migra schemas antigos), gera `saveId` novo e grava no Vault.
- **Round-trip sem perda é o critério de aceite nº 1:** `importCharacter(exportCharacter(b))` ≡ `b` (exceto `saveId`/timestamps), coberto por teste com builds fixtures de todos os schemas suportados.
- Erros de import legíveis ("arquivo de versão mais nova — atualize o app").

### 19.2 Foundry VTT (existente — manter como adapter externo)

`src/utils/foundryAdapter.ts` consome `CharacterSheetSummary`. Evolução: incluir magias/inventário quando as fases 5–6 aterrissarem. Foundry **nunca** vira formato interno; referências em `src/_references/*.json` são só fixtures.

### 19.3 PDF (Fase 9)

**Decisão recomendada:** layout próprio dark-fantasy-print com **`@react-pdf/renderer`** (declarativo, reusa o design system conceitual e `astToPdfFragments`), gerado client-side. Alternativa `pdf-lib` + template pronto descartada pela rigidez do layout fixo (não acomoda listas longas de magias/features nem a identidade visual própria). Dependência registrada na seção 26.2.

- `src/adapters/pdfAdapter.ts`: `buildPdfDocument(summary: CharacterSheetSummary): Document` mapeando: identidade, atributos+mods, PB, CA/PV/iniciativa/deslocamento, saves, perícias, ataques, features, magias (CD/ataque/slots/listas), inventário, moedas, descrição.
- Smoke test: gera bytes de PDF > 0 e sem exceção para um build completo de conjurador e um marcial (Vitest, sem snapshot visual).

### 19.4 UI

Etapa 9 (Conclusão) e `CharacterSheetPage` ganham: Exportar JSON · Exportar Foundry · Gerar PDF · Importar (Dashboard: botão "Importar personagem" com file picker + validação + toast de erro/sucesso).

---

## 20. Acessibilidade

**Requisitos (todos os PRs):**

- HTML semântico (landmarks, headings hierárquicos, `<button>`/`<a>` reais).
- Foco visível em 100% dos interativos (tokens de ring já existem no tema).
- Navegação completa por teclado: wizard (stepper com setas/tab), cards de escolha (`WizardChoiceCard` operável com Enter/Space e `role` correto), modais Radix (foco preso, `Esc`, retorno de foco).
- Labels/`aria-label` em ícones-botão; `aria-current="step"` no stepper; pendências e erros em `role="alert"`/`aria-live="polite"`.
- Contraste WCAG 2.2 AA — regra do MANIFESTO §4.1: carmesim nunca como texto pequeno; nenhum texto funcional < 10px.
- Textos longos sem overflow horizontal; responsivo mobile/tablet/desktop (sidebar vira sheet/drawer no mobile — `src/components/ui/sheet.tsx` e `use-mobile.ts` já existem).
- Cards clicáveis também operáveis por teclado (não só `onClick` em `div`).

**Critérios de aceite:** cada etapa do wizard completável só com teclado; leitor de tela anuncia mudança de etapa e novas pendências; `eslint-plugin-jsx-a11y` (já no eslint-config-next) sem erros; testes de Testing Library assertando por role/name acessível (padrão já usado — manter).

---

## 21. Testes

**Ferramentas:** Vitest 4 + Testing Library + jsdom (config em `vitest.config.ts`/`vitest.setup.ts`). Convenção: `_tests_/` espelhando o módulo. TDD conforme MANIFESTO §8.

| Tipo | Alvo | Exemplos existentes / a criar |
|---|---|---|
| Unitário de regra | `rules/*`, `src/adapters/*` | ✅ `pointBuyRules.test.ts`, `levelProgression.test.ts`, `featCatalog.test.ts` · criar: attack/AC/spellcasting/skill/save rules |
| Selector/engine integrada | `selectCharacterSheetSummary` | ✅ `characterSelectors.test.ts`, `.money.test.ts` · estender por fase |
| Persistência/migração | store + Vault | ✅ `characterStore.persist.test.ts`, `schemaV5Migration.test.ts` · criar um por bump |
| UI | componentes por role/name | ✅ 20+ testes · criar: beginner mode, spells UI, import/export |
| Export/import | round-trip canônico, Foundry | ✅ `foundryAdapter.test.ts` · criar round-trip JSON |
| Smoke | PDF gera bytes; build Next compila | criar |
| Dados | normalizadores contra `public/data` reais | ✅ `raw5eService.test.ts`, `fiveEToolsAdapter.test.ts` · estender p/ subclasses/spells |

**Regra de ouro:** nenhuma fase fecha sem seus testes; `npm run test`, `npm run typecheck` e `npm run lint` verdes são pré-condição de merge.

---

## 22. Roadmap por Fases

> Ordem obrigatória — cada fase depende da anterior estar sólida. Não antecipar (ex.: não montar UI de magias antes da engine de slots).

### Fase 1 — Consolidação da engine pura + UX de confiança
- **Objetivo:** toda regra fora do selector/UI; ataques e saves corretos; pendências tipadas — e o pacote de UX que as consome, visível ao usuário desde já.
- **Escopo/arquivos:** criar `rules/skillRules.ts`, `rules/savingThrowRules.ts`, `rules/attackRules.ts`, `rules/armorClassRules.ts` (v1: mover lógica atual), `rules/pendencyRules.ts`; enxugar `src/store/characterSelectors.ts`; `types/builder.ts` (`SheetAttack`, `Pendency`); `BuilderSidebar.tsx`/stepper, barra mobile nova.
- **Tarefas (engine):** extrair `computeSkills`/saves/passivas; trocar match de saves por `AttributeKey`; implementar `deriveAttacks` com dano/atributo reais (consumindo dados que o catálogo já tem); tipar pendências `{ id, stepSlug, label, severity: "blocking"|"warning" }` e ligar sidebar/conclusão. Funções de CA/PV/ataque retornam também as **parcelas** (`breakdown: { label, value }[]`) para alimentar tooltips de fórmula.
- **Tarefas (UX, padrão DDB — seção 28.2):** stepper com estados ✓/●/⚠/🔒 (`aria-current`, `aria-live`); contadores de escolha inline em todo grupo; tooltip de fórmula nos números derivados ("CA 16 = 14 cota de malha + 2 escudo"); botão "Ver ficha" (preview completo em modal/drawer) em todas as etapas; barra de navegação inferior fixa no mobile (Avançar bloqueado sempre com motivo); indicador de autosave "Salvo ✓ HH:MM"; dialog de diff item a item ao trocar classe/espécie/antecedente.
- **Aceite:** summary idêntico (exceto ataques corretos e pendências tipadas); selector < ~150 linhas; zero regra inline nova; toda pendência visível tem contador ou badge na etapa de origem; wizard completável no mobile com a barra inferior.
- **Riscos:** regressão silenciosa no summary → snapshot test do summary antes/depois da extração.
- **✅ Status 2026-07-02 — engine concluída** (PR #11 + closeout): `skillRules`, `savingThrowRules` (por `AttributeKey`), `attackRules` (dano/atributo/proficiência reais), `armorClassRules` (com escudo + breakdown), `pendencyRules` (tipadas), `getMaxHitPointsBreakdown`; montagem em `rules/characterSheetSummaryRules.ts` com teste-guardião de orçamento + snapshot (`selectorPurity.test.ts`). Parte do pacote de UX (sidebar/stepper/painéis) entrou no mesmo PR; o restante (tooltips de fórmula, "Ver ficha", barra mobile, diff de troca, autosave visível) migra para o plano da Fase 2.

### Fase 2 — Progressão 1–20, subclasses e preferências da criação
- **Objetivo:** ciclo de level-up fecha; subclasses normalizadas; "Etapa 0" de preferências e rolagem 4d6 disponíveis.
- **Arquivos:** `src/adapters/fiveEToolsAdapter.ts` (+subclasses), `src/services/ruleService.ts` (`getBuilderSubclasses`, allowlist de classes, filtro por `activeSources`), `organisms/levelup/*` (+`HitPointsStep`), `rules/abilityRollRules.ts` (novo), dialog "Preferências" no header do builder, `src/store/*` — **bump schema v6 + migração** cobrindo: ação `levelUp` + `hpRoll`, `choices.creationPreferences` (fontes ativas, XP/marco), `"roll-4d6"` no union de `AttributeGenerationMethod`, `senses` de espécie.
- **Tarefas extras (DDB — seção 28.1 nº 1 e 3):** dialog de preferências com fontes ativas (alimenta badges de fonte e filtros dos catálogos) e progressão XP/marco (marco oculta `xp/xpThreshold` na ficha); método 4d6 na etapa 6 com rolagem seedável, exibição dos dados e reordenação dos resultados.
- **Aceite:** Fighter e Cleric 1→20 com PB/PV/features/subclasse corretos; save antigo v5 migra sem perda; `senses` populado; ficha criada com 4d6 valida e persiste; desativar uma fonte remove suas opções dos catálogos sem quebrar builds existentes (itens de fonte desativada geram pendência `warning`, não erro).
- **✅ Status 2026-07-03 — entregue** (branch `feat/fase2-progression`): schema v6 (`hpRoll`, `creationPreferences`, `"roll-4d6"`) com migração no ponto único `normalizeCharacterBuild` + fixture v5 congelado; `rules/abilityRollRules` (4d6 seedável) + UI com reordenação por índice (empates OK) e valores read-only pós-aplicação; `rules/hitPointRules` (PV por nível rolado/média + breakdown) + `HitPointsStep` no LevelUpFlow; ação `levelUp` com aceite Fighter/Cleric 1→20 testado; `senses` de espécie na ficha; dialog de Preferências (fontes + XP/marco, defaults globais em `forge-fate-preferences:v1`); UX F1B restante: contadores inline (fonte única com a validação — corrigiu rogue 4/ranger 3), diff item a item ao trocar classe, barra mobile + drawer da ficha viva, tooltip de fórmula do PV. Pendente desta fase p/ frente: filtro efetivo de `activeSources` nos catálogos (F5/F6) e pendência `warning` para fonte desativada.
- **Dependências:** F1. **Riscos:** shape de subclasse no 5eTools varia por classe → testes por classe.

### Fase 3 — Modo Iniciante e modos de criação
- **Objetivo:** modal inicial com 3 caminhos (Guiado / Padrão / Construção Rápida), hints + cards + glossário, quiz "me ajude a escolher"; toggle persistente.
- **Arquivos:** `src/data/conceptGlossary.ts`, `src/data/quickBuildProfiles.ts` (kit recomendado por classe: perícias, atributos sugeridos, escolhas de recursos, equipamento padrão), `molecules/HelpHint.tsx`, `molecules/StepIntroCard.tsx`, quiz na etapa Classe, dialog inicial no `Dashboard.tsx`, preferência `forge-fate-preferences:v1`, `choices.beginnerMode` (**bump v7** — ou agrupar com v6 se fases 2–3 aterrissarem juntas).
- **Tarefas extras (DDB — seção 28.1 nº 2 e 28.2 nº 6):** Construção Rápida aplica o `quickBuildProfile` da classe pelas **mesmas ações do store** e navega direto à etapa 8 (nome) — a engine valida como ficha normal; quiz de 5 perguntas randomizadas destacando exatamente 2 classes (principal em verde, segunda opção em âmbar; nunca travando as demais).
- **Aceite:** iniciante completa ficha só com o guia; Construção Rápida gera ficha jogável sem pendência bloqueante em < 1 minuto para cada classe 2024; veterano com modo off não vê nada extra; cobertura de todos os conceitos da seção 9.4; tudo acessível por teclado.
- **Dependências:** nenhuma dura (pode paralelizar com F2). **Riscos:** excesso de conteúdo didático poluindo a UI para veteranos → tudo condicionado ao toggle e colapsável.
- **✅ Status — concluída:** modal inicial com Guiado/Padrão/Construção Rápida (`Dashboard.tsx`, `quickBuildProfiles.ts`), glossário (`conceptGlossary.ts`), `HelpHint`/`StepIntroCard`, quiz de classe (`classQuiz.ts`, `guidedChoiceQuiz.ts`) e preferência persistida.

### Fase 4 — Feats e ASI completos
- **Objetivo:** Origin/General/Epic Boons categorizados; pré-requisitos; **efeitos aplicados**.
- **Arquivos:** `src/adapters/featCatalog.ts` (+`category`, +`applyFeatEffects(build, feat)` para ASI parcial/velocidade/iniciativa/proficiências), `characterSelectors.ts` (compor efeitos), `AsiOrFeatStep` (filtro por categoria/pré-requisito, explicação ASI vs. feat), fix do origin feat do antecedente (seção 13).
- **Aceite:** feat com +1 atributo reflete em tudo; Epic Boon só nível 19+; pré-requisito bloqueia com motivo visível; origin feat com descrição correta.
- **Dependências:** F1 (composição de bônus), F2 (níveis). **Riscos:** efeitos textuais não-mecanizáveis → aplicar só efeitos estruturados; resto vira feature textual na ficha (decisão registrada, não bug).
- **✅ Status — fundação concluída:** catálogo com categorias/pré-requisitos/caps (`featCatalog.ts`), exclusividade ASI×feat no level-up, efeitos mecânicos curados aplicados. **Pendente (registrado no ruler):** ampliar a mecanização de efeitos além do subconjunto curado.

### Fase 5 — Magias
- **Objetivo:** domínio de spells completo (seção 15).
- **Arquivos:** `src/services/spellService.ts`, `src/adapters/spellAdapter.ts`, `rules/spellcastingRules.ts`, `types/spells.ts`, `choices.spellcasting` (**bump v8**), UI na etapa 2 + `SpellsStep` no level-up + painel na ficha.
- **Tarefas extras (DDB — seção 28.2 nº 5 e 10):** busca por nome + filtros por círculo/escola/fonte com **badges de fonte** nos cards (respeitando `creationPreferences.activeSources`); skeletons (`ui/skeleton.tsx`) durante carregamento sob demanda do catálogo.
- **Aceite:** testes da seção 15.3; conjurador exporta magias no Foundry; iniciante entende slots; catálogo de centenas de magias navegável com busca/filtros e contadores ("2 de 3 truques").
- **Dependências:** F1, F2, F4 (feats de magia opcionais). **Riscos:** volume de dados (622 KB PHB + 581 KB XPHB) → carregar sob demanda por classe; tabelas de slots divergentes (warlock) → módulo por tipo de caster.
- **✅ Status — concluída:** `spellService`, `spellAdapter`, `rules/spellcastingRules.ts`, `types/spells.ts`, `SpellCatalogPicker` e `SpellsStep` no level-up; CD/ataque/slots/limites derivados no summary e exportados.

### Fase 5b — Play mode da ficha
- **Objetivo:** a ficha vira mesa de jogo: PV atual, descansos, usos de recursos, slots gastos, inspiração, overrides sinalizados (seção 28.1 nº 8 e 9).
- **Arquivos:** novo bloco `playState` em `CharacterBuild` (**bump v9** — seção 5.1), `rules/restRules.ts` (descanso curto/longo: o que reseta, puro e testado), ações no store (`applyDamage`, `heal`, `setTempHp`, `spendSlot`, `useResource`, `shortRest`, `longRest`, `toggleInspiration`, `setOverride`), `CharacterSheetPage` + `organisms/sheet/*` (tracker de PV com dano/cura/temp, checkboxes de usos por recurso, botões de descanso, badge de inspiração — `DeathSavesOverlay` e `ConditionsPanel` já existem e passam a ler/escrever `playState`).
- **Aceite:** dano/cura nunca produz PV inválido (clamp 0..máx+temp); descanso longo restaura PV/slots/recursos conforme regra 2024 e descanso curto permite gastar dados de vida; overrides de PV máx/CA exibem badge "manual" com reset; tudo persiste no Vault e sobrevive a reload.
- **Dependências:** F2 (recursos por nível), F5 (slots). **Riscos:** misturar `playState` com `choices` → bloco separado por construção; regras de reset por recurso variam → tabela de recuperação (`shortRest`/`longRest`) no dado normalizado do recurso.
- **✅ Status — concluída:** bloco `playState` no contrato, `rules/restRules.ts`, ações de dano/cura/descanso/slots/recursos/condições/inspiração/overrides, painéis em `organisms/sheet/*`, notas e diário de campanha persistidos.

### Fase 6 — Inventário real

✅ **Status 2026-07-06:** concluída. `equippedItemIds` chegou no schema v10; o catálogo normaliza itens heterogêneos com fallback defensivo, expõe busca/filtros/badges/skeletons, e equipar/desequipar recalcula CA, ataques e carga derivada em tempo real.

- **Objetivo:** itens normalizados com efeitos mecânicos (seção 16).
- **Arquivos:** `itemCatalogAdapter.ts`, `armorClassRules.ts`/`attackRules.ts` (v2), `equippedItemIds` (**bump v10**), `InventoryManager.tsx`, `EquipmentChecklist.tsx`.
- **Tarefas extras (DDB — seção 28.2 nº 5 e 10):** busca por nome + filtro por tipo/fonte com badges no catálogo de itens; skeletons no grid.
- **Aceite:** testes da 16.2; equipar/desequipar muda CA/ataques em tempo real; carga derivada; catálogo navegável com busca/filtros.
- **Dependências:** F1. **Riscos:** dados de item heterogêneos → normalizador defensivo com fallback `gear`.

### Fase 7 — AST de texto de regras + cards accordion

✅ **Status 2026-07-06:** concluída. `rulesTextAst` e `RulesTextView` centralizam render/texto puro com golden tests, consumidores principais usam o AST e a duplicação histórica de testes de `textParser` foi removida do fluxo ativo.

- **Objetivo:** renderização unificada (seção 18); matar duplicação de testes; catálogos com cards colapsáveis padrão DDB.
- **Arquivos:** `src/adapters/rulesTextAst.ts`, `molecules/RulesTextView.tsx`, migração de consumidores, remoção dos 5 testes duplicados de `textParser`; `WizardChoiceCard.tsx` evoluído.
- **Tarefas extras (DDB — seção 28.2 nº 4):** `WizardChoiceCard` colapsado por padrão com 1 linha de resumo, expansão de detalhes via `RulesTextView` (`ui/accordion.tsx` já existe) e botão "Escolher" explícito (não só card clicável) — melhora acessibilidade e densidade dos catálogos de classes/espécies/antecedentes.
- **Aceite:** golden tests; nenhum consumidor usa `textParser.tsx` diretamente (deprecar); zero exceção com dados reais; cards operáveis por teclado (expandir e escolher são ações distintas e nomeadas).
- **Dependências:** nenhuma dura; **antes de F9** (PDF precisa do AST).

### Fase 8 — Export/Import JSON canônico + descrição rica
- **Objetivo:** seção 19.1 + etapa 8 completa (identidade, físico, personalidade, retrato — seção 28.1 nº 4, 5 e 6), já que export/PDF consomem esses campos.
- **Arquivos:** `src/utils/canonicalExport.ts`, `types/export.ts`, UI no Dashboard/Conclusão/ficha; `CharacterDescription` + `personalDetailsSchema.ts` estendidos (**bump v11**: alinhamento, fé, altura, peso, idade, olhos, cabelo, pele, `portraitId` — todos opcionais); sugestões de personalidade por antecedente (dados de `backgrounds.json`) com botão "sugerir"; galeria local de retratos autorais em `public/portraits/` (seleção na etapa 8, exibição no `CharacterCard` e no PDF); gerador de nome aleatório por espécie (`src/data/nameGenerator.ts`).
- **Aceite:** round-trip sem perda (incluindo os campos novos); import de schema antigo migra; import inválido falha com mensagem clara; retrato aparece no Dashboard; sugestão de personalidade respeita o antecedente selecionado e permanece editável.
- **Dependências:** contrato estável (após F5b/F6 — ou seja, bumps v6–v10 aterrissados). Upload de retrato próprio: pós-v1.
- **✅ Status — núcleo concluído:** `canonicalExport.ts` + `types/export.ts` com envelope versionado e round-trip testado (inclusive schemas legados); import no Dashboard grava no Vault com `saveId` novo; descrição rica (detalhes físicos, personalidade sugerida, galeria de retratos, gerador de nomes) entregue. **Pendente (P0 no ruler):** ação de export JSON canônico como UI de primeira classe em Vault/conclusão/ficha.

### Fase 9 — PDF
- **Objetivo:** seção 19.3. **Arquivos:** `src/adapters/pdfAdapter.ts` (+dep `@react-pdf/renderer`).
- **Aceite:** smoke tests; PDF legível de conjurador e marcial, incluindo retrato e descrição rica. **Dependências:** F5, F6, F7, F8 (descrição estendida e `portraitId` entram no PDF).
- **✅ Status — concluída:** `pdfAdapter` + `pdfAdapterDocument` com layout estilo ficha oficial (moedas, passivas, notas em markdown) e testes-matriz (marcial, conjurador, alto nível, descrição rica, inventário, retrato, notas longas). **Pendente (baixo, no ruler):** QA visual de impressão com PDFs reais.

### Fase 10 — Preparação para multiclasse (design, não implementação)
- **Objetivo:** garantir que nada das fases anteriores impeça `classLevels[]`.
- **Tarefas:** ADR documentando a migração futura (`selectedClassId` → `classLevels[{classId, level, subclassId}]`, PB = nível total, slots multiclasse); revisar que engine recebe "classe+nível" como parâmetro (não lê estado global singular).
- **Aceite:** ADR aprovado; nenhuma função nova das fases 1–9 assume classe única em assinatura onde poderia receber lista.

---

## 23. Backlog Técnico

- `savingThrows` por `AttributeKey` em vez de label pt-BR (F1).
- `SheetFeature.source` ganhar `"subclass" | "feat"` no union (F2/F4).
- Excluir `class-mystic`/`class-sidekick` do builder via allowlist (F2).
- `scripts/prune-data.js` / `build-player-lore.js`: documentar no README quando rodar e o que produzem.
- Tipar retorno de `validateBuilderStep` como `Pendency[]` (F1) mantendo compat com strings na UI até migrar.
- Revisar `xp/xpThreshold` (hoje XP é *derivado do nível* — decidir se XP manual entra no escopo ou se remove do summary).
- ~~Auditar `types/` (raiz) vs `src/types/` — unificar convenção de import~~ — **resolvido 2026-07-15**: contratos consolidados em `src/types/` (import `@/src/types/*`); `hooks/` da raiz também migrou para `src/hooks/` (ver `guides/ORGANIZATION.md` §5).
- Adicionar script `test:watch` e `format` ao `package.json` (DX).
- `README.md`: garantir que não menciona Vite e aponta para este plano + MANIFESTO.

## 24. Backlog de Produto/UX

> Vários itens deste backlog foram **promovidos a tarefas de fase** (seção 22) após o comparativo com o D&D Beyond (seção 28): autosave visível, stepper com estados, diff de troca, tooltip de fórmula, busca/filtros e barra mobile agora são entregas da F1/F2/F5/F6. Ficam aqui os itens ainda não amarrados a fase:

- Confirmação antes de excluir personagem (dialog com nome do personagem) — verificar se `CharacterRoster` já pede; senão, criar.
- Estado vazio do Dashboard com CTA ilustrado ("Forje seu primeiro herói").
- Badge de pendências no `CharacterCard` ("Ficha incompleta — 3 pendências") linkando para a etapa certa.
- Modo experiente: atalhos de teclado para avançar/voltar etapa.
- Recuperação de sessão: banner "você tem uma criação em andamento" no Dashboard quando houver draft no sessionStorage.
- Randomizadores adicionais (personagem completo aleatório, pré-montados) — pós-v1 (seção 28).

## 25. Critérios Globais de Aceite (nenhuma entrega pode violar)

1. `npm run test`, `npm run typecheck`, `npm run lint` verdes.
2. Nenhum número de ficha calculado em componente React.
3. Shape persistido mudou ⇒ bump + migração + teste de migração **nas duas pontas** (`migrate` do builder em `sessionStorage` **e** `normalizeCharacterBuild` do Vault em `localStorage`) no mesmo PR — checklist da seção 26.1.
4. Wizard mantém as 9 etapas e a ordem atual.
5. Nenhum caminho de UI destrói dados sem confirmação explícita.
6. Todo interativo novo é operável por teclado e tem nome acessível.
7. Tokens de cor do `globals.css` — zero hex literal em `className`.
8. Sem dependência nova fora da lista aprovada na **seção 26.2** — adicionar uma exige registrar justificativa lá primeiro.
9. Export sempre versionado; import sempre validado.
10. `selectCharacterSheetSummary` permanece orquestrador: nenhum PR adiciona cálculo inline ao selector — todo número novo nasce como função pura em `rules/` ou `src/adapters/` com teste próprio (guarda da seção 26.1).

## 26. Riscos e Decisões Arquiteturais

| Risco/Decisão | Posição |
|---|---|
| **Conteúdo aberto** | Decisão de produto: o site é **completamente aberto aos usuários** — os dados de regras em `public/data/` permanecem no bundle e disponíveis a todos, sem gate de conta ou paywall. Glossário e textos didáticos continuam autorais por qualidade (linguagem para iniciantes), não por restrição. |
| **Foundry como formato interno** | Rejeitado — adapter externo somente (decisão preservada). |
| **Recalcular vs. cachear `derivedSheet`** | Cache de conveniência; verdade é sempre recálculo no load (decisão preservada). |
| **`skillModifierOverrides`** | Mantido como escape explícito e sinalizado; nunca caminho padrão. |
| **Multiclasse agora** | Adiada (F10 = só design). Trade-off aceito: migração v(N)→classLevels custará um bump grande, mas evita complexidade prematura em slots/PB/proficiências. |
| 🔴 **Selector inchar de novo** | Risco crítico nº 1 de engenharia — salvaguardas obrigatórias na **seção 26.1**. |
| **Next 16 breaking changes** | Ler `node_modules/next/dist/docs/` antes de mexer em rotas/layouts; não confiar em memória de versões antigas. |
| 🔴 **Persistência dupla (session/local)** | Risco crítico nº 2 de engenharia — salvaguardas obrigatórias na **seção 26.1**. |
| **Volume de dados de magias** | Carregamento sob demanda por classe/fonte; nunca importar tudo no bundle inicial. |

### 26.1 Salvaguardas obrigatórias (os dois riscos críticos de engenharia)

#### A. Regra vazando para `characterSelectors.ts`

`characterSelectors.ts` tem hoje **361 linhas** misturando cálculo (perícias, saves, passivas, armas, XP, moedas) com montagem do resumo. Magias e inventário são os dois maiores volumes de regra do roadmap — sem disciplina, o selector vira monólito e a "verdade derivada única" deixa de ser auditável. Salvaguardas:

1. **Ordem de fases é bloqueante:** Fase 1 (extração da engine) é pré-condição dura das Fases 5 (magias) e 6 (inventário). Nenhuma UI dessas fases entra em desenvolvimento antes de `skillRules`/`savingThrowRules`/`attackRules`/`armorClassRules` existirem com testes.
2. **Orçamento de linhas:** após a Fase 1, `characterSelectors.ts` fica abaixo de **~150 linhas** e assim permanece. Se um PR o fizer crescer além disso, o PR deve extrair o cálculo para `rules/`/`src/adapters/` antes do merge.
3. **Teste-guardião estrutural:** criar `src/store/_tests_/selectorPurity.test.ts` que (a) falha se `characterSelectors.ts` ultrapassar o orçamento de linhas e (b) faz snapshot do `CharacterSheetSummary` de um build fixture completo — qualquer mudança de valor derivado precisa ser intencional e revisada no diff do snapshot.
4. **Definição de "cálculo":** qualquer expressão que combine dois ou mais dados de regra (atributo + PB, item + DES, nível + tabela) é cálculo e pertence à engine. Mapeamento/formatação (label, abbr, ordenação) pode viver no selector.
5. **Checklist de revisão de PR:** "este PR adiciona `if`/aritmética nova dentro de `selectCharacterSheetSummary`?" — se sim, rejeitar e extrair.

#### B. Persistência dupla (`sessionStorage` do builder + `localStorage` do Vault)

Existem **dois caminhos de migração independentes** para o mesmo contrato: o `migrate` do persist middleware em `createCharacterStore.ts` (flat state do wizard) e o `normalizeCharacterBuild` em `characterBuildModel.ts` (aplicado na leitura do Vault por `characterService.ts`). Migrar só um deles corrompe silenciosamente o outro — o bug só aparece quando o usuário retoma um save antigo, dias depois. Salvaguardas:

1. **Checklist obrigatório de bump de schema** (copiar para a descrição de todo PR que altera `CharacterBuild`):
   - [ ] `CHARACTER_BUILD_SCHEMA_VERSION` incrementado em `src/types/characterBuild.ts`;
   - [ ] migração escrita no `migrate` do builder (`createCharacterStore.ts`);
   - [ ] migração/normalização escrita em `normalizeCharacterBuild` (`characterBuildModel.ts`) cobrindo o Vault;
   - [ ] teste de migração do builder com **fixture real do shape antigo** (padrão `schemaV5Migration.test.ts`);
   - [ ] teste de migração do Vault (leitura de save antigo via `characterService` → build válido no schema novo);
   - [ ] teste de round-trip flat ↔ `CharacterBuild` atualizado para o campo novo.
2. **Fixtures históricos permanentes:** manter em `src/store/_tests_/fixtures/` um `CharacterBuild` serializado de **cada** versão de schema já lançada (v1…vN). O teste de migração roda a cadeia completa vN→atual para todos — nenhum fixture é jamais atualizado para o shape novo (eles *são* o shape antigo).
3. **Ponto único de migração (meta da Fase 8):** convergir a lógica de migração dos dois caminhos para um módulo compartilhado (`migrateCharacterBuild(raw, fromVersion)`) chamado tanto pelo `migrate` do persist quanto pelo `normalizeCharacterBuild` — elimina a possibilidade de divergência por construção. Import de JSON canônico (seção 19) usa o mesmo módulo.
4. **Sem escrita fora dos serviços:** nenhum componente escreve em `localStorage`/`sessionStorage` diretamente — só `characterService.ts` e o persist middleware. Qualquer novo dado persistido (preferências do Modo Iniciante, por exemplo) ganha chave versionada própria (`forge-fate-preferences:v1`) e leitura tolerante a ausência/corrupção.

### 26.2 Dependências aprovadas

Lista fechada de bibliotecas aprovadas para o roadmap (critério global nº 8 — nada fora desta lista sem novo registro aqui). Todas já instaladas e, quando aplicável, configuradas:

**Runtime (`dependencies`):**

| Biblioteca | Versão | Justificativa | Fase |
|---|---|---|---|
| `@react-pdf/renderer` | `^4.5.1` | Geração do PDF da ficha com layout próprio (`src/adapters/pdfAdapter.ts`) | F9 |
| `@tanstack/react-virtual` | `^3.14.5` | Virtualização dos catálogos de magias (~500+) e itens — performance no mobile | F5/F6 |
| `cmdk` | `^1.1.1` | Busca/combobox dos catálogos (base do componente `Command` do shadcn) | F5/F6 |
| `match-sorter` | `^8.3.0` | Ranking de resultados de busca (tolerância a acentos, ordenação por relevância) | F5/F6 |
| `motion` | `^12.42.2` | Animação da rolagem 4d6, transições de etapa e drawer mobile | F1/F2 |
| `dompurify` | `^3.4.12` | Sanitização do preview de notas em markdown (defesa XSS) — reverte a rejeição original, que valia só para o AST de regras | pós-F9 (segurança) |
| `easymde` | `^2.21.0` | Editor markdown das notas da ficha (sem Font Awesome externo — CSP) | pós-F9 |
| `@vercel/analytics` / `@vercel/speed-insights` | `^2.x` | Telemetria de uso e performance no deploy Vercel | infra |

**Dev (`devDependencies`):**

| Biblioteca | Versão | Justificativa | Configuração |
|---|---|---|---|
| `@testing-library/user-event` | `^14.6.1` | Interações fiéis (teclado/cliques reais) nos testes de UI e de acessibilidade | uso direto nos testes |
| `vitest-axe` | `^0.1.0` | Testes automatizados de acessibilidade (axe-core) — exigência da seção 20 | matchers registrados em `vitest.setup.ts` |
| `@vitest/coverage-v8` | `^4.1.9` | Relatório de cobertura da engine ("testes acompanham regra") | bloco `coverage` em `vitest.config.ts` + script `test:coverage` |

**Rejeitadas (registrar aqui se a decisão mudar):** gerenciadores de estado extras (Redux/Jotai/TanStack Query), axios, dayjs/date-fns, kits de componente CSS-in-JS (MUI/Chakra), seedrandom (PRNG próprio de ~10 linhas em `abilityRollRules.ts`). *(DOMPurify foi rejeitado para o AST da F7 — que continua sem HTML bruto — mas aprovado depois para sanitizar o preview de notas markdown; ver tabela acima.)*

## 27. Checklist Final de Lançamento (v1 lançável)

- [ ] Fases 1–9 concluídas com critérios de aceite verdes.
- [ ] Criar, salvar, retomar, duplicar, excluir e importar personagem — testado manualmente nos 3 breakpoints.
- [ ] Um personagem de cada classe 2024 criado do nível 1 e upado até o 20 sem pendência falsa nem número errado (conferido contra as regras 2024).
- [ ] Iniciante real (teste de usabilidade com ≥1 pessoa que nunca jogou) termina uma ficha sem ajuda externa.
- [ ] Veterano cria ficha de nível 1 em < 5 minutos com modo guiado desligado; Construção Rápida gera ficha jogável em < 1 minuto para qualquer classe 2024.
- [ ] Play mode operacional: dano/cura/PV temporário, descanso curto/longo restaurando recursos e slots, usos por recurso e inspiração — persistindo no Vault.
- [ ] Preferências da criação (fontes ativas, XP/marco) aplicadas em todos os catálogos; método 4d6 disponível na etapa de Atributos.
- [ ] Etapa de Descrição completa: detalhes físicos/identidade, personalidade sugerida pelo antecedente, retrato da galeria refletido no Dashboard e no PDF.
- [ ] Export JSON → import → ficha idêntica; export Foundry importa no Foundry VTT (teste manual); PDF legível e imprimível.
- [ ] Navegação por teclado completa em wizard, dashboard e ficha; leitor de tela anuncia etapas e pendências; contraste AA auditado.
- [ ] Salvaguardas da seção 26.1 em vigor: selector dentro do orçamento com teste-guardião; fixtures de todos os schemas históricos migrando verde.
- [ ] `README.md` atualizado (stack Next.js, comandos, link para este plano); MANIFESTO §7 sincronizado.
- [ ] Suíte completa verde + smoke de `next build` sem erros.
- [ ] Migrações testadas de todos os schemas históricos (v1…vN) para o atual.

---

## 28. Comparativo com o D&D Beyond e Técnicas de UI/UX a Adotar

> Referência: builder oficial em `dndbeyond.com/characters/builder`. O objetivo **não é** copiar o DDB — o wizard de 9 etapas do Forge & Fate é a fundação e permanece — mas fechar lacunas funcionais que jogadores vindos de lá vão sentir falta, e absorver padrões de usabilidade comprovados.
>
> **Status: integrado ao roadmap para a v1.** As lacunas 1–10 e as técnicas 1–13 foram incorporadas às fases da seção 22 (e às seções 5, 8, 9 e 14) como entregas da primeira versão lançável. Ficam fora da v1 apenas: upload de retrato próprio (nº 6, parcial), link público (nº 11), homebrew (nº 12) e modo aleatório/pré-montados (nº 2, parcial). Esta seção permanece como registro da análise e rastreabilidade lacuna → fase.

### 28.1 Lacunas funcionais vs. D&D Beyond

| # | O que o DDB tem | Como funciona lá | Onde encaixa no Forge & Fate |
|---|---|---|---|
| 1 | **Etapa 0 — Preferências da criação** | Antes da 1ª escolha: fontes permitidas, regras opcionais, progressão por XP ou marco (milestone), aplicar/ignorar pré-requisitos, encumbrance on/off | Novo dialog "Preferências" acessível do header do builder (não uma 10ª etapa — preserva o wizard). Persistir em `choices` (por personagem) com defaults em `forge-fate-preferences:v1`. Primeiro corte: fonte(s) ativas + XP/marco. **✅ Integrado à Fase 2 (v1).** |
| 2 | **Modos de criação: Padrão / Construção Rápida / Aleatório / Pré-montados** | "Quick Build" aplica as escolhas recomendadas da classe em um clique; "Random" sorteia tudo; pré-montados prontos para jogar | Estender o modal inicial do Modo Iniciante (seção 9.1) para 3 caminhos: **Guiado** (beginner mode), **Padrão** (wizard normal), **Construção Rápida** (aplica kit recomendado por classe e cai direto na etapa 8 para nomear). Aleatório/pré-montados: pós-v1. **✅ Guiado + Construção Rápida integrados à Fase 3 (v1).** |
| 3 | **Rolagem de atributos (4d6, descarta o menor)** | Quarto método de geração, com animação de dados e reordenação dos resultados | Adicionar `"roll-4d6"` a `AttributeGenerationMethod` (bump de schema) + `rules/abilityRollRules.ts` puro (roll com seed testável) + UI de reordenar resultados na etapa 6. **✅ Integrado à Fase 2 (v1).** |
| 4 | **Detalhes físicos e identidade** | Alinhamento, fé, altura, peso, idade, olhos, cabelo, pele, gênero | Estender `CharacterDescription` + `personalDetailsSchema.ts` (zod) na etapa 8; campos todos opcionais; fluem para export/PDF. **✅ Integrado à Fase 8 (v1).** |
| 5 | **Personalidade sugerida pelo antecedente** | Traços/ideais/vínculos/defeitos com sugestões do background e botão "rolar" | Etapa 8 ganha sugestões por `selectedBackgroundId` (dados já existem em `backgrounds.json`) com botão "sugerir" (aleatório) e edição livre. **✅ Integrado à Fase 8 (v1).** |
| 6 | **Retrato/avatar** | Galeria de retratos + upload | v1: galeria local de retratos autorais (`public/portraits/`) selecionável na etapa 8, refletida no `CharacterCard` do Dashboard e no PDF. Upload de imagem: pós-v1 (custo de storage/serialização). **✅ Galeria integrada à Fase 8 (v1); upload pós-v1.** |
| 7 | **Seleção de magias na criação** | Etapa dedicada para conjuradores, com filtros e contadores | **Já planejado — Fase 5** (entra na etapa 2 e no level-up, sem 10ª etapa). |
| 8 | **Modo de jogo na ficha (play mode)** | PV atual/dano/cura, descanso curto/longo, usos de recursos por descanso, condições, inspiração | A `CharacterSheetPage` já tem partes (death saves, `ConditionsPanel`). Completar: tracker de PV com dano/cura/temp, botões de descanso que restauram recursos/slots, checkboxes de usos por recurso. **✅ Integrado à Fase 5b (v1), via bloco `playState`.** |
| 9 | **Overrides sinalizados de PV/CA e bônus custom** | Ajustes manuais marcados como override, reversíveis | Generalizar o padrão de `skillModifierOverrides` (`isOverridden` + reset) para PV máximo e CA — sempre visível que é manual. **✅ Integrado à Fase 5b (v1), via `playState.overrides`.** |
| 10 | **Busca global e filtro por fonte nos catálogos** | Busca por nome + badges de fonte em cada card | Obrigatório para magias e itens, que têm centenas de entradas. **✅ Integrado às Fases 5 e 6 (v1), respeitando `creationPreferences.activeSources`.** |
| 11 | **Compartilhar ficha por link** | Ficha pública somente-leitura via URL | Fora do escopo v1 (persistência é local). O **export JSON canônico (F8) é o substituto portátil**; link público entra numa futura fase de nuvem. **Visão futura registrada.** |
| 12 | **Homebrew** | Conteúdo custom do usuário | Fora do escopo v1. A arquitetura já favorece: catálogos entram por `services/` + adapters — um futuro `homebrewService` plugaria no mesmo funil de normalização. **Visão futura.** |

### 28.2 Técnicas de UI/UX do DDB a incorporar

Padrões observados no builder do DDB, adaptados à identidade dark fantasy e ao stepper existente (`builderStepNavigation.ts` + `BuilderSidebar`):

1. **Estado de conclusão por etapa no stepper** — cada etapa exibe ✓ (completa), ● (atual), ⚠ (com pendência) ou 🔒 (bloqueada), derivado de `pendencyRules` (F1). Com `aria-current="step"` e anúncio em `aria-live`. *Hoje o stepper só marca a etapa atual.*
2. **Header/identidade persistente do personagem** — no DDB, nome + retrato + classe/nível ficam visíveis em toda etapa. Temos a ficha viva no `BuilderSidebar` (desktop); no **mobile**, adicionar barra compacta fixa (nome · classe · nível · PV · CA) que expande o sidebar como drawer (`ui/sheet.tsx` + `use-mobile.ts` já existem).
3. **Contadores de escolha inline** — "2 de 3 perícias escolhidas", "1 escolha restante" junto de cada grupo (perícias, idiomas, feature-options, magias). Reduz a principal fonte de pendência invisível. Derivar dos mesmos validadores de `builderValidation`.
4. **Cards accordion com resumo fechado + CTA claro** — DDB mostra o card colapsado com 1 linha de resumo e botão de ação explícito ("Escolher"). Aplicar ao catálogo de classes/espécies/antecedentes: `WizardChoiceCard` colapsado por padrão, expandindo detalhes via `RulesTextView` (F7), com botão "Escolher" real (não só card clicável) — também melhora acessibilidade.
5. **Badges de fonte** — cada card de classe/magia/item mostra a fonte (PHB'24 etc.) como badge discreta; combina com o filtro de fontes da lacuna nº 1.
6. **"Me ajude a escolher"** — DDB oferece orientação por classe; no Forge & Fate, um quiz curto de 3 perguntas no Modo Iniciante ("Prefere lutar de perto, à distância ou com magia?") que **destaca** (não trava) 2–3 classes sugeridas. **Fase 3.**
7. **Randomizadores pontuais** — botão de dado para: nome (gerador por espécie), personalidade (lacuna nº 5), atributos (lacuna nº 3). Baixo custo, alto encanto — e útil para mestres criando NPCs.
8. **Diff de consequências ao trocar escolha estrutural** — o DDB avisa o que será perdido ao trocar classe/espécie. Já previsto na seção 8 ("dialog listando o que será resetado") — o padrão DDB acrescenta: listar **item a item** (perícias, recursos, equipamento, magias) em vez de aviso genérico.
9. **Feedback de salvamento onipresente** — indicador "Salvo ✓ HH:MM" no header (já no backlog, seção 24) + toast `sonner` apenas em falha (sucesso é silencioso e constante).
10. **Skeletons nos catálogos** — `ui/skeleton.tsx` já existe; aplicar aos grids de classes/magias/itens durante carregamento sob demanda (relevante na F5, com centenas de magias).
11. **Barra de navegação inferior fixa no mobile** — "Voltar · [etapa X/9] · Avançar" sticky no rodapé, com o botão Avançar desabilitado + tooltip do motivo quando a validação bloqueia (nunca desabilitado sem explicação).
12. **Tooltip de fórmula nos números derivados** — "CA 16 = 14 (cota de malha) + 2 (escudo)" (já no backlog, seção 24) — o DDB faz isso nos modificadores; é a técnica que mais constrói confiança na matemática do site e ensina iniciantes de graça.
13. **Preview da ficha final a qualquer momento** — botão "Ver ficha" em todas as etapas abrindo o `CharacterSheetPreview` completo em modal/drawer, não só o resumo lateral — reforça o princípio "ficha como documento vivo".

### 28.3 Matriz de rastreabilidade (lacuna/técnica → fase da v1)

Todas as entregas abaixo fazem parte da **v1**; a coluna indica a fase da seção 22 responsável:

| Fase | Entregas desta seção |
|---|---|
| **F1 — Engine + UX de confiança** | 28.2 nº 1 (stepper com estados), 3 (contadores inline), 8 (diff item a item), 9 (autosave visível), 11 (barra mobile), 12 (tooltip de fórmula), 13 (preview "Ver ficha"), 2 (barra de identidade mobile) |
| **F2 — Progressão + preferências** | 28.1 nº 1 (preferências: fontes + XP/marco), 3 (rolagem 4d6) |
| **F3 — Modo Iniciante e modos de criação** | 28.1 nº 2 (Construção Rápida), 28.2 nº 6 (quiz "me ajude a escolher") |
| **F5 — Magias** | 28.1 nº 7 (seleção de magias), 10 (busca/filtros) · 28.2 nº 5 (badges de fonte), 10 (skeletons) |
| **F5b — Play mode** | 28.1 nº 8 (PV/descansos/usos/inspiração), 9 (overrides sinalizados de PV/CA) |
| **F6 — Inventário** | 28.1 nº 10 (busca/filtros de itens) · 28.2 nº 5, 10 |
| **F7 — AST de texto** | 28.2 nº 4 (cards accordion com CTA "Escolher") |
| **F8 — Export + descrição rica** | 28.1 nº 4 (detalhes físicos/identidade), 5 (personalidade por antecedente), 6 (galeria de retratos) · 28.2 nº 7 (randomizadores de nome/personalidade/atributos) |

**Fora da v1 (registrado como visão futura):** 28.1 nº 6 parcial (upload de retrato próprio), nº 11 (link público — o export JSON canônico da F8 é o substituto portátil), nº 12 (homebrew — futuro `homebrewService` no mesmo funil de normalização) e nº 2 parcial (modo aleatório e pré-montados).
