# ADR-0002: Frontend em React + Vite (SPA)

**Date:** 2026-08-02
**Status:** Accepted

## Context

A plataforma é Web/PWA (ADR-0001). O handoff de design já é React (JSX por tela), então a distância entre protótipo e produção define o esforço de tradução. O app fica atrás de login e não precisa de SEO nem SSR na v1.

## Decision

SPA em React com Vite. PWA via manifest + service worker (vite-plugin-pwa). As telas do handoff (`AuthScreen`, `MapScreen`, `BathroomModal`, `ReviewComposer`, `FavoritesScreen`, `ProfileScreen`, `AddPinModal`) servem de ponto de partida para os componentes reais, construídos sobre os tokens do design system "Organic" como CSS variables. A fidelidade visual segue a referência de design vigente (hoje o handoff, sujeito a uma v2), não esta ADR. Mapa com MapLibre GL JS. i18n mantendo a estrutura de chaves dot-namespaced do handoff.

## Consequences

- Protótipo em React barateia a tradução: mesma linguagem de componentes e mesmos tokens, mesmo que o visual evolua.
- Sem servidor de renderização para operar; deploy é estático.
- Páginas públicas indexáveis de banheiros (SEO) exigiriam migração futura para SSR; fora do escopo da v1.
- Escolhas de router e state management ficam para as specs de feature; começar com o mínimo (estado local + contexto) e deixar os testes pedirem abstração.
