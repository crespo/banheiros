# ADR-0001: Plataforma alvo é Web/PWA

**Date:** 2026-08-02
**Status:** Accepted

## Context

O handoff de design (`design_handoff_banheiros/README.md`) deixa a stack em aberto: nativo iOS/Android, React Native ou web. Não existe codebase de produção. O produto precisa de mapa interativo com tiles OSM, geolocalização, gestos de bottom sheet e distribuição rápida para validar a ideia com usuários reais.

## Decision

A v1 é uma aplicação Web/PWA:

- Mapa via MapLibre GL JS com tiles OSM.
- Geolocalização e permissões via APIs do browser.
- Instalável (manifest + service worker), sem passar por app store.
- O bottom sheet com drag-to-dismiss é implementado com pointer events ou biblioteca de gestos web, mantendo o limiar de ~110px do handoff.

## Consequences

- Menor custo e ciclo de feedback mais curto: um deploy atualiza todos os usuários.
- Sem revisão de loja, sem duas codebases, alinhado com validar antes de investir.
- Gestos e performance de mapa são um degrau abaixo do nativo; o bottom sheet exige cuidado extra para não parecer "web".
- Push notifications e integração profunda com o SO ficam limitadas; nada na v1 depende disso.
- Se a validação der certo e a UX de mapa virar gargalo, migrar para React Native reaproveita o backend e o design system inteiros.

## ADRs unlocked by this decision

- ADR-0002: framework web e estratégia de renderização.
- ADR-0003: backend, persistência e auth.
- ADR-0004: fonte de dados OSM (Overpass ao vivo vs extrato sincronizado).
- ADR-0005: serviço de moderação automática de texto.
