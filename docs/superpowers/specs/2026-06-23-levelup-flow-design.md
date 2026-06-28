# Design — LevelUpFlow (Fase 2 do Level-Up)

> Status: aprovado no brainstorming · Data: 2026-06-23
> Escopo: o componente **`LevelUpFlow`** (UI passo-a-passo) **+ ambos os gatilhos** (botão "Subir de Nível" na ficha e seletor de nível inicial no wizard). Consome o engine puro da Fase 1; não adiciona regra de D&D na UI.

## 1. Contexto e objetivo

A Fase 1 entregou o engine de escolhas por nível (pure): `getLevelRequirements`, `featCatalog` (`getFeats`/`getSelectableFeats`/`meetsPrerequisite`), e o `levelChoiceResolver` (`collectAsiBonuses`, `getActiveSubclassFeatures`, `getUnresolvedLevelChoices`), com persistência v4 (`selectedSubclassId`, `progression.levelChoices[n].asiOrFeat`) e ações de store (`selectSubclass`, `setLevelAsiOrFeat`, `setClassFeatureChoice`, `setLevel`). Nada disso tem UI.

A Fase 2 entrega a **interface** que resolve essas escolhas: um modal passo-a-passo (`LevelUpFlow`) disparado de duas superfícies — a **ficha** ("Subir de Nível", o Level-Up Vivo do manifesto) e o **wizard** (nível inicial). A UI apenas lê o engine/store e dispara ações existentes; a verdade derivada continua única em `selectCharacterSheetSummary`.

### Decisão de apresentação (do brainstorming)
- **Modal centralizado** (Radix `Dialog`, mesmo padrão do `ClassDetailsDialog`), com stepper. Não inline, não slide-over.
- **Stepper contínuo**: um salto de múltiplos níveis (ex.: começar no nível 5) lista todas as pendências como passos sequenciais.

### Fora de escopo (explícito)
- Método de PV (continua fixo — regra da Fase 1).
- Epic Boon (nível 19 — não é classificado como ASI pelo engine).
- Multiclasse.
- "Cancelar atômico" (as escolhas gravam no store na hora; fechar no meio mantém o parcial como pendência).

## 2. Arquitetura e estrutura de arquivos

```
src/store/levelChoiceResolver.ts        (+) getPendingRequirements(state, class): LevelChoiceRequirement[]
   ↳ refatorar getUnresolvedLevelChoices p/ derivar disto (DRY) — mesmo predicado de "resolvido?",
     devolvendo o requisito COMPLETO (options/count/featureName) que a UI precisa. Sem mudança de comportamento.

src/components/organisms/levelup/
   LevelUpFlow.tsx        Orquestrador: Dialog + stepper. Snapshot dos passos na abertura,
                          renderiza o passo atual, Voltar/Continuar, conclui quando zera.
   SubclassStep.tsx       Escolha de subclasse (cards).
   AsiOrFeatStep.tsx      ASI (+2/+1) ⇄ Talento (mutuamente exclusivos).
   FeatureOptionStep.tsx  "Escolha N de" (multi-select).
   useLevelUpSteps.ts     Hook: deriva a lista ordenada de passos pendentes (snapshot) do store + classe.

src/components/molecules/LevelUpButton.tsx           Gatilho da ficha (montado em SheetHeader).
src/components/molecules/StartingLevelStepper.tsx    Gatilho do wizard (montado na etapa Classe do BuilderStepPanel).
```

**Fronteiras:** `LevelUpFlow` e os steps são apresentação pura — leem engine/store e disparam ações já existentes. Cada step tem responsabilidade única e é testável isolado (recebe requisito + estado + callbacks). Único ajuste no código da Fase 1: extrair `getPendingRequirements` (o selector segue recebendo os mesmos labels via `getUnresolvedLevelChoices`).

## 3. Controle de fluxo e estado

- **Snapshot na abertura:** `steps = getPendingRequirements(state, class)` (ordenado por nível, depois tipo), mantido estável durante a sessão do modal (escolher subclasse/ASI/feat não cria novas pendências no mesmo intervalo).
- **Estado local mínimo:** só `activeIndex`. "Resolvido?" de cada passo é calculado ao vivo pelo resolver, então o ✓ aparece assim que a ação grava no store.
- **"Continuar" desabilitado** até o passo atual estar resolvido (subclasse escolhida; ASI somando 2 com a forma válida; talento válido; feature-option com a contagem exata). Garante personagem completo ao fim.
- **"Voltar"** decrementa `activeIndex`; re-selecionar sobrescreve via a mesma ação.
- **Conclusão:** ao resolver o último passo, o rodapé vira "Concluir" → fecha. Sem tela de resumo (YAGNI; a ficha já reflete tudo).
- **Fechar no meio:** escolhas gravadas persistem; o que faltar segue como pendência na validação. O nível já subiu na abertura e permanece.
- **Nível (unifica os gatilhos):** ambos fazem `setLevel(N)` → abrir o fluxo → resolver pendências ≤ N.

## 4. Sub-componentes de passo

Cada step recebe o `LevelChoiceRequirement` + estado + callbacks; renderiza a escolha e grava via ação. "Resolvido?" vem do resolver.

- **`SubclassStep`** (`kind: subclass`) — cards (padrão `ChoiceCard`) de `getSubclassesForClass(class.id)`; cada card: nome + 1ª feature como blurb. Seleção → `selectSubclass(id)`. Cabeçalho: "Nível {level} · Subclasse".
- **`FeatureOptionStep`** (`kind: feature-option`) — "Escolha {count}" multi-select das `options` do requisito, refletindo `classFeatureChoices[req.id]`. Mudança → `setClassFeatureChoice(req.id, values)`. Resolvido quando `length === count`.
- **`AsiOrFeatStep`** (`kind: asi-or-feat`):
  - **Abas mutuamente exclusivas:** "Aumento de Atributo" e "Talento". Selecionar uma mostra o seu sub-form e fecha/desabilita a outra.
  - **ASI:** sub-modos "+2 em um" (seleção única de 1 atributo) e "+1 em dois" (multi-select de **exatamente 2**, travando o 3º). Mostra "atual → novo". Os 6 atributos: **Força · Destreza · Constituição · Inteligência · Sabedoria · Carisma**. Grava `setLevelAsiOrFeat(level, {mode:"asi", increases})`.
  - **Talento:** lista `getSelectableFeats("general", getFeats(), ctx)` — só elegíveis (inelegíveis ocultos/desabilitados); half-feat pede o +1 (`choose.from`). Grava `setLevelAsiOrFeat(level, {mode:"feat", featId, asi?})`.
  - **`ctx` de pré-requisito:** `finalAttributes` de `selectCharacterSheetSummary(state)` (já com ASI de níveis anteriores) + `chosenFeatIds` (dos `asiOrFeatByLevel` em modo feat) + `level`.
  - Cabeçalho: "Nível {level} · Aumento de Atributo ou Talento".

## 5. Pontos de entrada

Mesmo contrato: setar nível → abrir `LevelUpFlow` → resolver.

- **Ficha — `LevelUpButton`** (em `SheetHeader`, ao lado de "Nível {N}"): rótulo "Subir de Nível"; ao clicar `setLevel(level+1)` e abre o modal; desabilitado no nível 20.
- **Wizard — `StartingLevelStepper`** (etapa Classe do `BuilderStepPanel`): stepper 1–20 → `setLevel(N)`. Com N>1, botão "Configurar escolhas de nível (X)" abre o `LevelUpFlow`; pendências também aparecem na validação existente da etapa (que bloqueia "Avançar" até zerar).

## 6. Estratégia de testes (DoD)

Vitest + Testing Library (jsdom), store + engine reais (sem mocks de regra).

- **`SubclassStep`** — renderiza cards de `getSubclassesForClass`; clicar chama `selectSubclass(id)` e marca selecionado.
- **`AsiOrFeatStep`** — abas exclusivas; "+2 em um" seleção única; "+1 em dois" exige exatamente 2 (trava o 3º) e grava os deltas certos; modo Talento lista só elegíveis e half-feat resolve o +1; "Continuar" travado até completar.
- **`FeatureOptionStep`** — exige `count` exato antes de habilitar.
- **`LevelUpFlow`** — fighter nível 4: passos na ordem (subclasse@3, ASI@4); "Continuar" travado até resolver; concluir fecha. Salto multi-nível: todas as pendências viram passos. Fechar no meio: parcial persiste.
- **`LevelUpButton`** — `setLevel(+1)` e abre; desabilitado no 20. **`StartingLevelStepper`** — `setLevel(N)`; botão abre o fluxo.
- **Resolver (refactor)** — `getPendingRequirements` devolve requisitos completos não-resolvidos; `getUnresolvedLevelChoices` deriva dele; testes existentes seguem verdes.

**Gates:** `vitest run` verde · `tsc --noEmit` limpo · `eslint` nos arquivos tocados · verdade derivada única preservada (UI só lê engine/store e dispara ações) · zero regra de D&D na UI · paleta de tokens (sem hex literais).

## 7. Resumo das mudanças de arquivo

| Arquivo | Mudança |
|---|---|
| `src/store/levelChoiceResolver.ts` | (+) `getPendingRequirements`; refatorar `getUnresolvedLevelChoices` p/ derivar dele |
| `src/components/organisms/levelup/LevelUpFlow.tsx` | **novo** — orquestrador Dialog + stepper |
| `src/components/organisms/levelup/SubclassStep.tsx` | **novo** |
| `src/components/organisms/levelup/AsiOrFeatStep.tsx` | **novo** |
| `src/components/organisms/levelup/FeatureOptionStep.tsx` | **novo** |
| `src/components/organisms/levelup/useLevelUpSteps.ts` | **novo** — hook de passos pendentes |
| `src/components/molecules/LevelUpButton.tsx` | **novo** — gatilho da ficha |
| `src/components/molecules/StartingLevelStepper.tsx` | **novo** — stepper de nível inicial (wizard) |
| `src/components/organisms/sheet/SheetHeader.tsx` | montar `LevelUpButton` |
| `src/components/pages/BuilderStepPanel.tsx` | montar `StartingLevelStepper` na etapa Classe |
