# ADR-0004: Dados OSM via extrato sincronizado

**Date:** 2026-08-02
**Status:** Accepted

## Context

As localizações de banheiros e as flags "este comércio tem banheiro" vêm do OpenStreetMap. Consultar a Overpass API em runtime coloca latência e rate limits de um serviço comunitário no caminho crítico do mapa, e dificulta mesclar POIs do OSM com pins cadastrados pela comunidade.

## Decision

Job periódico (Edge Function agendada) consulta a Overpass API para a região de cobertura e sincroniza numa tabela própria no Postgres:

- Query por `amenity=toilets` e POIs com `toilets=yes`, extraindo nome, lat/lng, `fee` (mapeia para categorias pagas), `opening_hours` e `wheelchair` quando existirem.
- Upsert por OSM id; pins da comunidade vivem na mesma tabela com origem `community`, diferenciados por um campo `source`.
- O mapa consulta somente o banco (query espacial por viewport via PostGIS).
- Atribuição "© OpenStreetMap contributors" visível no mapa, conforme a licença ODbL.

## Consequences

- Mapa rápido e estável, sem dependência externa em runtime.
- Dados podem ficar até um ciclo de sync desatualizados; aceitável para POIs de banheiro, que mudam raramente.
- Dados OSM chegam incompletos (sem horário, sem nome); a UI mostra estado desconhecido em vez de inventar valores, conforme o PRD.
- Começar com uma região de cobertura (Maceió, como no protótipo) e expandir ajustando só a área da query.
