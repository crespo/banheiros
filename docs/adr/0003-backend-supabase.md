# ADR-0003: Backend e auth via Supabase

**Date:** 2026-08-02
**Status:** Accepted

## Context

O produto precisa de contas (email/senha, Google OAuth, TOTP futuro), persistência de banheiros, avaliações, favoritos e fila de moderação, storage de fotos (should-have) e queries geoespaciais para o mapa. Não existe backend e o objetivo é validar o produto com o mínimo de código próprio.

## Decision

Supabase como backend:

- **Postgres + PostGIS** para banheiros (lat/lng), avaliações, favoritos e fila de moderação.
- **Supabase Auth** para email/senha e Google OAuth; TOTP nativo do Supabase cobre o 2FA (should-have) sem fluxo custom.
- **Row Level Security** como fronteira de autorização: favoritos e preferências só do dono; avaliações e pins só entram como `pending` e só leitura pública quando `approved`.
- **Edge Functions** para o que não pode ser client-side: chamada ao serviço de moderação (ADR-0005) e o job de sync OSM (ADR-0004).
- **Storage** para fotos de banheiros quando entrarem no escopo.
- Nota geral do banheiro é recomputada como média real das avaliações aprovadas (view ou trigger no Postgres), nunca o blend incremental do protótipo.

## Consequences

- Elimina servidor de aplicação próprio: auth, banco, storage e functions num serviço só.
- LGPD: exclusão de conta usa a deleção do Supabase Auth mais anonimização das avaliações (autor vira nulo, comentário permanece).
- Lock-in moderado; mitigado por ser Postgres padrão por baixo (dump e migração possíveis).
- RLS vira código de produção crítico e precisa de testes próprios (as policies são a autorização do sistema).
