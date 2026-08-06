# Spec 0006: Detalhe do banheiro

**Date:** 2026-08-06
**Status:** Ready
**Refs:** PRD 2026-08-02, spec 0002 (`bathrooms`/`reviews`/`reports`/`bathroom_scores`), spec 0005 (mapa), design v2 (`docs/design/js/BathroomModal.jsx`)

## Objetivo

Tocar um pin no mapa abre o bottom sheet com os dados reais do banheiro: tags, endereço, horário com status aberto/fechado, nota geral e por critério vindas de `bathroom_scores`, lista de avaliações aprovadas, e a ação de reportar problema gravando em `reports`. Escrever avaliação e favoritar são specs próprias (0007, 0008); aqui entram só como pontos de entrada (botão e estrela) que essas specs preenchem depois.

## Entregáveis

### Abertura e fechamento do sheet
- `selectedId` do MapScreen (spec 0005) passa a abrir o `BathroomDetailSheet` sobre o mapa.
- Fechar: toque no backdrop, no X, ou arrastar o handle além do limiar (design v2: >110px). Soltar antes do limiar retorna o sheet à posição. Sem gesto de arrastar em teste (jsdom não simula pointer drag de forma confiável) — cobrir a lógica do limiar como função pura testável (`shouldCloseOnDrag(dragY)`), a exemplo de `bathroomFilters`/`bathroomCategory`.

### Dados do banheiro
- Query ao abrir: `bathrooms` (id, name, address, kind, paid, open_time, close_time) + `bathroom_scores` (médias por critério e geral) pelo `id` selecionado.
- Tags: categoria (pública/comercial, reaproveita `categorizeBathroom` da 0005) e grátis/pago.
- Nome ausente: reaproveita `bathroomDisplayName` (fallback genérico traduzido, já existe em `src/lib/bathroomName.ts`).

### Horário aberto/fechado
- `open_time`/`close_time` nulos (spec 0002: fora do padrão simples vira null) → linha de horário mostra estado "desconhecido" (`bathroom.hoursUnknown`, chave nova), nunca inventa horário.
- Presentes → mostra "HH:MM – HH:MM" e o pill aberto/fechado calculado na hora local do browser. Função pura `isOpenNow(openTime, closeTime, now)` em `src/lib/bathroomHours.ts`, cobrindo o caso overnight (`close <= open`, ex. Posto Ipiranga 24h) igual ao protótipo (`bhIsOpenNow`).

### Nota geral e por critério
- Nota geral: número da view `bathroom_scores`, 1 casa decimal, escala de 3 (`bathroom.overallScore`).
- 5 linhas por critério (`ratingCat.*`, já em `src/i18n`) com os 3 dots preenchidos conforme a média arredondada — mesmo padrão visual do protótipo (`BanheirosCatRows`), sem os ícones fixos do protótipo se não estiverem no set de `Icon.tsx` (usar os que já existem: `accessibility`, `lightbulb`, `wind`, `wrench`, `sparkles` — adicionar ao `Icon.tsx` os que faltarem).
- Banheiro sem nenhuma review `approved`: `bathroom_scores` não retorna linha → sheet mostra "Ainda não há avaliações" no lugar da nota geral, sem quebrar layout (não é o mesmo copy de `bathroom.noReviews`, que é da lista abaixo — decidir se reaproveita a mesma chave ou cria uma; reaproveitar `bathroom.noReviews` é suficiente, não duplicar string).

### Lista de avaliações
- `reviews` com `status = approved` do banheiro, mais recentes primeiro. Autor: `@username` quando `show_username = true` e `user_id` não nulo; senão `common.anonymous` (cobre também o caso LGPD de `user_id` null pós-exclusão de conta).
- Vazio: `bathroom.noReviews`.
- Sem paginação na v1 (volume de Maceió não justifica).

### Fotos
- Fora do escopo desta spec (PRD: should-have, spec própria). O sheet não renderiza a fileira de fotos do protótipo nesta v1.

### Reportar problema
- Botão/link (`bathroom.reportIssue`) abre um campo de comentário opcional e envia pra `reports` (insert autenticado, spec 0002: `bathroom_id`, `user_id`, `comment` nullable). Sem moderação — não é conteúdo público (PRD, 0004 fora de escopo).
- Sucesso: confirmação inline (toast ou banner reaproveitando o padrão `success-banner` do protótipo), pin permanece visível, sem redirecionar nem fechar o sheet.

### Pontos de entrada para specs futuras
- Botão "Escrever avaliação": no MVP desta spec, sem handler (placeholder desabilitado ou `onWriteReview` prop vazia) — spec 0007 implementa o composer.
- Estrela de favorito: mesma coisa, placeholder — spec 0008 implementa o toggle e o estado preenchido/vazio.

## Critérios de aceitação

- Tocar um pin no mapa abre o sheet com nome, tags, endereço e horário do banheiro selecionado.
- Banheiro com horário 06:00–22:00: abrir o detalhe às 23:00 mostra "Fechado agora"; abrir às 10:00 mostra "Aberto agora".
- Banheiro 24h (open=close ou overnight): pill mostra "Aberto agora" em qualquer horário do dia.
- Banheiro sem `open_time`/`close_time`: linha de horário mostra estado desconhecido, sem inventar valor.
- Banheiro com reviews aprovadas: nota geral é a média de `bathroom_scores` com 1 casa decimal; lista mostra as reviews aprovadas, autor correto (username, anônimo, ou "Usuário anônimo" quando `user_id` é null).
- Banheiro sem review aprovada: sem nota geral quebrando o layout, lista mostra o estado vazio.
- Toque no backdrop ou no X fecha o sheet.
- Reportar problema com comentário: grava em `reports` com `bathroom_id` e `user_id` corretos, usuário vê confirmação, pin segue visível no mapa.

## Fora do escopo

- Escrever/editar avaliação: spec 0007.
- Favoritar/desfavoritar: spec 0008.
- Fotos: spec própria (should-have do PRD).
- Painel de revisão de `reports`: PRD, sem admin na v1.

## Dependências

- Spec 0002 aplicada (`bathrooms`, `reviews`, `reports`, `bathroom_scores`, RLS de insert autenticado em `reports`).
- Spec 0005 (MapScreen fornece `selectedId` e os componentes de categoria/nome reaproveitados aqui).
