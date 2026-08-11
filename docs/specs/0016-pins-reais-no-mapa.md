# Spec 0016: Pins reais no mapa

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-10 (implementação visual da UI), spec 0005 (mapa e descoberta — onde os pins nasceram como lista de botões), spec 0015 (fundação visual — CSS `.pin`/`.pin-badge`/`.pin-sub`/`.pin-fav` e chrome do mapa), design `docs/design/design_handoff_banheiros/prototype/js/MapScreen.jsx` (`BanheirosPin`)

## Objetivo

Banheiros aparecem como pins ancorados na posição geográfica real sobre o mapa MapLibre — não como uma lista de botões ao lado, desconectada visualmente do mapa — coloridos por categoria, com badges de pago/favorito, acompanhando o mapa ao arrastar ou dar zoom. Fecha a lacuna deixada pela spec 0005: o `MapScreen` já carrega os banheiros aprovados, categoriza e filtra, mas ainda renderiza cada um como `<button>` solto fora do canvas do mapa (`src/MapScreen.tsx:93`).

Diferente da spec 0015 (CSS e marcação), este é código de comportamento novo — uso da API de `Marker` do MapLibre — por isso fica em spec própria, testável via mock.

## Entregáveis

### Markers via MapLibre
- `MapScreen.tsx`: para cada banheiro filtrado, criar um `maplibregl.Marker` com um elemento HTML customizado (mantém um `<button>` clicável dentro, para preservar acessibilidade/clique) posicionado via `.setLngLat([lon, lat])` e `.addTo(map)`. O elemento usa as classes já portadas na spec 0015: `.pin` (raiz), `.pin-badge` (+ `.tone-accent`/`.tone-accent2` pela categoria), `.pin-sub` (badge de pago), `.pin-fav` (badge de favorito), `.pin.selected` quando `b.id === selectedId`.
- Efeito dedicado (`useEffect`) que cria/atualiza/remove markers quando: a lista de banheiros carrega, o filtro muda, `favoriteIds` muda, ou `selectedId` muda. Remove markers órfãos antes de recriar a lista corrente; limpa todos no unmount do `MapScreen`.
- Clique no marker seleciona o banheiro (mesmo `selectedId` já existente) e abre o `BathroomDetailSheet` — comportamento idêntico ao botão de hoje, só muda o elemento que dispara.
- Pins continuam ancorados à posição geográfica correta ao arrastar/dar zoom — comportamento nativo do `maplibregl.Marker`, sem lógica extra de reposicionamento da nossa parte.

### Testes
- `MapScreen.test.tsx`: hoje mocka `maplibregl` só com `Map: vi.fn()` (linha 9) — estender o mock com `Marker: vi.fn()` retornando um objeto encadeável (`setLngLat`/`addTo`/`remove`/`getElement`, cada um retornando `this` ou o mock conforme uso). Testes novos: markers são criados com o `[lon, lat]` de cada banheiro aprovado; o tom (`.tone-accent`/`.tone-accent2`) bate com a categoria; badge de pago aparece quando `bathroom.paid`; badge de favorito aparece quando o id está em `favoriteIds`; clicar no elemento do marker seleciona o banheiro (mesma asserção que hoje verifica `aria-pressed`/abertura do sheet).

## Critérios de aceitação

- Dado que o mapa carrega os banheiros, então cada um aparece como um pin na posição geográfica correta sobre o mapa, colorido pela categoria, com os badges de pago/favorito quando aplicável.
- Dado que o usuário arrasta ou dá zoom no mapa, então os pins continuam ancorados às posições geográficas corretas — coberto indiretamente: testamos que `setLngLat` foi chamado com o par certo por marker, não a re-renderização do mapa em si (isso é responsabilidade do MapLibre, fora do nosso código).
- Dado um banheiro sem `lat`/`lon` válidos — não deve acontecer hoje (todo banheiro aprovado tem coordenadas, seja do OSM ou da geocodificação do cadastro de pin, spec 0010), mas se vier nulo o marker correspondente não é criado, sem lançar erro.

## Fora do escopo

- CSS/aparência do pin em si (`.pin`/`.pin-badge`/etc já vem pronto da spec 0015 — esta spec só cria os markers e aplica as classes).
- Clustering de pins (fora de escopo desde a spec 0005; densidade de Maceió não exige na v1).
- Popup nativo do MapLibre (`marker.setPopup`) — o clique abre o `BathroomDetailSheet` já existente, não um popup do próprio mapa.

## Dependências

- Spec 0005 aplicada (mapa, carregamento de banheiros, categorização, filtro).
- Spec 0008 aplicada (`favoriteIds` já carregado no `MapScreen`).
- **Spec 0015 aplicada primeiro**: o CSS `.pin`/`.pin-badge`/`.pin-sub`/`.pin-fav` precisa existir para o marker nascer com a aparência correta. Branch desta spec parte de `main` só depois que a 0015 mergear — mesma convenção já usada entre specs anteriores (nunca stackar uma spec não-mergeada em cima de outra).
