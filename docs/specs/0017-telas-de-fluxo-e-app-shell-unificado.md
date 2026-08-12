# Spec 0017: Telas de fluxo sem estilo e app-shell unificado

**Date:** 2026-08-11
**Status:** Ready
**Refs:** PRD 2026-08-11 (acabamento visual e responsividade), spec 0015 (fundação visual — `.field`/`.input`/`.btn`/`.card`/`.field-note`/`.pw-field`/`.pw-toggle`/`.success-banner`/`.composer-head` já portados em `src/styles/components.css`/`src/styles/app.css`), spec 0003 (auth e perfil — onde `ResetPasswordScreen`/`TermosScreen`/`PrivacidadeScreen`/`ChooseUsernameScreen` nasceram como HTML puro)

## Objetivo

Estilizar as quatro telas de fluxo secundário que hoje renderizam HTML cru — redefinir senha (`ResetPasswordScreen.tsx`), termos (`TermosScreen.tsx`), privacidade (`PrivacidadeScreen.tsx`) e escolha de nome de usuário (`ChooseUsernameScreen.tsx`) — reaproveitando os componentes visuais já existentes (campo, botão, cartão, nota de erro), sem alterar o comportamento já testado.

Ao investigar essas quatro telas, ficou claro que nenhuma delas — nem `AuthScreen.tsx`, que já é considerado "pronto" pela spec 0015 — está hoje envolvida pelo `.app-shell` (`App.tsx:60,62,66`; `TermosScreen.tsx`/`PrivacidadeScreen.tsx` são rotas de topo fora do `Gated()`). Só a árvore pós-login (mapa/favoritos/perfil, `App.tsx:66-77`) ganha o frame de 480px centralizado com sombra. Fora do celular, essas cinco telas hoje esticam/flutuam sem moldura — o que quebra direto o espírito do PRD ("parece quebrada ou abandonada") e a "moldura central" que a spec de responsividade (0018) depende de já existir em todo lugar. Decisão tomada com o usuário: as cinco entram no mesmo `.app-shell` nesta spec, antes da 0018 cuidar do comportamento responsivo propriamente dito. Isso é trabalho de CSS e marcação, igual à 0015 — verificação visual via dev server, não asserção automatizada, exceto onde a marcação nova introduz comportamento (mostrar/ocultar senha).

## Entregáveis

### CSS: wrapper para telas sem bottom-nav
- `src/styles/app.css`: novo `.screen-standalone` ao lado de `.screen`/`.screen-pad` — mesmo comportamento (`position: absolute; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch`), mas sem o recorte de `bottom: var(--nav-h)`, já que nenhuma das cinco telas desta spec tem bottom-nav. Usa `.screen-pad` junto para o padding padrão (`var(--space-4)`), igual ao par `.screen.screen-pad` já usado em `FavoritesScreen`/`ProfileScreen`.

### App-shell nas cinco telas pré-tab
- `AuthScreen.tsx`, `ResetPasswordScreen.tsx`, `ChooseUsernameScreen.tsx`, `TermosScreen.tsx`, `PrivacidadeScreen.tsx`: cada uma envolve o próprio retorno em `<div className="app-shell"><div className="screen-standalone screen-pad">...conteúdo atual...</div></div>`. Mudança só na marcação de cada componente — `App.tsx` não muda (os quatro `if` de `Gated()` e as duas `<Route>` de nível superior continuam retornando esses componentes do jeito que já fazem hoje).

### Redefinir senha (ResetPasswordScreen)
- Campos: `.field` envolvendo cada `<label>` + `.pw-field` (com `.input` + botão `.pw-toggle` com ícone `eye`/`eyeOff`), no mesmo padrão dos campos de senha da `AuthScreen` (`AuthScreen.tsx:106-119`) — estado próprio por campo (`showPassword`, `showConfirmPassword`), já que a tela tem dois campos de senha (`new-password`/`confirm-password`) e a spec 0015 só cobriu os campos da própria `AuthScreen`.
- Botão de envio: `.btn.btn-primary.btn-block`.
- Sucesso: `.success-banner` com ícone `check` envolvendo a mensagem, seguido do botão de continuar (`.btn.btn-primary.btn-block`) — mesmo padrão usado em `BathroomDetailSheet`/`AddPinModal` (spec 0015).
- Erro: `.field-note.warn`.

### Termos e Privacidade (TermosScreen, PrivacidadeScreen)
- Cabeçalho: `.composer-head` envolvendo o link/botão de voltar — mesmo padrão já usado em `ReviewComposer.tsx:29-30` (ícone `arrowLeft` + `{t("common.back")}`). Mantém o elemento `<a href="/">` (não é ação cancelável de formulário, é navegação real), só ganha a marcação/ícone.
- Conteúdo: `.card` envolvendo `<h1 className="card-title">{título}</h1>` + `<p className="card-body">{texto}</p>` — as duas telas continuam usando o mesmo texto placeholder (`legal.placeholder`) já existente; conteúdo jurídico real fica fora do escopo desta spec, como já fora do escopo da PRD.

### Escolha de nome de usuário (ChooseUsernameScreen)
- Segue o mesmo padrão visual do campo de username da `AuthScreen` (`AuthScreen.tsx:66-70`): wrapper `.auth-form` (dentro do `.screen-standalone.screen-pad`) contendo `.field` (label + `.input`) e `.btn.btn-primary.btn-block` para o botão de continuar. O `.field-note.warn` do erro já existe (`ChooseUsernameScreen.tsx:36`) — sem mudança aí.

### Testes
- `ResetPasswordScreen.test.tsx`: dois testes novos, mesmo padrão de `AuthScreen.test.tsx:49-55` — clicar no ícone de olho do campo `new-password` alterna `type="password"`/`type="text"`; idem para `confirm-password`.
- `TermosScreen.test.tsx`, `PrivacidadeScreen.test.tsx`, `ChooseUsernameScreen.test.tsx`: testes existentes (por `role`/`label`) continuam passando sem alteração — a marcação nova não muda a árvore de acessibilidade. Nenhum teste novo esperado além do de `ResetPasswordScreen` acima.
- Nenhuma asserção por className ou estilo computado — mesma convenção da spec 0015.

## Critérios de aceitação

- Dado um usuário pedindo redefinição de senha, quando ele chega na tela de nova senha, então os campos (com mostrar/ocultar senha), o botão e as mensagens de sucesso/erro usam os mesmos componentes visuais do resto do app.
- Dado um usuário abrindo o link de Termos ou Privacidade, então a página aparece dentro do `.app-shell` (não HTML cru, não esticada full-bleed), legível dentro de um `.card`, com o mesmo padrão de botão de voltar (`.composer-head` + ícone `arrowLeft`) usado no compositor de avaliação.
- Dado um usuário novo terminando o cadastro, quando ele chega na tela de escolher nome de usuário, então o formulário usa `.auth-form`/`.field`/`.input`/`.btn-primary`, o mesmo padrão visual da tela de login/cadastro.
- Dado qualquer uma das cinco telas (auth, redefinir senha, escolher username, termos, privacidade) renderizando numa viewport desktop (ex. 1280px), então aparece dentro do mesmo `.app-shell` centralizado de 480px que as telas pós-login já usam — checklist visual.
- Dado o campo de nova senha ou confirmação na tela de redefinir senha, quando o usuário clica no ícone de olho, então esse campo alterna entre texto oculto e visível — teste automatizado, por campo.

## Fora do escopo

- Comportamento responsivo em landscape/tablet/desktop além do `.app-shell` já existir nessas cinco telas (chips do mapa, sheet, diálogo, ícones do PWA, Tailwind): spec 0018.
- Conteúdo jurídico real de Termos/Privacidade — segue placeholder.
- Validação de formato de username ou checagem de disponibilidade na `ChooseUsernameScreen` (isso já existe só na `AuthScreen`, spec de auth original) — fora do escopo, só estilização.
- Qualquer mudança de paleta, tipografia ou layout além do que os componentes já portados definem.

## Dependências

- Specs 0001–0016 aplicadas.
- Spec 0015 aplicada: `.field`/`.input`/`.btn`/`.card`/`.field-note`/`.pw-field`/`.pw-toggle`/`.success-banner`/`.composer-head`/ícones `eye`/`eyeOff`/`arrowLeft`/`check` precisam existir antes desta spec.
- Sem dependência da spec 0018 (Tailwind não é necessário aqui — é reaproveitamento de CSS já portado).
