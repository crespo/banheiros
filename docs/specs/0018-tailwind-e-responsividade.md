# Spec 0018: Tailwind e responsividade

**Date:** 2026-08-11
**Status:** Ready
**Refs:** PRD 2026-08-11 (acabamento visual e responsividade), spec 0015 (fundação visual — `.app-shell`, chrome do mapa, `.sheet`/`.dialog`, checklist visual ≥768px em `docs/specs/0015-fundacao-visual-e-componentes.md:51`), spec 0016 (markers do mapa — não mexido aqui), spec 0017 (app-shell nas cinco telas pré-tab — recomendado mergear antes, não bloqueante)

## Objetivo

Fazer o app não quebrar fora da largura de celular — tablet, desktop, e celular em paisagem — adotando Tailwind CSS para as regras responsivas novas, configurado para ler os tokens já existentes (`src/styles/tokens.css`) em vez de introduzir uma paleta paralela. `.app-shell` (`src/styles/app.css:21-31`) já trava `max-width: 480px` e centraliza via `body { display:flex; justify-content:center }` — isso resolve a maior parte do caso "largura maior que celular" por construção. O trabalho real de responsividade fica em três pontas concretas, mapeadas por leitura direta do CSS: (1) os elementos flutuantes do mapa (`.map-topbar`, `.legend-pop`, `.fab`) usam offsets fixos em px que podem se sobrepor quando a altura da viewport encolhe (celular deitado, `100dvh` curto); (2) `.dialog-backdrop` (`src/styles/components.css:255-262`) usa `position: fixed`, ao contrário de `.sheet-backdrop` (`src/styles/app.css:337-344`) que usa `position: absolute` — isso faz o `AddPinModal` cobrir a janela do navegador inteira em vez de ficar contido no `.app-shell` em telas largas, achado durante o scout desta spec e confirmado com o usuário como parte do escopo; (3) o conjunto de ícones do PWA só tem 192x192/512x512.

## Entregáveis

### Tailwind — setup lendo os tokens existentes
- Dependências novas: `tailwindcss` (v4) + `@tailwindcss/vite`.
- `vite.config.ts`: plugin `tailwindcss()` (de `@tailwindcss/vite`) adicionado a `plugins: [...]`, ao lado do `react()`/`VitePWA()` já existentes.
- Novo `src/styles/tailwind.css`: `@import "tailwindcss";` seguido de um bloco `@theme inline` mapeando espaçamento/cor/raio para os tokens já existentes — cada entrada aponta para `var(--space-N)`/`var(--color-*)`/`var(--radius-*)` (não duplica valores), o que satisfaz por construção o critério "classe do Tailwind renderiza o mesmo valor do token" sem precisar de checagem em runtime.
- Import em `src/main.tsx`, depois de `./styles/app.css` (última import — utilitários do Tailwind precisam poder sobrepor as classes nomeadas já existentes quando as duas se aplicam ao mesmo elemento, já que têm a mesma especificidade de seletor).
- Escopo do Tailwind aqui é só as regras responsivas novas desta spec (elementos do mapa, sheet/dialog, checklist tablet/desktop) — o CSS já portado na 0015 (`.btn`, `.field`, `.card`, etc.) não é reescrito.

### Mapa — elementos flutuantes não se sobrepõem em paisagem
- `MapScreen.tsx`: `.map-topbar`, `.legend-pop` e `.fab` ganham classes utilitárias do Tailwind para o caso de viewport baixa (celular deitado, ex. ~375-430px de altura) — reduzir o offset vertical do `.legend-pop` (hoje fixo em `top: 96px`, `app.css:171`) e/ou limitar sua altura com scroll interno, e garantir que o `.fab` (hoje `bottom: calc(var(--nav-h) + 16px)`, `app.css:318`) nunca fica atrás de um `.chip-row` expandido. Ajuste é de posicionamento/tamanho apenas — nenhuma mudança nos markers/pins (isso é território da spec 0016).
- Sem contrapartida de largura: como `.map-topbar`/`.legend-pop`/`.fab` já estão contidos dentro do `.app-shell` (que nunca passa de 480px), não há risco de vazamento horizontal em desktop — só o eixo vertical (altura curta) precisa de ajuste.

### Dialog contido no app-shell
- `src/styles/components.css:255-262`: `.dialog-backdrop` troca `position: fixed` por `position: absolute` — mesmo padrão de `.sheet-backdrop`. Resultado: `AddPinModal` passa a ficar contido no `.app-shell` (centralizado dentro do frame de 480px) em vez de cobrir a janela do navegador inteira em telas largas.
- Regressão a conferir (visual + suite existente): `AddPinModal` continua abrindo/fechando/centralizando corretamente em 480px — nenhuma mudança de comportamento esperada nesse caso, só no caso de viewport mais larga que o shell.

### Sheet e diálogos em paisagem
- Checklist visual: `.sheet` (`app.css:345-355`, já `max-height: 88%` + `overflow-y: auto`) e `.dialog` (`components.css:263-272`, hoje sem `max-height`) conferidos em viewport de celular deitado (ex. ~640×360, ~812×375) — conteúdo não pode cortar, precisa continuar rolável e fechável. Se o `.dialog` cortar em alturas curtas (não tem o `max-height`/scroll que o `.sheet` já tem), ganha o mesmo tratamento (`max-height` + `overflow-y: auto`) — só se o checklist confirmar o corte, sem alteração especulativa.

### Checklist tablet/desktop — reexecutar e ampliar o da spec 0015
- A 0015 já tinha um item de checklist visual para ≥768px (`docs/specs/0015-fundacao-visual-e-componentes.md:51`), mas o PRD desta spec (background) registra que isso nunca foi de fato conferido fora do mapa/detalhe/avaliação/favoritos/perfil. Reexecutar em ≥768px e ≥1280px, agora cobrindo as oito superfícies: `MapScreen`, `FavoritesScreen`, `ProfileScreen`, e as cinco telas pré-tab da spec 0017 (`AuthScreen`, `ResetPasswordScreen`, `ChooseUsernameScreen`, `TermosScreen`, `PrivacidadeScreen`), mais os dois overlays (`BathroomDetailSheet`, `AddPinModal`). Corrigir pontualmente qualquer vazamento/overflow encontrado (mesma convenção da 0015) — nenhuma mudança especulativa além do que o checklist realmente encontrar.

### Ícones do PWA
- Dependência nova (dev): `@vite-pwa/assets-generator`, rodado uma vez contra `public/pwa-512.png` (única fonte de alta resolução hoje) para gerar o conjunto mais completo de tamanhos (ex.: 64, 192, 512, maskable, apple-touch-icon) em `public/`.
- `vite.config.ts:20-23`: `manifest.icons` ganha as entradas novas geradas, mesmo formato `{ src, sizes, type, purpose? }` já usado hoje.
- Sem teste automatizado — são ativos binários gerados, fora do alcance do vitest/jsdom (mesma exclusão de infra de teste visual já decidida na PRD anterior). Verificação: rodar o gerador, conferir os arquivos em `public/`, `npm run build` continua limpo.

### Testes
- Nenhuma lógica JS nova nesta spec (posicionamento CSS + um `position` trocado + config de build) — a suite existente (`MapScreen.test.tsx`, `AddPinModal.test.tsx`, `BathroomDetailSheet.test.tsx`) precisa continuar passando sem alteração, como regressão.
- Toda verificação de responsividade (mapa em paisagem, sheet/dialog em paisagem, checklist tablet/desktop) é checklist visual via dev server — mesma convenção já estabelecida na spec 0015, este projeto não testa por classe CSS ou estilo computado.

## Critérios de aceitação

- Dado o app aberto num navegador mais largo que o celular (tablet ou desktop), quando o usuário navega entre Mapa, Favoritos e Perfil, então nada quebra visualmente, não sobra espaço morto sem estilo além da moldura central do `.app-shell`, e todo elemento clicável continua acessível e do tamanho certo — checklist visual ampliado.
- Dado o `AddPinModal` aberto numa viewport mais larga que 480px, então o diálogo fica contido dentro do `.app-shell`, não cobrindo a janela do navegador inteira.
- Dado o app aberto num celular em paisagem, quando a folha de detalhe ou um diálogo está aberto, então o conteúdo não é cortado e continua rolável/fechável.
- Dado o `MapScreen` aberto em qualquer largura suportada ou em paisagem, quando a legenda, os chips de filtro ou o botão de adicionar pin estão visíveis, então nenhum deles se sobrepõe a outro elemento nem vaza para fora da tela.
- Dado o arquivo de configuração do Tailwind, quando um componente usa uma classe de cor, espaçamento ou raio de borda, então o valor renderizado é idêntico ao token já existente — satisfeito por construção (o `@theme` aponta para as CSS custom properties, não duplica valores) e conferido por leitura de código, não teste.
- Dado o manifesto do PWA, então `icons` inclui um conjunto de tamanhos mais completo que os dois existentes hoje (192x192/512x512), com os arquivos correspondentes em `public/`.

## Fora do escopo

- Um layout desktop desenhado do zero — mobile-first continua sendo a base; fora do celular o objetivo é escalar bem, não virar uma experiência diferente.
- Infraestrutura de teste visual (Storybook, screenshot, comparação automática).
- Telas de 2FA, upload de foto e seletor de idioma (specs 0012, 0013, 0011).
- Reescrever em Tailwind qualquer CSS já portado pela spec 0015 — só as regras responsivas novas desta spec usam classes utilitárias; `.btn`/`.field`/`.card`/etc. continuam como estão.
- Conteúdo jurídico real de Termos/Privacidade, validação de username, e app-shell nas cinco telas pré-tab — isso é spec 0017.

## Dependências

- Spec 0015 aplicada (`.app-shell`, chrome do mapa, `.sheet`/`.dialog`, tokens).
- Recomendado, não bloqueante: spec 0017 mergeada primeiro, para o checklist tablet/desktop já cobrir as cinco telas pré-tab. Os entregáveis de mapa/dialog/PWA desta spec não dependem da 0017.
