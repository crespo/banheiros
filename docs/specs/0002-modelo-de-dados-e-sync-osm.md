# Spec 0002: Modelo de dados e sync OSM

**Date:** 2026-08-02
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0003 (Supabase), ADR-0004 (extrato sincronizado)

## Objetivo

Schema Postgres completo no Supabase (migrations versionadas), políticas RLS que implementam as regras do PRD, e a Edge Function de sync que popula banheiros de Maceió a partir do Overpass. Tudo rodando local via Supabase CLI + Docker, sem depender de projeto cloud.

## Modelo de dados

Migrations em `supabase/migrations/`. Extensões: PostGIS, citext.

### `profiles`
- `user_id` PK → `auth.users` (on delete cascade).
- `username` citext unique not null (regras: 3 a 30 chars, `[a-z0-9._]`).
- `default_show_username` boolean default false.
- `language` text default 'pt'.

### `bathrooms`
- `id` uuid PK.
- `source` text: `osm` | `community`.
- `osm_id` bigint, unique, null quando `source = community`.
- `name` text, `address` text.
- `kind` text: `public` | `instore`; `paid` boolean. (As 4 categorias do handoff são a combinação dos dois; os chips de filtro derivam daqui.)
- `location` geography(Point, 4326).
- `open_time` / `close_time` time, nullable. Só horário simples diário; `opening_hours` do OSM que não seja um intervalo único `HH:MM-HH:MM` vira null (a UI mostra "horário desconhecido", nunca inventa valor, por PRD).
- `osm_tags` jsonb: tags cruas do OSM para uso futuro (wheelchair, fee, operator), sem interpretação na v1.
- `status` text: `approved` | `pending` | `rejected`. OSM entra `approved`; community entra `pending` (moderação, spec futura).
- `created_by` uuid nullable → `auth.users` (set null on delete).
- `osm_seen_at` timestamptz: última vez visto no sync (só source=osm).

### `reviews`
- `id` uuid PK, `bathroom_id` FK, `user_id` → `auth.users` **on delete set null** (avaliação vira "Usuário anônimo", exigência LGPD do PRD).
- 5 colunas de nota smallint com check `between 1 and 3`: `accessibility`, `lighting`, `odor`, `maintenance`, `cleanliness`.
- `comment` text not null, `show_username` boolean, `status` (`approved`/`pending`/`rejected`), `created_at`, `updated_at`.
- **Unique `(bathroom_id, user_id)`**: uma avaliação por usuário por banheiro; editar substitui (PRD).

### `favorites`
- PK composta `(user_id, bathroom_id)`, cascade no delete do usuário.

### `reports`
- `id`, `bathroom_id`, `user_id` (set null on delete), `comment` nullable, `created_at`, `resolved` boolean default false. Fila lida direto no banco (PRD: sem painel admin).

### View `bathroom_scores`
- Por banheiro: média por categoria e média geral, **apenas de reviews `approved`**, arredondada a 1 decimal na escala de 3. Fonte única da nota; nada de blend incremental do protótipo.

## RLS (resumo das políticas)

- `bathrooms`: select público de `approved`; `pending`/`rejected` visíveis só ao `created_by`. Insert autenticado, forçando `source=community`, `status=pending`, `created_by=auth.uid()`. Sem update/delete por usuários.
- `reviews`: select público de `approved`. Insert/update só do próprio `user_id`; status entra `pending` (aprovação vem da moderação, spec futura).
- `favorites`, `profiles`: leitura e escrita só do dono. Exceção: lookup de disponibilidade de `username` via function `security definer` (retorna boolean, não vaza dados).
- `reports`: insert autenticado; sem select para usuários (fila interna).

## Edge Function `osm-sync`

- Agendada (diária) e invocável manualmente.
- Query Overpass no bbox de Maceió: nós/ways `amenity=toilets`, mais POIs com `toilets=yes`.
- Mapeamento: `amenity=toilets` → `kind=public`; POI comercial com `toilets=yes` → `kind=instore`; `fee=yes` → `paid=true`; `opening_hours` parseado só no padrão simples (senão null); tags cruas em `osm_tags`.
- Upsert por `osm_id`, atualizando `osm_seen_at`.
- Ausente do sync: remove se não tem review/favorite/report; se tem conteúdo de usuário, mantém e apenas deixa de atualizar (decisão registrada aqui para não virar debate no código).
- Falha do Overpass: aborta sem tocar no banco, loga erro. Nunca sync parcial.

## Critérios de teste (para o /dev)

- Parser de `opening_hours`: "06:00-22:00" vira par de times; "Mo-Fr 08:00-18:00; Sa 08:00-12:00" e lixo viram null.
- Mapeamento Overpass → row: casos public, instore, fee, sem nome (name null, UI decide fallback), sem horário.
- Unique `(bathroom_id, user_id)`: segunda insert do mesmo usuário falha; upsert atualiza.
- `bathroom_scores`: média só de approved, 1 decimal; banheiro sem review aprovada não aparece (ou aparece sem nota, decidir no teste de UI depois).
- Delete de usuário: reviews permanecem com `user_id` null; favorites e profile somem.
- RLS: anônimo não lê `pending`; usuário não insere bathroom `approved`; usuário não lê favorite alheio.
- Sync idempotente: rodar duas vezes com o mesmo payload não duplica nem altera nada.

## Fora do escopo

- Moderação (Perspective) e aprovação de pending: spec própria.
- Sugestão de username no cadastro: spec de auth (a function de disponibilidade nasce aqui, a sugestão lá).
- Qualquer UI.

## Dependências

- Supabase CLI + Docker rodando local. Projeto cloud só na hora do deploy.
- Overpass API pública (só em dev/CI para fixtures; testes usam payloads gravados, não a API ao vivo).
