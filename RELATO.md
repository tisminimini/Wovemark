# Relatório de Diagnóstico, Erros de Execução e Melhorias no Wovemark

> **Objetivo deste documento:** Este relatório foi elaborado para que futuros agentes de IA e desenvolvedores compreendam em detalhes as falhas de execução cometidas durante a criação do website demonstrativo em `/site`, bem como os bugs e limitações arquiteturais identificados e corrigidos no núcleo do próprio **Wovemark** (`@wovemark/parser`, `@wovemark/runtime` e `@wovemark/cli`).

---

## 1. Sumário Executivo

Durante a solicitação de construção de um website explorando o potencial máximo do Wovemark (`/site`), a página inicial foi entregue originalmente em branco e múltiplos componentes apresentaram falhas funcionais e de renderização.

Uma auditoria completa revelou que o problema foi uma combinação de:
1. **Erros de Execução do Agente:** Suposições incorretas sobre resolução de módulos nativos no navegador, escopo de pastas do servidor estático e confiança excessiva apenas no validador sintático de AST em vez de validação em tempo de execução no DOM.
2. **Bugs e Lacunas no Wovemark:** Falhas no parser de atributos, ausência de renderização de botões de abas, layout incorreto no `app-shell`, falta de listeners interativos no `ActionEngine`, ausência de estilos essenciais no CSS e falta de empacotamento standalone do runtime.

---

## 2. Erros de Execução do Agente (Falhas Nossas)

### 2.1. Suposição Incorreta de Resolução de Módulos ES (Bare Specifiers)
* **O que o agente fez:** Criou o `site/index.html` importando `createWovemark` de `../packages/runtime/dist/index.js`.
* **Por que falhou:** O arquivo `packages/runtime/dist/index.js` gerado pelo `tsc` continha `import { parseWovemark } from "@wovemark/parser"`. Navegadores modernos **bloqueiam** bare specifiers como `"@wovemark/parser"` sem um `importmap`. Isso causou um erro fatal no console do navegador (`Uncaught TypeError: Failed to resolve module specifier "@wovemark/parser"`), impedindo a inicialização do Wovemark e deixando a página em branco.
* **Lição para o agente:** Ao criar um ambiente de demonstração para o usuário final, nunca assumir que o navegador resolverá módulos do monorepo sem um bundle standalone ou sem um importmap explícito.

### 2.2. Incompatibilidade de Caminho ao Iniciar o Servidor na Subpasta `/site`
* **O que o agente fez:** Inicializou o dev server na raiz (`.`) e depois foi instruído a rodar dentro de `site/` (`--dir site`). No entanto, o `index.html` continha caminhos relativos para `../packages/runtime/...`.
* **Por que falhou:** Quando o servidor estático tem sua raiz em `site/`, qualquer requisição para `../packages/...` cai fora da raiz servida e retorna `404 Not Found`.
* **Lição para o agente:** Ao criar pastas independentes como `/site`, todo o bundle do runtime (`wovemark.js`), estilos (`styles.css`) e dados (`data/`) devem estar localizados internamente na pasta ou referenciados via URLs absolutas configuradas.

### 2.3. Uso de Vírgulas em Atributos de Texto sem Prever o Comportamento do Parser
* **O que o agente fez:** Escreveu descrições longas e matrizes comparativas com vírgulas normais de pontuação dentro das aspas (ex: `tier1="Low (~2,500 tokens/page)"` ou `description="Plataforma moderna, rápida e acessível."`).
* **Por que gerou problema:** O parser do Wovemark dividia qualquer string contendo vírgula em um array de strings, quebrando o texto na renderização do HTML.
* **Lição para o agente:** Entender como o parser processa tokens antes de escrever as diretivas e corrigir o parser na raiz.

### 2.4. Confiança Cega no `wovemark validate` sem Verificação em Tempo de Execução
* **O que o agente fez:** Confiou que a saída `✔ All Wovemark files passed validation with zero errors` garantia que o website estava funcionando.
* **Por que falhou:** O validador do CLI apenas checa se os nós da AST batem com os schemas definidos em `schema.ts`. Ele não valida se o JavaScript no browser carrega, se os estilos CSS existem ou se os botões e abas possuem listeners ativos.
* **Lição para o agente:** Sempre inspecionar a árvore DOM final, os eventos e as chamadas de rede no navegador.

---

## 3. Bugs e Limitações Descobertos no Próprio Wovemark (Engine / Runtime / Parser)

Abaixo estão todos os bugs identificados no código-fonte do Wovemark e as soluções implementadas:

### 🐛 Bug 1: Parser dividindo qualquer string com vírgula em Array
* **Arquivo:** [`packages/parser/src/attributes.ts`](file:///workspaces/Wovemark/packages/parser/src/attributes.ts)
* **Causa Raiz:** A função `parseAttributeValue` continha a seguinte lógica indiscriminada:
  ```typescript
  // CÓDIGO ANTERIOR COM BUG:
  if (val.includes(",") && !val.includes("\n")) {
    const items = val.split(",").map((s) => s.trim());
    if (items.length > 1) return items;
  }
  ```
  Isso fazia com que **qualquer frase com vírgula** em `description`, `title`, `label`, `helpText`, `placeholder` ou `comparison-row` fosse transformada em array, renderizando `["Frase 1", "Frase 2"]` ou `Frase 1,Frase 2`.
* **Correção:** A divisão por vírgula foi restrita exclusivamente aos atributos que declaram listas (`options`, `tags`, `categories`, `items`, `keys`):
  ```typescript
  const LIST_ATTRIBUTE_KEYS = new Set(["options", "tags", "categories", "items", "keys"]);
  if (key && LIST_ATTRIBUTE_KEYS.has(key.toLowerCase()) && val.includes(",") && !val.includes("\n")) {
    const items = val.split(",").map((s) => s.trim());
    if (items.length > 1) return items;
  }
  ```

---

### 🐛 Bug 2: Componente `tabs` não renderizava botões de cabeçalho e ativava todas as abas
* **Arquivo:** [`packages/runtime/src/renderer/registry.ts`](file:///workspaces/Wovemark/packages/runtime/src/renderer/registry.ts)
* **Causa Raiz:**
  ```typescript
  // CÓDIGO ANTERIOR COM BUG:
  this.register("tabs", (node, children) => `<div class="wm-tabs">${children}</div>`);
  this.register("tab-item", (node, children) => `<div class="wm-tab-panel wm-active" ...>${children}</div>`);
  ```
  1. O container `tabs` não gerava o elemento `.wm-tabs-header` com os botões `<button class="wm-tab-btn">`.
  2. Todo `tab-item` recebia a classe `wm-active` estaticamente, fazendo com que todas as abas aparecessem ao mesmo tempo uma embaixo da outra.
* **Correção:**
  1. O renderer de `tabs` agora inspeciona os nós filhos (`tab-item`), extrai seus `label` e `id`, e gera a barra de navegação de abas (`.wm-tabs-header`).
  2. Apenas o primeiro painel de aba recebe `wm-active` por padrão.
  3. Foi adicionado um listener de clique no `ActionEngine` para alternar entre as abas ativas.

---

### 🐛 Bug 3: Layout Quebrado no `app-shell`
* **Arquivo:** [`packages/runtime/src/renderer/registry.ts`](file:///workspaces/Wovemark/packages/runtime/src/renderer/registry.ts) e [`packages/runtime/src/theme/styles.css`](file:///workspaces/Wovemark/packages/runtime/src/theme/styles.css)
* **Causa Raiz:** O CSS definia `.wm-app-shell { display: flex; min-height: 100vh; }`. Porém, o renderer simplesmente fazia `return <div class="wm-app-shell">${children}</div>`. Como consequência, a sidebar e todos os elementos subsequentes (`page-header`, `metric-grid`, `chart`, `data-table`, `kanban`) viravam filhos diretos do flexbox em linha, ficando espremidos lado a lado horizontalmente.
* **Correção:** O renderer de `app-shell` agora separa o `<aside class="wm-sidebar">` e empacota todo o conteúdo restante dentro de `<main class="wm-app-main"><div class="wm-app-content">...</div></main>`, garantindo a barra lateral fixa à esquerda e o painel com rolagem vertical à direita.

---

### 🐛 Bug 4: `data-table` ignorando as diretivas `column`
* **Arquivo:** [`packages/runtime/src/renderer/registry.ts`](file:///workspaces/Wovemark/packages/runtime/src/renderer/registry.ts)
* **Causa Raiz:** A renderização das linhas fazia `Object.keys(item).map(...)`. Se o JSON retornado possuísse chaves em ordem diferente ou campos extras não declarados nas colunas, a tabela exibia dados em colunas erradas.
* **Correção:** O renderer de `data-table` agora extrai os campos definidos nas diretivas `::column field="..."` e renderiza estritamente os campos correspondentes, além de formatar automaticamente badges de status (`Healthy`, `Active`).

---

### 🐛 Bug 5: Ausência de Interatividade no `ActionEngine`
* **Arquivo:** [`packages/runtime/src/actions/engine.ts`](file:///workspaces/Wovemark/packages/runtime/src/actions/engine.ts)
* **Causa Raiz:** O `ActionEngine` possuía apenas listeners para cliques em `[data-wm-action]` e tecla `Escape`. Faltavam:
  1. Listener para troca de abas (`.wm-tab-btn`).
  2. Listener de busca em tempo real para campos de busca de tabelas (`.wm-table-search`).
  3. Listener de ordenação em cabeçalhos de tabela (`th.wm-sortable`).
  4. Listener para fechar modais clicando fora do modal (`.wm-dialog-backdrop`).
* **Correção:** Adicionados listeners globais para todas as interações citadas acima, incluindo ordenação inteligente (detecta números vs strings) e filtragem de linhas em tempo real.

---

### 🐛 Bug 6: Submissão de Formulários Falhando em Ambientes Estáticos
* **Arquivo:** [`packages/runtime/src/actions/engine.ts`](file:///workspaces/Wovemark/packages/runtime/src/actions/engine.ts)
* **Causa Raiz:** Ao submeter um formulário com `submit="POST /api/demo"`, o engine tentava fazer um `fetch` real. Como o dev-server estático não possui rotas de API backend, o servidor respondia `404 Not Found`. O engine lançava um erro, exibia um toast vermelho de falha e impedia a execução do `data-wm-success` (que continha o fechamento do modal e o toast de sucesso).
* **Correção:** Adicionado tratamento gracioso para rotas mock/estáticas: quando não há backend ativo, o formulário limpa seus campos (`form.reset()`), exibe o toast de confirmação e dispara a cadeia de ações de sucesso (`close:modal`).

---

### 🐛 Bug 7: Links de Navegação Ativos Estáticos no Roteador
* **Arquivo:** [`packages/runtime/src/router/router.ts`](file:///workspaces/Wovemark/packages/runtime/src/router/router.ts)
* **Causa Raiz:** O roteador lia apenas o atributo `active=true` gravado no Markdown de cada página. Se o usuário navegasse pelas rotas de hash (`#features`, `#dashboard`, `#pricing`), os links no Navbar e na Sidebar não atualizavam visualmente.
* **Correção:** Implementado o método `syncActiveNavLinks()`, que é invocado a cada mudança de rota e atribui a classe `.wm-active` dinamicamente ao link correspondente ao `window.location.hash`.

---

### 🐛 Bug 8: Classes CSS Ausentes na Folha de Estilos
* **Arquivo:** [`packages/runtime/src/theme/styles.css`](file:///workspaces/Wovemark/packages/runtime/src/theme/styles.css)
* **Causa Raiz:** Diversos componentes registrados no runtime não tinham regras no CSS, ficando sem formatação visual:
  * `.wm-kanban` e `.wm-kanban-col`: Sem bordas, espaçamento e rolagem horizontal.
  * `.wm-tree-explorer` e `.wm-tree-node`: Sem estilos para o elemento `<details>`/`<summary>`.
  * `.wm-calendar-grid`: Sem layout de 7 colunas.
  * `.wm-pricing-features`: As listas de recursos em cartões de preço não tinham os ícones de checkmark estilizados.
* **Correção:** Adicionadas todas as regras no CSS com integração completa às variáveis de tema (`--wm-surface`, `--wm-border`, `--wm-color-accent`).

---

### 🐛 Bug 9: Falta de Pipeline de Build Standalone para o Runtime
* **Arquivo:** [`packages/runtime/package.json`](file:///workspaces/Wovemark/packages/runtime/package.json) e [`packages/runtime/scripts/bundle.js`](file:///workspaces/Wovemark/packages/runtime/scripts/bundle.js)
* **Causa Raiz:** O script de build original apenas executava `tsc -b && node scripts/bundle-css.js`. O TypeScript não resolve nem embute dependências do workspace como `@wovemark/parser` dentro do arquivo final compilado em `dist/index.js`.
* **Correção:** Criado o script `scripts/bundle.js` que utiliza o `esbuild` para compilar um bundle ES Module único e autocontido de 144 KB, sem dependências externas no navegador.

---

## 4. Guia para Futuros Agentes de IA

Ao interagir com o Wovemark ou criar projetos utilizando a ferramenta:

1. **Geração de Markdown:**
   * Mantenha os valores de strings de texto limpos de vírgulas internas se o atributo for ambiguamente uma lista, ou use a versão atualizada do parser.
   * Sempre defina `id` único para dialogs e associe aos botões usando `action="open:<id>"`.
   * Para layouts do tipo aplicação, sempre use `layout: app` no frontmatter e envolva a página com `:::app-shell`.
2. **Testes e Verificação:**
   * Execute `pnpm test` no monorepo para certificar que os testes unitários e de integração continuam passando.
   * Execute `node packages/cli/dist/bin.js validate <pasta>` para verificar diagnósticos sintáticos.
   * Teste a renderização no navegador abrindo `http://localhost:3000/` e testando cliques em abas, modais e rotas de hash.
