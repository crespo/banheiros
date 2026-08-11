# Spec 0015: Fundação visual e componentes

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-10 (implementação visual da UI), design v2 (`docs/design/app.css`, `docs/design/_ds/organic-c64c9f96-c1a9-448b-af25-39dfd6a3d6ba/styles.css`, `docs/design/2026-08-02-design-v2-prompt.md`), design handoff v1 (`docs/design/design_handoff_banheiros/`), spec 0016 (pins reais no mapa — parte do mesmo PRD, branch separada)

## Objetivo

Portar o CSS já pronto (tokens v2, design system "Organic", layout `app.css`) para o app real e ligar os componentes React já existentes — que ou já usam os nomes de classe certos ou precisam ganhar `className`/wrappers — para que cada tela pareça o design validado, sem mudar comportamento já testado. É trabalho majoritariamente de CSS e marcação; verificação é visual (dev server contra os mockups), não por asserção automatizada — este projeto nunca testou por classe CSS ou estilo computado, só por role/label, e este PRD não muda essa convenção.

## Entregáveis

### Tokens e design system
- `src/styles/tokens.css`: substituir a paleta v1 (terracota accent, sage accent-2) pela paleta v2 (duas ramps de verde + laranja accent-3, em oklch) — mesmos valores já prontos em `docs/design/app.css` linhas 2–42. Atualizar `--map-water`/`--map-water-deep` para as versões re-derivadas que não brigam com os verdes.
- Portar os componentes genéricos do Organic (`docs/design/_ds/.../styles.css`): `.btn` (+ `-primary`/`-secondary`/`-ghost`/`-icon`/`-block`), `.field`/`.input`/`.radio`/`.seg`/`.seg-opt`, `.card` (+ variantes), `.tag` (+ variantes), `.dialog-backdrop`/`.dialog`/`.dialog-title`/`.dialog-body`/`.dialog-actions`, `.hr`, `.text-muted`, `:focus-visible`, `::selection` — novo arquivo `src/styles/components.css`, importado ao lado de `tokens.css`.
- Portar o CSS específico do app (`docs/design/app.css` linhas 43–217, exceto as classes de pin/posição — isso é da spec 0016): `.app-shell`, `.screen`/`.screen-pad`, chrome do mapa (`.map-screen`, `.map-topbar`, `.search-row`/`.search-box`, `.icon-btn-float`, `.chip-row`/`.chip`, `.legend-pop`/`.legend-row`/`.legend-dot`), `.fab`, `.bottom-nav`/`.nav-item`, `.sheet*` completo, conteúdo do detalhe (`.bh-*`, `.info-row`, `.status-pill`, `.overall-card`, `.cat-rows`/`.cat-row`, `.rating-dots`, `.actions-row`, `.star-btn`, `.section-title`, `.review-*`, `.report-link`, `.empty-note`), compositor (`.composer-*`, `.mod-warning`, `.visibility-*`, `.success-banner`), favoritos (`.fav-*`, `.empty-state`), perfil (`.profile-header`, `.avatar`, `.settings-row`, `.switch`, `.twofa-info` fica sem uso por ora), auth (`.auth-*`, `.pw-field`/`.pw-toggle`, `.divider-row`, `.switch-mode`, `.checkbox-row`, `.suggest-chip`, `.input.taken`, `.field-note`).

### App shell e navegação
- `App.tsx`: envolver o layout de `Gated` num `<div className="app-shell">`. `<nav>` vira `<nav className="bottom-nav">` com cada botão `className={"nav-item" + (tab === "x" ? " active" : "")}`.
- `ProfileScreen`/`FavoritesScreen`: wrapper `<div className="screen screen-pad">`.

### Mapa — chrome, não os pins
- `MapScreen.tsx`: wrapper `<div className="map-screen">`; barra superior com `.map-topbar` > `.search-row` (`.search-box` com ícone `search` + input, e `.icon-btn-float` para o botão de legenda) + `.chip-row` > `.chip` (`.active` quando selecionado); `.legend-pop` > `.legend-row` > `.legend-dot` (`.tone-accent`/`.tone-accent2`/`.paid`/`.fav`/`.you`); FAB ganha `.fab`; indicador de localização ganha `.user-location`/`.user-location-halo`/`.user-location-dot` (+ `.approximate` quando `locationMode === "approximate"`); `<div ref={mapRef}>` ganha `.map-canvas-wrap`/`.map-canvas` — é isso que resolve o container de altura zero do PRD.
- **Fora desta spec**: a lista de banheiros continua renderizando como `<button className={pin--${tone}}>` solta, do jeito que está hoje. Essa classe (`pin--accent`/`pin--accent2`, já definida em `tokens.css`) não é a classe real do design (`.pin`/`.pin-badge`) — não vale a pena estilizá-la aqui porque a spec 0016 substitui esse trecho inteiro por markers do MapLibre. Mexer nisso duas vezes é retrabalho.

### Bottom sheet do detalhe
- `BathroomDetailSheet.tsx`: dentro de `.sheet-backdrop`, adicionar o wrapper que falta — `<div className={"sheet" + (dragging ? " dragging" : "")}>` (precisa de um novo state `dragging`, setado em `onPointerDown`/limpo em `onPointerUp`, para a transição de arraste ficar correta) contendo `<div className="sheet-handle-area">` (envolve `.sheet-handle`), `<div className="sheet-header">` (envolve o botão de fechar, que ganha `className="sheet-close"` e o ícone `x`), `<div className="sheet-body">` (envolve o resto do conteúdo).
- Dentro do body: `.bh-title-row`/`.bh-tags`/`.bh-name`, `.info-row` (endereço com ícone `mapPin`, horário com ícone `clock` + `.status-pill open`/`.closed`), `.overall-card`, `.cat-rows` > `.cat-row` envolvendo os grupos de `.rating-dots` (a marcação de `.dot`/`.dot.filled` já existe, só precisa do wrapper), `.actions-row` com `.star-btn` (+ `.active` quando favoritado) e o botão de avaliar como `.btn.btn-primary`, `.section-title`, `.review-card`/`.review-top`/`.review-author`/`.review-date`/`.review-comment`, `.report-link` (ganha ícone `flag`), `.success-banner` (ganha ícone `check`).

### Compositor de avaliação (ReviewComposer)
- `.composer-head` envolvendo o botão de voltar (ganha ícone `arrowLeft`) e o título; `.composer-cat`/`.composer-cat-label` (com o ícone da categoria) por cima de cada `fieldset`.
- Trocar os `<input type="radio">` invisíveis das notas por botões visíveis com o número (`role="radio"` + `aria-checked` + o mesmo `aria-label` de hoje), classe `.rating-dots.pick` > `.dot` (`.filled` quando selecionado). Mantém a semântica de acessibilidade atual — `getByRole("radio", { name, checked })` e `toBeChecked()` continuam funcionando porque o jest-dom aceita `role="radio"` + `aria-checked` tanto quanto `<input type="radio">` nativo. Isso não é "reescrever comportamento testado": o handler (`setRatings`) e o contrato de acessibilidade não mudam, só o elemento HTML por trás.
- `.mod-warning` ganha ícone `alertTriangle`. `.visibility-card`/`.visibility-opt`. `textarea` ganha `.input`.

### Auth (AuthScreen) e modal de pin (AddPinModal)
- `AuthScreen.tsx`: `.auth-form`, `.field` (label + input), `.input`, `.divider-row`, `.switch-mode`, `.checkbox-row`, `.suggest-chip` (sugestão de username), `.input.taken` (quando `usernameTaken`).
- **Novo: mostrar/ocultar senha.** `.pw-field` envolvendo cada campo de senha (login: 1 campo; signup: 2 campos — senha e confirmação), com um botão `.pw-toggle` novo por campo. Cada um precisa do próprio state (`showPassword`, `showConfirmPassword`), alternando `type="password"`/`type="text"` e o ícone `eye`/`eyeOff`. Chaves i18n novas: `auth.showPassword`/`auth.hidePassword` (aria-label do botão), pt e en.
- Botão do Google ganha o componente `GoogleLogo` (novo, mesmo SVG de 4 cores de `docs/design/design_handoff_banheiros/prototype/js/Icons.jsx`, função `BanheirosGoogleLogo`), ao lado do texto já existente.
- `AddPinModal.tsx`: já usa `.dialog-backdrop`/`.dialog`/`.input` — trocar o `"×"` literal do botão de fechar pelo `Icon name="x"` (+ `className="sheet-close"`); campos de categoria viram `.seg`/`.seg-opt` no lugar dos radios soltos; `.dialog-actions` envolvendo o botão de envio; `.success-banner` ganha ícone `check`.

### Favoritos e perfil
- `FavoritesScreen.tsx`: `.fav-list` envolvendo os cards; cada card ganha `.fav-card` > `.fav-icon`/`.fav-body` (`.fav-name`/`.fav-addr`); botão de desfavoritar ganha `.fav-unstar`; estado vazio ganha `.empty-state` > `.circle`.
- `ProfileScreen.tsx`: `.profile-header`/`.avatar` (inicial do username), `.settings-row` para a linha de visibilidade padrão; o checkbox de visibilidade vira um switch (`role="switch"`/`aria-checked`, classe `.switch` + `.thumb`, `.on` quando ativo — mesmo padrão de toggle acessível do `BanheirosSwitch` do design); idioma vira `.seg`/`.seg-opt`; botão de logout ganha ícone `logOut`.

### Ícones
- `src/Icon.tsx`: adicionar os ícones que as mudanças acima passam a consumir — `x`, `arrowLeft`, `check`, `eye`, `eyeOff`, `flag`, `clock`, `logOut`, `alertTriangle`. Paths exatos já existem em `docs/design/design_handoff_banheiros/prototype/js/Icons.jsx`, é só portar (mesmo formato stroke-width 2.75 do `Icon.tsx` atual).
- Novo componente `GoogleLogo` (SVG fixo de 4 cores, sem paths do sistema de ícones mono).
- **Fora do escopo**: `camera` (só usado nos photo-slots decorativos do design — fotos são spec 0013, não construída), `globe` (botão de idioma na auth é spec 0011, não construída), `shieldCheck` (tela/seção de 2FA é spec 0012, não construída). Nenhum dos três tem consumidor real no app hoje.

### Responsivo
- Checklist visual (dev server, viewport ≥768px): `.app-shell` já vem com `max-width:480px` e `body{display:flex;justify-content:center}` no CSS portado — confirmar que o app fica centralizado com fundo neutro nas laterais em telas largas, sem esticar feio. Nenhum código novo esperado; se algo vazar (overflow, elemento sem `max-width`), corrigir pontualmente.

## Critérios de aceitação

- Dado qualquer tela do app, quando renderiza, então usa as cores/fontes/espaçamento/raios do design v2 — verificação visual via dev server, não asserção automatizada.
- Dado um botão, campo, chip, card, diálogo ou sheet, quando renderiza, então tem a aparência do design system "Organic" (idem, visual).
- Dado o app renderizando, então existe um `.app-shell` com largura máxima de 480px e a navegação por abas usa `.bottom-nav`/`.nav-item`.
- Dado o sheet de detalhe aberto, então a marcação inclui `.sheet`/`.sheet-handle-area`/`.sheet-header`/`.sheet-body` e o botão de fechar mostra o ícone `x`.
- Dado o compositor de avaliação, quando o usuário clica numa nota, então o mesmo comportamento de seleção/desseleção já testado continua passando com a marcação nova (teste existente, sem alteração).
- Dado a tela de auth, quando o usuário clica no ícone de olho de um campo de senha, então esse campo alterna entre texto oculto e visível — teste novo, por campo (login e os dois de signup).
- Dado o app numa viewport de 480px, então não há scroll horizontal nem overflow — checklist visual.
- Dado uma viewport desktop (ex. 1280px), então o app fica centralizado com largura máxima de 480px, sem esticar — checklist visual.

## Fora do escopo

- Posição real dos pins no mapa (markers geo-ancorados, comportamento ao arrastar/dar zoom): spec 0016.
- Fotos nos banheiros (photo-slots, upload): spec 0013, não construída ainda.
- Botão de idioma na tela de auth: spec 0011, não construída ainda.
- Tela/fluxo de 2FA: spec 0012, não construída ainda.
- Qualquer mudança de paleta, tipografia ou layout além do que o design v2 já define — não é uma revisão de design.

## Dependências

- Specs 0001–0010 aplicadas (todas as telas e componentes já existem e passam nos testes atuais).
- `docs/design/app.css` e `docs/design/_ds/organic-.../styles.css` como fonte do CSS a portar.
- i18n: novas chaves `auth.showPassword`/`auth.hidePassword` em pt e en.
