# Spec 0001: Setup do projeto

**Date:** 2026-08-02
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0001 (PWA), ADR-0002 (React + Vite)

## Objetivo

Repo executável com a stack decidida nas ADRs, pronto para receber as features: app Vite + React + TypeScript na raiz, PWA instalável, tokens do design system, i18n com a estrutura de chaves do handoff, e test runner configurado para o fluxo TDD.

## Entregáveis

### Scaffold
- Vite + React + TypeScript (template oficial), `package.json` na raiz do repo.
- Scripts: `dev`, `build`, `test`, `lint`.
- Vitest + @testing-library/react configurados, com um smoke test renderizando o shell do app.
- GitHub Actions: um workflow que roda `lint`, `test` e `build` em push.

### PWA
- vite-plugin-pwa: manifest (name "Banheiros", display standalone, theme/background colors vindos dos tokens) + service worker registrado.
- Ícone placeholder até a design v2 entregar a marca final.

### Design tokens
- `src/styles/tokens.css`: CSS variables com os valores do design system "Organic" do handoff (`design_handoff_banheiros/prototype/_ds/.../styles.css`): cores + ramps, espaçamento (4.4 a 35.2px), radius (sm/md/lg + pill), sombras, tipografia.
- **As cores são placeholder**: a design v2 re-tematiza para verdes + laranja accent (ver `docs/design/2026-08-02-design-v2-prompt.md`). Estruturar para que o re-tema seja trocar valores neste único arquivo, nada hardcoded fora dele.
- Fontes self-hosted via @fontsource (Caprasimo 400, Figtree 400/600/700), essas não mudam na v2.

### i18n
- Módulo próprio mínimo em `src/i18n/`: dicionários `pt.ts` e `en.ts` migrados verbatim das chaves do handoff (`prototype/js/i18n.js`, sem a lista `banned`, que morreu com a ADR-0005), função `t(key, vars)` com interpolação `{{var}}`, idioma persistido em localStorage até existir perfil.
- Manter a estrutura dot-namespaced (`auth.*`, `nav.*`, `map.*`, ...). Terceiro idioma = um arquivo novo.
- Sem biblioteca externa: o contrato é pequeno (lookup + interpolação) e os testes cobrem. Se plural/formatação aparecer no futuro, migrar para lib vira uma spec.

## Critérios de aceitação

- `npm run dev` sobe o shell do app com os tokens aplicados (fundo, fonte de título e de corpo visivelmente corretos).
- `npm test` roda e passa; `npm run lint` limpo; `npm run build` gera o bundle com manifest e service worker.
- App instalável como PWA no Chrome (manifest válido, SW ativo).
- `t('auth.title')` retorna a string do idioma ativo; trocar idioma reflete imediatamente e sobrevive a reload.
- CI verde no push.

## Fora do escopo

- Router, telas reais, cliente Supabase, deploy/host (host estático ainda não escolhido), ícones finais.

## Dependências

Nenhuma externa. Não precisa de conta em serviço nenhum.
