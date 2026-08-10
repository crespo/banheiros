# Spec 0011: Idioma antes do login

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-02, spec 0001 (i18n), spec 0003 (`AuthScreen`), design v2 (`docs/design/js/AuthScreen.jsx`)

## Objetivo

O PRD pede troca de idioma "disponível antes do login e no perfil". O lado do perfil existe desde a spec 0003. O lado de antes do login nunca foi construído: `setLanguage` (spec 0001) só é chamado de dentro do `ProfileScreen`, e `AuthScreen` não tem nenhum controle de idioma, mesmo o design v2 já prevendo um (botão flutuante com ícone de globo, canto superior, alterna pt/en).

## Entregáveis

### Ícone
- Adicionar `globe` a `src/Icon.tsx` (`PATHS`), path já definido no design handoff (`docs/design/js/Icons.jsx`): `'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'`.

### Botão de idioma no AuthScreen
- Botão flutuante (`aria-label` próprio, chave i18n nova se o design não tiver uma — conferir `auth.*` existentes antes de criar), ícone `globe`, alterna entre `pt`/`en` a cada toque (mesmo padrão binário do design v2, não um seletor de lista).
- Chama `setLanguage` do módulo `./i18n/i18n` — mas com um cuidado que o `ProfileScreen` **não tem hoje**: `setLanguage` só muda uma variável de módulo, sem nenhum mecanismo de notificação; nada re-renderiza sozinho. `AuthScreen` precisa manter seu próprio `useState` local espelhando o idioma atual e atualizá-lo no mesmo clique que chama `setLanguage`, para que o próprio componente re-renderize e todo texto via `t()` na tela mude imediatamente.
- Sem gravação em `profiles.language`: antes do login não existe linha de perfil. Comportamento idêntico ao que a spec 0001 já definia para pré-login — persiste só via `localStorage` (mecanismo que `setLanguage`/o módulo de i18n já cobre).

### Achado fora do escopo desta spec, mas registrado
- `ProfileScreen.changeLanguage` (spec 0003) tem o mesmo problema de raiz: chama `setLanguage` e grava no banco, mas nunca atualiza estado local, então o rádio de idioma no perfil não reflete a troca visualmente ao clicar (só reflete corretamente o idioma que já veio carregado do banco no mount — o teste existente, `"ProfileScreen renders a checked radio for the loaded language"`, cobre só esse caso, nunca o clique). Recomendação: tratar como bug isolado do `ProfileScreen`, não como parte desta spec — o fix é pequeno (mesma técnica de `useState` local) mas mexe em código já em produção fora do escopo de "idioma antes do login".

## Critérios de aceitação

- Dado o `AuthScreen` em português, quando o usuário toca no botão de globo, então todo texto da tela (`auth.welcomeTitle`, labels, botões) muda para inglês imediatamente, sem reload.
- Dado o idioma trocado para inglês no `AuthScreen`, quando o usuário recarrega a página antes de logar, então a tela abre em inglês (persistido via `localStorage`).
- Dado o idioma trocado no `AuthScreen`, quando o usuário completa o cadastro/login, então `ChooseUsernameScreen` e o restante do app abrem no idioma escolhido (nenhuma mudança adicional necessária, já que todos os componentes já leem de `t()`/o mesmo módulo de i18n).
- Dado um usuário anônimo sem sessão, quando abre o app pela primeira vez num navegador sem idioma salvo, então vê o idioma padrão atual (`pt`), sem regressão do comportamento existente.

## Fora do escopo

- Consertar a mesma falta de reatividade no `ProfileScreen` (achado documentado acima, spec própria se o time priorizar).
- Detecção automática de idioma via `navigator.language` do browser: não pedido pelo PRD, fica para quando houver necessidade concreta.
- Terceiro idioma: fora de escopo do PRD inteiro (estrutura já preparada desde a spec 0001).

## Dependências

- Spec 0001 aplicada (`src/i18n/i18n.ts`, `setLanguage`, dicionários `pt`/`en`).
- Spec 0003 aplicada (`AuthScreen.tsx` existe).
