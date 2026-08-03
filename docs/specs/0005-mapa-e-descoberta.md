# Spec 0005: Mapa e descoberta

**Date:** 2026-08-03
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0001 (PWA + MapLibre), design v2 (`docs/design/js/MapScreen.jsx`)

## Objetivo

A tela principal real: mapa MapLibre com os banheiros aprovados do Supabase, pins por categoria, filtros, legenda, busca por endereço, geolocalização com fallbacks e o aviso de região não coberta. Substitui o mapa fake de blocos do protótipo.

## Entregáveis

### Mapa
- MapLibre GL com tiles raster do OSM público, atribuição OSM visível (obrigatória, PRD). Registrado aqui: o tile server público serve pra validação em Maceió; se tráfego ou política de uso apertarem, migrar pra provider com key vira uma tarefa, não um debate.
- Estilo do mapa alinhado à paleta v2 (cores de água re-derivadas pra não brigar com os verdes, conforme prompt da design v2).

### Centro inicial e localização
- Ordem de fallback (PRD): posição precisa do browser → região aproximada → região padrão de cobertura (Maceió).
- Com localização ativa, posição do usuário como círculo verde com halo, visualmente distinto de qualquer pin em forma e cor (design v2, item 5).
- Permissão negada: mapa na região padrão, busca funcional, sem nag de permissão.
- Fora da área de cobertura: aviso claro de "região ainda não coberta" sobre o mapa, nunca vazio silencioso.

### Pins
- Fonte: `bathrooms` com `status = approved`, carregados pelo bbox visível.
- Cor por categoria (`kind`: public/instore), badge de cifrão quando `paid` (as 4 categorias do handoff são a combinação, spec 0002). Badge de favorito entra na spec de favoritos.
- Sem nome no OSM: pin abre com fallback de nome genérico traduzido, nunca vazio.
- Tap no pin seleciona e emite o evento que abre o detalhe (bottom sheet é spec própria; aqui o tap destaca o pin selecionado).

### Filtros e legenda
- Chips Todos / Público / Comercial / Pago sobre o mapa, com a semântica do PRD ("Público" inclui públicos grátis e pagos; "Pago" corta pelos dois kinds).
- Legenda acessível a partir do mapa explicando cores e badges.

### Busca por endereço
- Geocoding via Nominatim público com debounce, atribuição e User-Agent identificado; resultado move o mapa. Mesma nota dos tiles: trocar de provider é tarefa futura se o uso crescer.
- Busca com viés pra área de cobertura (viewbox Maceió) pra não jogar o usuário no oceano.

## Critérios de aceitação

- Logado com localização permitida: mapa abre centrado na posição, círculo verde visível e distinto dos pins.
- Permissão negada: mapa abre em Maceió com busca funcional.
- Posição fora da cobertura: aviso de região não coberta visível.
- Só banheiros `approved` viram pins; um `pending` recém-cadastrado não aparece.
- Filtro "Público" mostra públicos grátis e pagos, e nada de instore; "Pago" mostra pagos dos dois kinds.
- Banheiro pago exibe o badge de cifrão além da cor de categoria.
- Buscar um endereço de Maceió move o mapa pro lugar; atribuições OSM/Nominatim visíveis.
- Tiles e pins renderizam com a paleta v2 sem cor hardcoded fora dos tokens.

## Fora do escopo

- Bottom sheet de detalhe, avaliações, horário aberto/fechado: spec própria.
- Favoritos (badge e lista): spec própria.
- Cadastro de pin (FAB leva ao login/fluxo, mas o fluxo é spec própria).
- Clustering de pins: densidade de Maceió não exige na v1; reavaliar com dados reais.

## Dependências

- Spec 0002 aplicada e sync rodado (banheiros reais de Maceió no banco).
- Spec 0003 (app autenticado; mapa é pós-login).
- MapLibre GL via npm; tiles OSM e Nominatim públicos, sem conta.
