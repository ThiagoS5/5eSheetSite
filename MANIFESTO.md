# 📜 Forge & Fate — Manifesto de Visão e Arquitetura

> **Como usar este documento.** Este é o estado final que o projeto deve atingir. Antes de qualquer tarefa, leia a seção relevante e pergunte: *"isto aproxima o código da visão, ou cria dívida que terei de desfazer no nível 20?"*. Decisões de curto prazo que contrariem este manifesto devem ser justificadas ou rejeitadas. É um documento vivo: ao concluir uma feature de roadmap, atualize a seção 7 (Estado Atual vs. Visão).

---

## 1. O Objetivo Final (A Estrela Guia)

O **Forge & Fate** não é um formulário de preenchimento. O objetivo é ser a **referência definitiva em criador de fichas web para D&D 5e (regras 2024)** — robusto a ponto de rivalizar com plataformas oficiais (D&D Beyond), com uma experiência imersiva, rápida e **matematicamente impecável**. Toda decisão de código mira o longo prazo e a escalabilidade.

### 1.1 Idioma canônico: English-only

O **Forge & Fate é um produto em inglês**. A interface final, textos estáticos, `aria-labels`, mensagens de validação, estados vazios, tooltips, testes que travam copy, metadados, commits, PRs e documentação técnica de desenvolvimento devem ser escritos em **inglês nativo**, usando vocabulário canônico de D&D 5e.

Português **não é idioma-alvo do produto nem do desenvolvimento**. Qualquer texto novo em português deve ser tratado como dívida ou legado a migrar, exceto quando for necessário apenas para reconhecer saves antigos, nomes internos históricos ou dados externos imutáveis. Como a base 5etools é estruturalmente em inglês, a UI deve preservar termos brutos da API com `translate="no"` / `notranslate` quando isso evitar que o Google Tradutor do navegador quebre nomes canônicos, siglas ou valores de regra.

## 2. Escopo Core e Ciclo de Vida do Personagem

O sistema suporta a jornada completa de um personagem — o que exige um estado global (Zustand) extremamente bem estruturado e um modelo de dados versionado.

- **Progressão Épica (Nível 1 ao 20):** do camponês nível 1 ao semideus nível 20, com proficiência, HP, recursos e magias calculados dinamicamente. O bônus de proficiência já é derivado do nível (`getProficiencyBonus(level)`).
- **Multiclasse Integrada:** banco de dados e interface preparados para ramificações de multiclasse, respeitando pré-requisitos de atributo e sobreposição de proficiências.
- **Evolução Contínua (Level Up Vivo):** a ficha **não** é read-only após a criação. O jogador cria hoje e, semanas depois, "Upa de Nível", adiciona talentos, rola novos PV e atualiza o inventário (itens mágicos do Mestre).
- **Cofre de Personagens (Character Vault):** hub que armazena e gerencia múltiplos personagens simultaneamente.

## 3. Integração e Saída de Dados

Um personagem precisa sair da plataforma para a mesa (física ou virtual):
- **Exportação para VTT:** JSON estruturado compatível com o sistema D&D 5e do Foundry VTT.
- **Geração de PDF:** ficha tradicional otimizada para impressão.

## 4. Identidade Visual e UX (Dark Fantasy)

A interface deve parecer um **"painel tático avançado"**, não um site corporativo.
- **Tech Stack UI:** Tailwind CSS v4 (CSS-first, sem `tailwind.config`), shadcn/ui, Lucide + FontAwesome.
- **Estética:** Dark Fantasy. Fundo obsidiana, bordas sutis, foco em carmesim vibrante.
- **Densidade & Acessibilidade:** alta densidade (tabelas, accordions, split-panes) sem poluição. Esconder complexidade até o usuário precisar dela. Sempre `aria-*` e foco visível.

### 4.1 Paleta canônica (design tokens — use as classes, nunca hex literais)

> ⚠️ **Importante:** as cores são **design tokens** definidos em OKLCH em `app/globals.css` (`:root, .dark` + `@theme inline`). **Não use hex literais** (`bg-[#…]`, `text-[#…]`, `border-[#…]`) em `className` — use as utilities de token abaixo. Para mudar uma cor, edite o token no `globals.css`; nunca espalhe hex pelos componentes.

| Intenção | Classe de token |
|---|---|
| Fundo base (obsidiana) | `bg-background` |
| Fundo atenuado | `bg-muted` |
| Superfície/card | `bg-card` / `bg-surface-raised` |
| Superfície interna (card dentro de card) | `bg-surface-nested` |
| Superfície base / elevada | `bg-surface-base` / `bg-surface-elevated` |
| Borda sutil | `border-border` (padrão) / `border-border/50` (mais sutil) |
| Texto primário | `text-foreground` |
| Texto secundário | `text-subdued` |
| Texto atenuado (labels) | `text-muted-foreground` |
| Texto muito fraco | `text-faint` |
| Carmesim primário (foco/ativo) | `text-primary` / `border-primary` / `bg-primary` |
| Carmesim alternativo | `text-brand-crimson-alt` / `bg-brand-crimson-alt` |
| Ouro (destaque/aviso) | `text-accent` / `bg-accent` · alt: `brand-gold-alt` |
| Verde / azul de marca | `brand-green` / `brand-blue` |
| Tons decorativos de classe/antecedente | `tone-arcane*`, `tone-druid*`, `tone-gold*`, `tone-crimson*` |

> **Acessibilidade (WCAG 2.2 AA):** carmesim (`text-primary`) **não** passa AA como texto pequeno em fundo escuro — use só em texto grande (≥24px), ícones e bordas. Para labels pequenos, use `text-foreground` com um indicador carmesim (`border-l-2 border-primary`, ícone ou sublinhado). Nenhum texto funcional abaixo de `text-[10px]`.

Componentes shadcn ficam em `src/components/ui/`. Ícones via `src/components/atoms/FontAwesomeIcon.tsx` (classes `fa-*`) ou `lucide-react`.

## 5. Engenharia e Código (Princípios Inegociáveis)

Aja como **Engenheiro de Software Sênior** focado em manutenibilidade.
- **SOLID / separação de camadas:** regras de D&D vivem fora do React. Lógica → `rules/` e `src/adapters/`; apresentação → `src/components/`; estado → `src/store/`; dados → `src/services/`.
- **Source Isolation:** nunca misture fontes. Classe, Antecedente e Espécie habitam blocos independentes e estados separados no Zustand, agrupados por origem. *Implementação de referência:* equipamento isolado por fonte (`equipmentChoicesBySource` no store + `EquipmentChecklist.tsx`). Exceções de regra de uma fonte nunca quebram outra.
- **Zero Dívida Técnica Voluntária:** se uma feature exige refatorar o store para escalar (como o equipamento por fontes), **proponha a refatoração**. Nada de gambiarra que será desfeita no nível 20.

---

## 6. Mapa da Arquitetura Atual (aterrado no código)

Fluxo de dados central:

```
public/data/*.json  ──►  src/services/ruleService.ts  ──►  Builder (UI)
   (dados 5e brutos)        (+ src/adapters/fiveEToolsAdapter.ts)        │
                                                                         ▼
                              src/store/ (Zustand)  ◄──►  CharacterBuild (modelo canônico)
                                       │                  src/types/characterBuild.ts
                                       ▼
                       selectCharacterSheetSummary()  ──►  CharacterSheetSummary (verdade derivada)
                                       │                          │
                          src/utils/foundryAdapter.ts        UI (resumo/preview)
                          (export VTT)        [PDF: a criar]
```

### Camadas e responsabilidades

- **`public/data/`** — dados 5e brutos (classes, antecedentes, espécies, magias, itens). Fonte da verdade de regras.
- **`src/services/`** — acesso a dados.
  - `ruleService.ts`: `getBuilderClasses / getBuilderSpecies / getBuilderBackgrounds / getBuilderEquipmentOptions / getBuilderLanguages`.
  - `raw5eService.ts`: normalização do formato 5etools.
  - `characterService.ts`: **o Vault** — `listCharacters / getCharacter / saveCharacter / duplicateCharacter / deleteCharacter` em localStorage (`forge-fate-character-saves:v1`). Normaliza (migra) todo build na leitura.
- **`src/adapters/`** — cálculo e adaptação.
  - `characterDerivedAdapter.ts`: `getAbilityModifier`, `getProficiencyBonus(level)`, `calculateFinalAttributes`, `calculateInitialHitPoints`, `calculateArmorClass`. **Toda matemática de ficha mora aqui.**
  - `fiveEToolsAdapter.ts`: traduz dados 5etools para os tipos do builder.
- **`rules/`** — regras puras, sem React: `builderValidation.ts` (validação por etapa), `pointBuyRules.ts`, `characterRules.ts` (barrel).
- **`src/store/`** — estado Zustand e serialização.
  - `characterStore.types.ts`: `FlatCharacterBuilderState` + `CharacterBuilderActions`.
  - `createCharacterStore.ts`: store, ações, `persist` (sessionStorage `ficha-5e-builder`), `migrate`, `extractFlatState`.
  - `characterBuildModel.ts`: serialização flat↔`CharacterBuild`, `normalizeFlatState`, `deriveSheet`, defaults.
  - `characterSelectors.ts`: `selectCharacterSheetSummary()` — **a única fonte da verdade derivada** (HP, CA, modificadores, equipamento, validações).
  - `useCharacterStore.tsx`: hook de acesso.
- **`src/components/`** — Atomic Design: `atoms/ → molecules/ → organisms/ → templates/ → pages/`, mais `ui/` (shadcn). Builder: `app/builder/[step]/page.tsx` → `BuilderStepPanel.tsx` (9 etapas via `templates/builderStepNavigation.ts`), `BuilderShell.tsx`, `BuilderSidebar.tsx`. Vault: `pages/Dashboard.tsx`, `organisms/CharacterRoster.tsx`, `molecules/CharacterCard.tsx`.
- **`src/types/` & `types/`** — `characterBuild.ts` (modelo canônico), `builder.ts`, `dnd.ts`, `Character.ts`, `fiveETools.ts`.

### Modelo canônico de persistência

`CharacterBuild` (`src/types/characterBuild.ts`) é o contrato serializado:

```ts
interface CharacterBuild {
  draft;          // estado do wizard: etapa atual, steps desbloqueados, equipmentChoicesBySource, descrição
  progression;    // { level, levelChoices: Record<levelStr, ...> }  ← hook para 1–20
  choices;        // classe/espécie/antecedente, perícias, atributos, idiomas
  derivedSheet;   // CharacterSheetSummary congelado (recalculado em toda gravação)
  exportMetadata; // { schemaVersion, saveId, createdAt, updatedAt }
}
```

Regra de ouro: **mudou o shape persistido → bumpe `CHARACTER_BUILD_SCHEMA_VERSION`, escreva a migração e cubra com teste.** (Lição da refatoração de equipamento: a v1→v2 mapeia o legado `equipmentAcquisitionMode` para `equipmentChoicesBySource.class`.)

---

## 7. Estado Atual vs. Visão (Roadmap / onde cada feature se encaixa)

| Capacidade (Visão) | Hoje | Onde plugar a evolução |
|---|---|---|
| **Vault (múltiplos personagens)** | ✅ Existe | `characterService.ts` + `Dashboard`. Evoluir: sincronização/cloud futura. |
| **Export VTT (Foundry)** | ✅ Existe | `src/utils/foundryAdapter.ts` consumindo `CharacterSheetSummary`. |
| **Cálculo level-aware** | ✅ | `getProficiencyBonus(level)`, HP via `calculateMaxHitPoints(hitDie, con, level)` (regra fixa do 5e 2024) e features de classe filtradas por `level` no `selectCharacterSheetSummary`. |
| **Progressão 1–20** | 🟡 Parcial | Derivação já é level-aware (HP + features). Faltam: **UI para definir/subir de nível** (o `setLevel` existe mas nada o aciona), consumo de `progression.levelChoices` (ASI/talentos por nível) e recursos por nível (slots de magia). |
| **Multiclasse** | ⛔ Falta | `choices.selectedClassId` é **singular**. Refatorar para `classes: { classId, level, subclassId }[]` (refatoração deliberada do store + bump de schema + migração). Proficiência total = soma dos níveis. |
| **Subclasse** | ⛔ Falta | Dados em `public/data/class/*`. Modelar `subclassId` por classe em `choices`/`classes[]`. |
| **Magias (spellcasting)** | ⛔ Falta | Dados em `public/data/spells/`. Adicionar modelo de magias preparadas/conhecidas em `CharacterBuild.choices` + slots derivados por nível no adapter. |
| **Level Up Vivo (pós-criação)** | ⛔ Falta | Ações de "level up" no store que adicionam um `levelChoices[n]` sem reabrir o wizard; recomputar `derivedSheet`. |
| **Export PDF** | ⛔ Falta | Criar `src/adapters/pdfAdapter.ts` (paralelo ao `foundryAdapter`), consumindo o mesmo `CharacterSheetSummary`. |

Princípio de roadmap: **toda nova feature consome `CharacterSheetSummary` ou estende `CharacterBuild` — nunca recalcula regras na camada de UI.**

---

## 8. Invariantes de Engenharia (Definition of Done)

Uma mudança só está "pronta" quando:
1. **TDD:** teste primeiro (Vitest). Testa comportamento, não mocks. `npx vitest run` 100% verde.
2. **Tipos limpos:** `npx tsc --noEmit` sem erros.
3. **Lint limpo:** `npx eslint <arquivos tocados>` sem erros.
4. **Verdade derivada única:** HP/CA/modificadores/validação vêm de `selectCharacterSheetSummary` / `src/adapters/`, nunca recalculados na UI.
5. **Source isolation preservada:** escolhas por origem ficam em estados separados; uma fonte não pode corromper outra.
6. **Persistência versionada:** mudou o shape de `CharacterBuild` → bump `CHARACTER_BUILD_SCHEMA_VERSION` + `migrate` + teste de migração (`characterStore.persist.test.ts`).
7. **Design real:** usa a paleta hex da seção 4.1; não inventa tokens inexistentes.
8. **Commits frequentes e focados;** sem `git add -A` cego (há artefatos não rastreados: `ds-bundle/`, `.design-sync/`, `next-env.d.ts`).
9. **Zero dívida voluntária:** se escalar exige refatorar o store, refatore — não gambiarre.

---

## 9. Glossário

- **CharacterBuild** — modelo canônico serializado (draft + progression + choices + derivedSheet + exportMetadata).
- **CharacterSheetSummary** — verdade derivada calculada por `selectCharacterSheetSummary`; entrada de todos os exports.
- **Source Isolation** — escolhas agrupadas por origem (Classe/Antecedente/Espécie) em estados independentes.
- **Vault** — cofre de personagens em localStorage (`characterService.ts`).
- **Derived Sheet** — `derivedSheet` recalculado a cada gravação; cache da ficha pronta.
- **Schema Version** — `CHARACTER_BUILD_SCHEMA_VERSION`; governa migração de saves antigos.
- **Builder Step** — uma das 9 etapas do wizard (`builderStepNavigation.ts`).
- **Attribute Key** — `forca | destreza | constituicao | inteligencia | sabedoria | carisma`.
