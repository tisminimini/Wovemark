# Wovemark — Plano de Implementação

## 1. Objetivo

Construir o **Wovemark** como um formato Markdown declarativo para criação de websites e aplicações web completas por agentes de IA.

O objetivo final é que um agente consiga receber somente o link do repositório Wovemark e:

1. Ler o `README.md`.
2. Entender o que é Wovemark.
3. Instalar a skill oficial.
4. Aprender a sintaxe e os componentes disponíveis.
5. Criar um projeto.
6. Escrever todas as páginas em `.wovemark.md`.
7. Validar o projeto.
8. Entregar um website funcional sem precisar implementar frontend tradicional.

A complexidade visual, responsividade, acessibilidade, comportamento, componentes e motion deve ficar no **runtime Wovemark**, e não no agente.

---

# 2. Princípio central

O agente escolhe e preenche estruturas.

O Wovemark decide como essas estruturas são implementadas.

```text
AI Agent
   ↓
*.wovemark.md
   ↓
Wovemark Parser
   ↓
Validated AST
   ↓
Component Registry
   ↓
Design System + Motion + Behavior
   ↓
DOM
```

O agente não deve precisar gerar:

- React
- JSX
- Tailwind
- CSS
- animações
- breakpoints
- grids manuais
- estados de hover/focus
- HTML complexo
- implementação de modais
- implementação de tabelas
- implementação de sidebars
- lógica visual responsiva

---

# 3. Arquitetura do site final

O Wovemark deve funcionar primariamente como um runtime JavaScript importado por uma página HTML.

Projeto mínimo:

```text
my-site/
├── index.html
├── index.wovemark.md
├── about.wovemark.md
├── pricing.wovemark.md
└── assets/
```

`index.html`:

```html
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>

<body>
  <main id="app"></main>

  <script type="module">
    import { createWovemark } from "@wovemark/runtime";

    createWovemark({
      mount: "#app"
    });
  </script>
</body>
</html>
```

O runtime resolve automaticamente:

```text
index.html
→ index.wovemark.md

index.html#about
→ about.wovemark.md

index.html#pricing
→ pricing.wovemark.md

index.html#docs/install
→ docs/install.wovemark.md
```

Não deve existir necessidade de gerar um HTML diferente para cada página.

---

# 4. Router

Criar um hash router extremamente simples.

### Rotas

```text
#about
#dashboard
#users
#settings/profile
```

Resolução:

```text
#about
↓
about.wovemark.md
```

```text
#settings/profile
↓
settings/profile.wovemark.md
```

### Navegação

Um link normal em Wovemark:

```md
[About](#about)
```

deve:

1. alterar o hash;
2. carregar a nova página;
3. validar;
4. renderizar;
5. executar a transição;
6. atualizar `document.title`;
7. restaurar posição de scroll adequadamente.

O router deve observar:

```js
window.addEventListener("hashchange", ...)
```

A navegação pode posteriormente usar View Transitions quando disponível.

---

# 5. Wovemark Runtime

Criar:

```text
packages/runtime/
```

O pacote público será:

```text
@wovemark/runtime
```

Responsabilidades:

```text
Runtime
├── Router
├── Loader
├── Parser
├── Validator
├── AST
├── Renderer
├── Component Registry
├── Theme Engine
├── Motion Engine
├── State Store
├── Data Engine
├── Action Engine
└── Error UI
```

O consumidor continuará vendo apenas:

```js
createWovemark()
```

---

# 6. Wovemark não deve depender de framework no projeto consumidor

Internamente podem existir dependências.

Externamente:

```text
HTML
+
Wovemark Markdown
+
Wovemark Runtime
```

Nada mais.

O projeto criado por um agente não deve precisar instalar React, Next.js ou Tailwind.

O runtime deve distribuir seu próprio:

- CSS
- componentes
- tokens
- behaviors
- motion
- renderer

---

# 7. Formato Wovemark

Wovemark continua sendo Markdown.

A extensão será feita principalmente através de **directives**, evitando JSON e JSX.

Exemplo:

```md
---
title: Acme
theme: system
motion: 6
---

:::hero variant="split" image="/assets/hero.webp"

# Build something people remember.

The fastest way to create beautiful websites with AI.

[Get started](#signup)
[See examples](#examples)

:::
```

A sintaxe base deve possuir somente três conceitos extras:

```text
frontmatter
directives
bindings
```

---

# 8. Frontmatter

Configura propriedades da página.

```md
---
title: Dashboard
description: Manage your workspace
layout: app
theme: system
motion: 4
density: 7
variance: 4
---
```

Valores globais principais:

```text
title
description
layout
theme
motion
density
variance
accent
```

Esses valores alimentam o design engine.

---

# 9. Os três dials

Adotar no Wovemark:

```text
variance
motion
density
```

Exemplo:

```yaml
variance: 8
motion: 6
density: 4
```

Eles não devem simplesmente virar classes CSS.

Eles influenciam a escolha de implementação dos componentes.

Por exemplo:

```text
hero + variance 3
→ composição previsível e simétrica

hero + variance 8
→ composição assimétrica

dashboard + density 8
→ espaçamento compacto, controles menores

dashboard + density 3
→ interfaces mais respiradas

motion 2
→ quase estático

motion 6
→ reveal + transitions + hover physics

motion 9
→ scroll choreography quando apropriado
```

---

# 10. Directives

Dois tipos.

### Container

```md
:::hero variant="split"

# Hello

Content.

:::
```

### Elemento

```md
::button label="Create user" action="open:create-user"
```

Isso mantém o formato legível tanto por humanos quanto por modelos pequenos.

---

# 11. Component Registry

O parser nunca deve transformar uma directive diretamente em HTML arbitrário.

Exemplo:

```md
:::hero variant="split"
```

vira:

```text
AST
{
  type: hero
  variant: split
}
```

Então:

```text
ComponentRegistry["hero"]
```

decide a implementação.

Isso permite alterar o design do Wovemark futuramente sem alterar documentos existentes.

---

# 12. Component Library

A biblioteca deve ser significativamente maior que uma biblioteca de landing pages.

Dividir em famílias.

## Foundation

```text
container
section
stack
cluster
grid
split
divider
spacer
surface
```

## Content

```text
heading
text
quote
image
video
gallery
figure
code
callout
accordion
timeline
```

## Navigation

```text
navbar
sidebar
breadcrumbs
tabs
pagination
command-menu
footer
```

## Actions

```text
button
button-group
dropdown
menu
context-menu
```

## Feedback

```text
alert
toast
progress
skeleton
empty-state
loading
error-state
```

## Overlay

```text
dialog
drawer
popover
tooltip
sheet
confirm
```

---

# 13. Marketing Blocks

Criar uma biblioteca baseada nos princípios do Taste Skill.

```text
hero
logo-wall
feature-list
feature-grid
bento
feature-showcase
sticky-features
comparison
stats
testimonials
case-study
pricing
faq
cta
newsletter
contact
footer
```

Cada categoria deve ter diversas variantes.

Exemplo:

```md
:::hero variant="editorial"
```

```md
:::hero variant="split"
```

```md
:::hero variant="product"
```

```md
:::hero variant="minimal"
```

O agente escolhe intenção.

Não implementa layout.

---

# 14. Product UI

Criar uma segunda grande biblioteca dedicada a aplicações.

Ela não será uma cópia do Taste Skill.

Será o equivalente a um **Wovemark Product Design System**.

## Shell

```text
app-shell
sidebar
topbar
workspace-switcher
user-menu
mobile-navigation
```

## Dashboard

```text
page-header
metric
metric-grid
chart
activity-feed
recent-items
progress-overview
quick-actions
status-overview
```

## Data

```text
data-table
list
description-list
tree
kanban
calendar
```

## Table capabilities

`data-table` deve suportar nativamente:

```text
sorting
filtering
search
pagination
selection
bulk actions
row actions
loading
empty state
responsive layout
```

Sem o agente implementar nada disso.

---

# 15. Forms

Componentes:

```text
form
field
input
textarea
select
combobox
checkbox
radio
switch
date
file
slider
```

Exemplo:

```md
:::form id="create-user" submit="create-user"

::field name="name" label="Name" type="text" required

::field name="email" label="Email" type="email" required

::field name="role" label="Role" type="select" options="Admin,Editor,Viewer"

::button label="Create user" type="submit"

:::
```

O runtime cuida de:

- labels
- IDs
- validação
- erros
- focus
- keyboard navigation
- loading
- disabled states
- accessibility

---

# 16. Data Engine

Para permitir dashboards e CRUD inteiramente em Wovemark, criar uma camada declarativa de dados.

Exemplo:

```md
::data id="users" src="/api/users"
```

Depois:

```md
:::data-table source="users"
...
:::
```

Bindings:

```md
Total users: **{{ users.length }}**
```

O runtime mantém:

```text
loading
data
error
lastUpdated
```

para cada source.

---

# 17. Actions

Criar uma pequena linguagem de ações controladas.

Exemplos:

```text
open:create-user
close:create-user
refresh:users
delete:user
navigate:settings
submit:create-user
```

Uso:

```md
::button label="New user" action="open:create-user"
```

Evitar JavaScript arbitrário dentro dos documentos.

O objetivo é manter o Wovemark:

- seguro;
- determinístico;
- validável;
- fácil para modelos pequenos.

---

# 18. CRUD

O runtime deve permitir um CRUD completo sem JS customizado.

Exemplo conceitual:

```md
::data id="users" src="/api/users"

:::data-table source="users"

::column field="name" label="Name"
::column field="email" label="Email"
::column field="status" label="Status"

::row-action label="Edit" action="open:edit-user"
::row-action label="Delete" action="delete:user"

:::
```

Criação:

```md
:::dialog id="create-user" title="Create user"

:::form submit="POST /api/users" success="refresh:users; close:create-user"

::field name="name" label="Name"
::field name="email" label="Email" type="email"

::button label="Create" type="submit"

:::

:::
```

A versão inicial deve focar em REST/JSON.

Não tentar transformar Wovemark em uma linguagem de programação geral.

---

# 19. Motion Engine

Motion deve ser uma capacidade nativa.

O agente descreve **intenção**, não keyframes.

Exemplos:

```md
:::hero motion="reveal"
```

```md
:::gallery motion="stagger"
```

```md
:::features motion="sticky-stack"
```

Presets iniciais:

```text
none
fade
reveal
slide
scale
stagger
parallax
sticky-stack
horizontal-pan
shared
```

---

# 20. Motion implementation

Usar Motion JS como engine padrão para:

```text
entry animations
in-view
hover
press
layout transitions
route transitions
stagger
parallax simples
```

Carregar código avançado somente quando necessário.

Para efeitos cinematográficos realmente baseados em pin/scrub, criar um módulo opcional/lazy.

```text
runtime
└── motion-basic

runtime-motion-advanced
└── GSAP
```

Assim um dashboard comum não baixa GSAP.

---

# 21. Motion e Product UI

Motion de aplicação deve seguir regras diferentes de marketing.

Exemplo:

```text
Landing:
motion 6-9 permitido

Dashboard:
motion normalmente 2-5

CRUD:
motion normalmente 2-4
```

Um dashboard não deve transformar cada interação em uma animação decorativa.

Motion deve comunicar:

- mudança de estado;
- hierarquia;
- relação espacial;
- causa e efeito.

---

# 22. prefers-reduced-motion

Obrigatório.

Todo componente animado deve possuir versão reduzida.

O autor Wovemark não precisa implementar isso.

---

# 23. Design System

Criar tokens próprios.

```text
color
surface
text
border
radius
shadow
space
font
size
motion
z-index
breakpoints
```

Distribuídos como CSS variables:

```css
--wm-color-accent
--wm-bg
--wm-surface
--wm-text
--wm-muted
--wm-radius-md
--wm-space-4
```

---

# 24. Themes

Suportar:

```yaml
theme: light
```

```yaml
theme: dark
```

```yaml
theme: system
```

E posteriormente:

```yaml
theme: ./theme.wovemark.md
```

---

# 25. Dark mode

Todos os componentes core devem funcionar em dark e light.

Não criar componentes que possuem apenas uma versão visual.

---

# 26. Icons

Incluir uma biblioteca pequena e consistente de ícones no runtime.

Uso:

```md
::button icon="plus" label="Create"
```

ou:

```md
::icon name="settings"
```

Não permitir emojis como substitutos automáticos de ícones de interface.

---

# 27. Responsive Design

O agente não define breakpoints na maioria dos casos.

Exemplo:

```md
:::feature-grid columns="3"
```

não significa:

```text
sempre 3 colunas
```

O componente decide:

```text
mobile → 1
tablet → 2
desktop → 3
```

Cada componente deve possuir comportamento mobile formalmente documentado.

---

# 28. Accessibility

A biblioteca deve assumir responsabilidade por:

```text
semantic HTML
focus states
keyboard navigation
ARIA
dialog focus trap
labels
form errors
contrast
reduced motion
screen readers
```

Não deixar isso depender da capacidade do agente.

---

# 29. Segurança

Raw HTML deve estar desabilitado por padrão.

Nunca executar:

```html
<script>
```

presente em Markdown.

Sanitizar:

- links;
- URLs;
- SVG;
- conteúdo Markdown;
- interpolação.

Bindings não podem usar `eval()`.

Actions devem ser uma whitelist de comandos conhecidos.

---

# 30. Parser

Pipeline:

```text
Markdown source
↓
frontmatter
↓
Markdown parser
↓
Wovemark directives
↓
AST
↓
schema validation
↓
normalized AST
↓
renderer
```

Erros devem apontar para:

```text
arquivo
linha
componente
propriedade
valor
```

Exemplo:

```text
users.wovemark.md:18

Unknown component: datatable

Did you mean:
data-table
```

Isso é especialmente importante para agentes.

---

# 31. Validation

Criar regras fortes.

Exemplo:

```text
Unknown component
Unknown property
Invalid enum
Missing required prop
Invalid nesting
Duplicate ID
Broken route
Broken asset
Unknown action
Unknown data source
```

Wovemark deve falhar de forma útil, não silenciosa.

---

# 32. Runtime error overlay

Durante desenvolvimento:

```text
┌──────────────────────────────────────┐
│ Wovemark Error                       │
│                                      │
│ users.wovemark.md:28                 │
│ Unknown property "varaint"           │
│                                      │
│ Did you mean "variant"?              │
└──────────────────────────────────────┘
```

Em produção, mostrar um fallback apropriado.

---

# 33. CLI

O runtime não requer build.

Mas criar:

```text
@wovemark/cli
```

Com:

```bash
npx wovemark init
npx wovemark dev
npx wovemark validate
npx wovemark inspect
npx wovemark build
```

### `wovemark dev`

Servidor local + hot reload.

### `wovemark validate`

Valida todas as páginas.

### `wovemark inspect`

Mostra AST/componentes/rotas para debugging.

### `wovemark build`

Opcional.

Pode gerar uma versão otimizada do site para produção futuramente.

O modo runtime direto continua sendo o default.

---

# 34. Repository

Estrutura sugerida:

```text
wovemark/
├── README.md
├── LICENSE
├── package.json
├── pnpm-workspace.yaml
│
├── packages/
│   ├── runtime/
│   ├── parser/
│   ├── components/
│   ├── motion/
│   ├── data/
│   └── cli/
│
├── skills/
│   └── wovemark/
│       ├── SKILL.md
│       ├── references/
│       │   ├── syntax.md
│       │   ├── components.md
│       │   ├── layouts.md
│       │   ├── product-ui.md
│       │   ├── motion.md
│       │   ├── data.md
│       │   └── examples.md
│       └── scripts/
│
├── docs/
│
├── examples/
│   ├── landing/
│   ├── portfolio/
│   ├── docs/
│   ├── dashboard/
│   └── crud/
│
└── tests/
```

---

# 35. Wovemark Skill

Essa é uma parte central do produto.

Local:

```text
skills/wovemark/SKILL.md
```

Frontmatter:

```yaml
---
name: wovemark
description: Create complete websites and web applications using Wovemark.
---
```

Instalação:

```bash
npx skills add https://github.com/<org>/wovemark --skill wovemark
```

---

# 36. Responsabilidade da Skill

A skill deve ensinar o agente a:

1. entender o briefing;
2. definir o tipo de interface;
3. definir variance/motion/density;
4. selecionar componentes existentes;
5. estruturar rotas;
6. escrever Wovemark;
7. não inventar directives;
8. verificar documentação quando necessário;
9. executar `wovemark validate`;
10. corrigir erros;
11. testar o resultado;
12. entregar somente após o projeto estar funcional.

---

# 37. Regra mais importante da Skill

```text
Never implement what Wovemark already knows how to render.
```

Se existe:

```text
data-table
```

o agente não cria uma tabela manual.

Se existe:

```text
hero
```

o agente não monta o hero com grids genéricos.

Se existe:

```text
dialog
```

o agente não simula um modal.

---

# 38. Component discovery

A skill não deve carregar a documentação inteira em contexto sempre.

O `SKILL.md` funciona como router.

Exemplo:

```text
Marketing page
→ references/marketing.md

Dashboard
→ references/product-ui.md

CRUD
→ references/data.md

Motion-heavy site
→ references/motion.md
```

Isso mantém a skill eficiente para modelos pequenos.

---

# 39. README como entrada para agentes

O `README.md` precisa ser escrito assumindo que um agente pode ser o leitor.

A primeira parte deve responder imediatamente:

```text
What is Wovemark?
How does it work?
How do I create a site?
How do I install the skill?
```

Adicionar uma seção proeminente:

```md
## Using Wovemark with an AI coding agent

Install the official Wovemark skill:

npx skills add ...

Then tell your agent:

"Create this website entirely in Wovemark."
```

---

# 40. README Quick Start

Deve ser possível compreender o conceito em menos de alguns minutos.

Mostrar:

```text
index.html
index.wovemark.md
about.wovemark.md
```

E imediatamente:

```text
index.html#about
```

---

# 41. Documentação

Criar documentação separada para:

```text
Getting Started
Syntax
Routing
Components
Layouts
Marketing
Product UI
Forms
Data
CRUD
Actions
Motion
Themes
Accessibility
Deployment
Agent Skill
Plugin API
```

---

# 42. Component documentation

Cada componente deve possuir contrato.

Exemplo:

```md
# data-table

Category: product/data

Purpose:
Display structured datasets with optional interactions.

Properties:
- source
- searchable
- sortable
- selectable
- pagination

Supports:
- loading
- error
- empty state
- mobile fallback

Motion:
2-4

Example:
...

Avoid:
...
```

---

# 43. Block Library discipline

Cada componente/bloco deve possuir:

```text
name
category
purpose
props
variants
supported dials
responsive behavior
motion behavior
dark mode behavior
accessibility behavior
anti-patterns
examples
```

Nenhum componente entra na biblioteca apenas porque "parece legal".

---

# 44. Dogfooding

A documentação oficial do Wovemark deve ser construída em Wovemark.

Isso garante que o próprio produto encontre as limitações do formato.

---

# 45. Exemplos oficiais

Criar pelo menos cinco aplicações completas.

## Example 1

```text
SaaS Landing Page
```

Valida:

- marketing;
- hero;
- pricing;
- responsive;
- motion.

## Example 2

```text
Creative Portfolio
```

Valida:

- alta variance;
- gallery;
- motion;
- typography.

## Example 3

```text
Documentation Site
```

Valida:

- sidebar;
- navigation;
- content;
- code;
- search.

## Example 4

```text
SaaS Dashboard
```

Valida:

- app-shell;
- metrics;
- charts;
- tables;
- navigation;
- density.

## Example 5

```text
User Management CRUD
```

Valida:

- REST;
- forms;
- modal;
- data table;
- create;
- update;
- delete;
- errors;
- loading.

---

# 46. Visual testing

Criar snapshots com Playwright para:

```text
375px
768px
1280px
1440px
1920px
```

Testar:

```text
light
dark
reduced motion
```

Mudanças no design system não podem quebrar páginas silenciosamente.

---

# 47. Accessibility testing

Adicionar Axe aos testes E2E.

Componentes core não entram na biblioteca enquanto possuírem violações sérias de acessibilidade.

---

# 48. Performance

Runtime deve fazer code splitting.

Core inicial:

```text
router
parser
renderer
basic components
basic motion
```

Lazy:

```text
charts
advanced tables
GSAP
code editor
heavy galleries
```

Uma landing simples não deve baixar código de dashboard.

Um dashboard não deve baixar motion cinematográfico.

---

# 49. Plugins

Não implementar primeiro.

Mas preparar arquitetura:

```js
Wovemark.use(plugin)
```

Permitindo futuramente:

```text
custom directives
components
data adapters
themes
actions
```

O core continua controlado.

---

# 50. Fases de implementação

## Fase 1 — Specification

Criar antes de escrever dezenas de componentes:

```text
SPEC.md
SYNTAX.md
AST.md
COMPONENT-CONTRACT.md
```

Definir definitivamente:

- directive grammar;
- frontmatter;
- bindings;
- component IDs;
- nesting;
- actions;
- errors.

### Done

Um parser pode ser implementado sem tomar novas decisões de linguagem.

---

# 51. Fase 2 — Runtime Kernel

Implementar:

```text
createWovemark()
loader
hash router
page cache
hashchange
404
metadata
DOM mount
```

Criar:

```text
index.wovemark.md
about.wovemark.md
```

### Done

`index.html#about` troca corretamente para `about.wovemark.md`.

---

# 52. Fase 3 — Parser + AST + Validator

Implementar:

```text
Markdown
frontmatter
directives
nested directives
bindings
AST
schemas
source locations
error messages
```

### Done

Arquivos inválidos produzem mensagens claras e arquivos válidos geram AST determinístico.

---

# 53. Fase 4 — Design Foundation

Implementar:

```text
tokens
typography
spacing
colors
themes
responsive rules
dark mode
focus
icons
```

Componentes:

```text
container
section
stack
grid
button
image
surface
```

### Done

É possível criar uma página simples visualmente completa sem CSS do usuário.

---

# 54. Fase 5 — Marketing Library

Aplicar os princípios Taste ao desenvolvimento da biblioteca.

Implementar primeiro:

```text
navbar
hero
logo-wall
features
bento
stats
testimonials
pricing
faq
cta
footer
```

Criar múltiplas variantes quando elas representarem diferenças reais de composição.

### Done

O exemplo SaaS Landing pode ser escrito inteiramente em Wovemark.

---

# 55. Fase 6 — Motion

Implementar:

```text
route transitions
reveal
stagger
hover
press
scale
parallax
sticky-stack
horizontal-pan
reduced motion
```

Integrar com:

```text
motion
variance
density
```

### Done

Nenhum componente precisa de JavaScript escrito no documento para possuir animação.

---

# 56. Fase 7 — Product UI

Implementar:

```text
app-shell
sidebar
topbar
page-header
metric
metric-grid
tabs
filters
data-table
pagination
dropdown
dialog
drawer
toast
empty-state
skeleton
```

### Done

O exemplo Dashboard inteiro funciona em Wovemark.

---

# 57. Fase 8 — Forms + Data + CRUD

Implementar:

```text
data sources
bindings
actions
form
fields
GET
POST
PUT/PATCH
DELETE
refresh
loading
error
success
optimistic UI somente quando seguro
```

### Done

O exemplo User Management executa CRUD real usando apenas `.wovemark.md`.

---

# 58. Fase 9 — CLI

Implementar:

```text
wovemark init
wovemark dev
wovemark validate
wovemark inspect
```

Priorizar excelente feedback para agentes.

### Done

Um agente consegue detectar e corrigir sozinho a maioria dos erros de autoria.

---

# 59. Fase 10 — Agent Product

Criar:

```text
README.md
skills/wovemark/SKILL.md
references/*
examples/*
```

Executar testes com agentes diferentes.

Experimento:

```text
1. Entregar somente URL do GitHub.
2. Dar uma descrição de produto.
3. Não explicar Wovemark.
4. Observar se o agente descobre tudo sozinho.
```

Testar pelo menos:

```text
Codex
Claude Code
Gemini CLI
OpenCode
```

### Done

O agente:

```text
clone
→ read README
→ install skill
→ understand syntax
→ create site
→ validate
→ fix
→ deliver
```

sem orientação adicional sobre Wovemark.

---

# 60. Fase 11 — Dogfood + Hardening

Construir o próprio site/documentação do Wovemark em Wovemark.

Rodar:

```text
unit tests
parser fuzzing
E2E
visual regression
axe
Lighthouse
security tests
mobile tests
reduced-motion tests
```

---

# 61. O que não fazer no V1

Não transformar Wovemark em:

- React alternativo;
- JavaScript alternativo;
- low-code genérico;
- linguagem Turing-complete;
- construtor visual;
- backend framework.

Não implementar inicialmente:

```text
arbitrary user JavaScript
arbitrary HTML
complex expressions
loops programáveis
custom CSS por componente
server-side rendering
database abstraction
auth framework
realtime collaboration
```

Esses itens aumentam drasticamente o espaço de possibilidades e reduzem justamente a confiabilidade para modelos pequenos.

---

# 62. Filosofia de API

Quando houver escolha entre:

```text
mais liberdade para o agente
```

e:

```text
mais inteligência no runtime
```

preferir:

```text
mais inteligência no runtime
```

Exemplo ruim:

```md
:::grid columns="12" gap="23" mobile-columns="1" tablet-columns="6"
```

Exemplo correto:

```md
:::feature-grid
```

O runtime conhece a intenção do componente e resolve o layout.

---

# 63. Critério para novos componentes

Adicionar um componente quando:

1. representa um padrão recorrente;
2. possui comportamento visual consistente;
3. reduz decisões necessárias do agente;
4. pode ser parametrizado sem virar uma linguagem;
5. funciona responsivamente;
6. pode ter acessibilidade resolvida centralmente.

---

# 64. Teste definitivo do Wovemark

O projeto será considerado bem-sucedido quando for possível fornecer para um modelo relativamente pequeno somente:

```text
https://github.com/<org>/wovemark

Create a complete inventory management SaaS with a landing page,
dashboard and product CRUD. Use Wovemark.
```

e obter:

```text
index.html
index.wovemark.md
features.wovemark.md
pricing.wovemark.md
dashboard.wovemark.md
products.wovemark.md
settings.wovemark.md
assets/*
```

sem:

```text
React
JSX
CSS customizado
frontend JS customizado
```

e ainda obter uma aplicação:

```text
bonita
coerente
responsiva
acessível
animada
funcional
validável
deployável como site estático
```

---

# 65. North Star

**Wovemark não é Markdown que consegue renderizar componentes.**

Wovemark é uma camada de abstração de frontend feita para agentes.

Markdown é apenas a interface de autoria.

O verdadeiro produto é:

```text
Wovemark
=
Language
+ Runtime
+ Design System
+ Component Library
+ Motion Engine
+ Product UI
+ Data/Action Runtime
+ Validator
+ Agent Skill
+ Documentation
```

Quanto menos frontend o modelo precisar inventar, melhor o Wovemark está cumprindo seu propósito.
