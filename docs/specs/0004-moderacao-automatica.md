# Spec 0004: Moderação automática

**Date:** 2026-08-03
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0005 (Perspective API), ADR-0003 (Edge Functions)

## Objetivo

Nenhum conteúdo de usuário publica sem passar por moderação automática server-side: comentários de avaliação e pins da comunidade são classificados pela Perspective API numa Edge Function, aprovados publicam na hora, rejeitados voltam com motivo pra UI bloquear o envio.

## Entregáveis

### Edge Function `moderate-submit`
- Único caminho de publicação: recebe a submissão autenticada (review completa, ou pin community), valida, chama a Perspective e grava a row já com o veredito (`approved` / `rejected`), retornando o resultado pro cliente.
- Perspective: atributos TOXICITY, PROFANITY, THREAT, IDENTITY_ATTACK, com `languages: [pt, en]`. Texto avaliado: comentário da review; nome + endereço do pin.
- Thresholds por atributo via env da function. Começar conservador (ADR-0005); calibração com exemplos reais em PT-BR antes do lançamento.
- Falha ou timeout da Perspective: grava como `pending` (fail closed) e responde ao cliente que o conteúdo ficou em análise. Nunca publica sem veredito.
- Review repetida do mesmo usuário no mesmo banheiro: a function faz o upsert sobre a unique `(bathroom_id, user_id)` da 0002; editar re-modera.
- O insert direto via RLS (que entra `pending`, spec 0002) permanece como está: é a rede de segurança, não um caminho de publicação.

### UI de submissão
- Compositor de review e formulário de pin passam a submeter via a function.
- Rejeição mostra o motivo e mantém o texto pro usuário editar (UX do banner do protótipo).
- `pending` (falha da API) mostra confirmação de "em análise", sem promessa de prazo.
- A wordlist client-side do protótipo não entra: feedback imediato de digitação fica de fora até se provar necessário; a decisão é sempre server-side.

## Critérios de teste (para o /dev)

- Comentário ofensivo em PT: rejeitado, review não aparece pra outros usuários, resposta carrega o motivo.
- Comentário limpo: `approved`, visível publicamente, entra na média do `bathroom_scores`.
- Pin community com nome ofensivo: rejeitado; pin limpo entra `approved` e aparece no mapa.
- Perspective fora do ar ou acima do timeout: row fica `pending`, cliente recebe estado "em análise".
- Threshold alterado via env muda o veredito do mesmo texto (sem mudança de código).
- Editar review existente re-modera: texto que virou ofensivo na edição é rejeitado e a versão aprovada anterior permanece.
- Testes usam respostas gravadas da Perspective, nunca a API ao vivo.

## Fora do escopo

- Moderação de fotos (entra com a spec de fotos, mesma fila).
- Revisão humana de `pending`/`rejected` e painel admin (PRD: fila lida direto no banco).
- Aprovação de pins por qualidade/duplicidade: moderação aqui é só de texto ofensivo.

## Dependências

- Spec 0002 aplicada (status em `bathrooms` e `reviews`, unique de review, `bathroom_scores`).
- Spec 0003 (submissões são autenticadas).
- API key da Perspective (Google Cloud), em secret da function; sem key em dev, a function roda com mock local.
