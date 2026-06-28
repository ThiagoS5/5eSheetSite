<h1 align="center">
  Forge & Fate
  <br>
</h1>

<p align="center">
  Criador web de fichas para Dungeons & Dragons 5e 2024, pensado para acompanhar o personagem
  do nível 1 ao 20 com cálculos derivados, persistência versionada, exportação para mesa virtual
  e uma experiência de uso imersiva em dark fantasy.
</p>

<p align="center">
  <a href="#o-problema">O problema</a> |
  <a href="#a-solução">A solução</a> |
  <a href="#arquitetura">Arquitetura</a> |
  <a href="#roadmap">Roadmap</a> |
  <a href="https://www.linkedin.com/in/thiago-marqueti-soares/">LinkedIn</a>
</p>

<hr>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-state-7c3aed?style=flat-square)
![D&D 5e 2024](https://img.shields.io/badge/D%26D_5e-2024-b91c1c?style=flat-square)

## Sumário

- [O problema](#o-problema)
- [A solução](#a-solução)
- [Princípios do projeto](#princípios-do-projeto)
- [Arquitetura](#arquitetura)
- [Modelo canônico](#modelo-canônico)
- [Experiência atual](#experiência-atual)
- [Roadmap](#roadmap)
- [Como rodar](#como-rodar)
- [Autor](#autor)

## O problema

Criar uma ficha de D&D 5e em uma aplicação web parece simples quando o escopo é apenas preencher
campos. Mas uma ficha real muda o tempo todo: o personagem sobe de nível, troca equipamentos, ganha
recursos, aprende magias, entra em multiclasse, recebe itens do Mestre e precisa sair da aplicação
para a mesa física ou virtual.

O Forge & Fate parte de uma premissa diferente: a ficha não é um formulário estático. Ela é um modelo
vivo, calculado e versionado, que precisa continuar correto quando o personagem evoluir do nível 1 ao
20.

## A solução

O objetivo do projeto é se tornar uma referência em criação de fichas web para D&D 5e 2024: uma
experiência rápida, acessível, visualmente forte e matematicamente confiável.

O produto combina:

- Um builder guiado por etapas para criação de personagens.
- Um Character Vault para armazenar e gerenciar múltiplos personagens.
- Um modelo canônico de persistência chamado `CharacterBuild`.
- Uma fonte única de verdade derivada via `selectCharacterSheetSummary`.
- Cálculos de ficha fora da camada visual, isolados em regras, adapters e services.
- Exportação estruturada para Foundry VTT.
- Base preparada para progressão 1-20, multiclasse, subclasses, magias e exportação em PDF.

## Princípios do projeto

### Ficha viva

O personagem não termina quando o wizard acaba. A arquitetura deve suportar level up contínuo,
alterações de inventário, escolhas por nível, talentos, magias, recursos e futuras ramificações de
multiclasse sem reescrever a base do sistema.

### Verdade derivada única

HP, CA, modificadores, proficiência, validações e resumos da ficha devem passar por
`selectCharacterSheetSummary` ou pelos adapters de domínio. A interface não deve recalcular regras de
D&D por conta própria.

### Isolamento por fonte

Classe, espécie, antecedente, equipamento e futuras origens de regra devem manter estados separados.
Uma escolha de uma fonte não pode corromper ou sobrescrever uma escolha de outra. Essa regra existe
para manter o sistema escalável até recursos mais complexos, como multiclasse e spellcasting.

### Persistência versionada

`CharacterBuild` é o contrato serializado do projeto. Toda mudança no formato persistido deve vir com
bump de schema, migração e teste. Saves antigos precisam continuar legíveis.

### Dark fantasy funcional

A interface deve parecer um painel tático avançado, não um template corporativo. A direção visual usa
obsidiana, carmesim, bordas sutis, alta densidade informacional, foco visível e acessibilidade como
parte da experiência, não como ajuste posterior.

## Arquitetura

```text
public/data/*.json
  -> src/services/
  -> src/adapters/
  -> src/store/
  -> selectCharacterSheetSummary()
  -> UI, Vault, Foundry export e futuros exports
```

### Camadas principais

- `public/data/`: dados brutos de D&D 5e.
- `src/services/`: leitura, normalização e persistência de personagens.
- `src/adapters/`: cálculos e transformações de domínio.
- `rules/`: regras puras sem React.
- `src/store/`: estado Zustand, serialização, migrações e seletores.
- `src/components/`: Atomic Design, shadcn/ui e composição da interface.
- `src/types/` e `types/`: contratos canônicos do domínio.

## Modelo canônico

`CharacterBuild` organiza a ficha persistida em blocos claros:

```ts
interface CharacterBuild {
  draft: {
    currentStep: string
    unlockedSteps: string[]
    equipmentChoicesBySource: Record<string, unknown>
  }
  progression: {
    level: number
    levelChoices: Record<string, unknown>
  }
  choices: Record<string, unknown>
  derivedSheet: CharacterSheetSummary
  exportMetadata: {
    schemaVersion: number
    saveId: string
    createdAt: string
    updatedAt: string
  }
}
```

Na prática:

- `draft`: estado do wizard, etapa atual, etapas desbloqueadas e escolhas em andamento.
- `progression`: nível atual e escolhas por nível, preparado para progressão 1-20.
- `choices`: classe, espécie, antecedente, atributos, proficiências, idiomas e demais decisões.
- `derivedSheet`: resumo calculado da ficha, regenerado a partir das escolhas.
- `exportMetadata`: schema, identificadores e datas de criação/atualização.

## Experiência atual

Hoje o projeto já possui uma base concreta para:

- Criar personagens por etapas.
- Armazenar múltiplos personagens no Vault.
- Calcular informações derivadas de ficha.
- Exportar dados para Foundry VTT.
- Usar tokens visuais e componentes reutilizáveis.
- Evoluir a arquitetura sem misturar regra de negócio com UI.

## Roadmap

O manifesto define a direção de longo prazo:

- Progressão completa do nível 1 ao 20.
- Level up vivo após a criação do personagem.
- Multiclasse com pré-requisitos, níveis por classe e proficiências compostas.
- Subclasses modeladas no estado canônico.
- Sistema de magias, slots, magias conhecidas e preparadas.
- Exportação em PDF baseada no mesmo `CharacterSheetSummary`.
- Evolução futura do Vault para sincronização ou persistência remota.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Zustand
- Zod
- Vitest
- ESLint

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Scripts úteis

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
```

## Definition of Done

Uma mudança só deve ser considerada pronta quando:

- Os testes relevantes passam com Vitest.
- TypeScript roda sem erros.
- ESLint roda sem erros nos arquivos tocados.
- A UI não recalcula regras que pertencem ao domínio.
- `CharacterBuild` permanece versionado quando seu formato muda.
- `selectCharacterSheetSummary` continua sendo a fonte única da ficha derivada.
- Acessibilidade, foco visível e navegação por teclado são preservados.
- A direção visual respeita os tokens do projeto, sem espalhar cores literais pelos componentes.

## Autor

Projeto desenvolvido por Thiago Marqueti Soares.

<a href="https://www.linkedin.com/in/thiago-marqueti-soares/" target="_blank" rel="noopener noreferrer">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" alt="LinkedIn de Thiago Marqueti Soares" width="28" height="28">
</a>
