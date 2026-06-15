# Components Atomic Design

Esta pasta e a camada visual compartilhada do projeto.

- `atoms`: elementos indivisiveis de interface, como botoes, badges e textos curtos.
- `molecules`: composicoes pequenas de atoms, como cards, tooltips, status e listas compactas.
- `organisms`: secoes funcionais completas, como sidebar, ficha em tempo real, formularios e grids.
- `templates`: layouts e estruturas de pagina sem depender de conteudo final especifico.
- `pages`: composicoes concretas usadas por rotas do App Router.

Regras:

- Nao criar nem manter pasta `components/` na raiz do projeto.
- Todo componente deve ficar em `src/components/`.
- UI nao deve conter regra de RPG ou busca de dados.
- Componentes interativos devem usar HTML semantico, foco visivel e ARIA apenas quando necessario.
- Imports de UI devem apontar para `@/src/components/<nivel>/<Componente>`.
