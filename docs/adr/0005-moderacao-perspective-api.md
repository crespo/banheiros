# ADR-0005: Moderação automática via Google Perspective API

**Date:** 2026-08-02
**Status:** Accepted

## Context

Avaliações e pins cadastrados só publicam depois de moderação automática server-side (PRD). A wordlist client-side do protótipo é placeholder. O serviço precisa cobrir PT e EN e rodar dentro de uma Edge Function.

## Decision

Google Perspective API como classificador:

- Edge Function de moderação recebe o texto (comentário de avaliação, ou nome + endereço de pin), chama a Perspective (atributos TOXICITY, PROFANITY, THREAT, IDENTITY_ATTACK, idioma pt/en) e aprova ou rejeita contra thresholds configuráveis.
- Conteúdo aprovado publica na hora; rejeitado retorna o motivo para a UI bloquear o envio, replicando a UX do banner do protótipo.
- A checagem client-side de wordlist do protótipo permanece só como feedback imediato de digitação; a decisão final é sempre server-side.
- Falha ou timeout da API: o conteúdo fica `pending` em vez de publicar (fail closed).

## Consequences

- Gratuita e com suporte a PT, sem custo por volume na v1.
- Limites: foco em toxicidade; spam e conteúdo sem sentido em pins não são detectados. Se virar problema, reavaliar um classificador LLM (registrar em nova ADR).
- Thresholds precisam de calibração com exemplos reais em PT-BR; começar conservador e ajustar.
- Dependência do Google Cloud (API key) além do Supabase.
