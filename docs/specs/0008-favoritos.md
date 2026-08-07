# Spec 0008: Favoritos

**Date:** 2026-08-06
**Status:** Ready
**Refs:** PRD 2026-08-02, spec 0002 (`favorites`), spec 0005 (mapa), spec 0006 (detalhe), design v2 (`docs/design/js/FavoritesScreen.jsx`, `App.jsx`)

## Objetivo

Favoritar/desfavoritar em qualquer lugar (badge no pin, estrela no sheet, lista dedicada), com um único estado de verdade por trás: a tabela `favorites`. Esta spec também resolve uma lacuna deixada pelas specs 0005/0006: `App.tsx` hoje renderiza só a `ProfileScreen` depois do login, sem nav e sem o `MapScreen` montado em lugar nenhum. Favoritos é a segunda aba, então é aqui que a navegação por abas (Mapa / Favoritos / Perfil) entra.

## Entregáveis

### Navegação por abas
- `App.tsx`, pós-login e pós-username: bottom nav com 3 abas (`nav.map`, `nav.favorites`, `nav.profile`, chaves já existentes), estado local da aba ativa, "map" como aba inicial.
- Monta `MapScreen` na aba "map" (hoje não é renderizado em lugar nenhum — gap fechado aqui), `FavoritesScreen` (novo) na aba "favorites", `ProfileScreen` na aba "profile".
- `App.test.tsx`: o teste atual "App renders ProfileScreen when there is a session" passa a esperar a aba "map" ativa por padrão (`MapScreen`/nav visível); ajustar como parte desta spec, não depois.

### Estado de favoritos
- Hook/módulo único (`src/lib/favorites.ts`, no padrão de `bathroomFilters`/`bathroomCategory`) que lê `favorites` do usuário logado (`user_id = auth.uid()`) e expõe toggle (`insert`/`delete` pela PK composta `(user_id, bathroom_id)`, RLS da 0002 já restringe ao dono).
- Toggle otimista: UI atualiza na hora, reverte se o insert/delete falhar.
- Fonte única consumida por `MapScreen`, `BathroomDetailSheet` (0006) e `FavoritesScreen` — favoritar em qualquer um dos três reflete nos outros dois sem reload de página.

### Badge no pin
- `MapScreen`: pins de banheiros favoritados ganham o badge de favorito (PRD; chave de legenda `map.legendFavorite` já existe em `src/i18n` mas não está sendo renderizada na legenda atual — entra aqui).
- Requer o `MapScreen` passar a buscar os `favorites` do usuário junto com os `bathrooms` (hoje só busca `bathrooms`).

### Estrela no sheet
- Preenche o placeholder deixado pela spec 0006 (`onToggleFavorite`/estado da estrela): estrela preenchida quando favoritado, chama o toggle do módulo de favoritos.

### Tela de Favoritos
- Lista dos banheiros favoritados do usuário: nome, endereço, nota geral (`bathroom_scores`, mesma fonte da 0006), ícone de categoria.
- Tocar no card abre o `BathroomDetailSheet` (0006) daquele banheiro.
- Botão de desfavoritar no card remove sem abrir o sheet (`stopPropagation`, como no protótipo).
- Vazio: `favorites.emptyTitle` / `favorites.emptySubtitle` (chaves já existentes).

## Critérios de aceitação

- Login: app abre na aba Mapa por padrão, com as 3 abas visíveis e navegáveis.
- Favoritar um banheiro pelo pin, pelo sheet ou pela lista de Favoritos: as outras duas superfícies refletem o novo estado sem reload.
- Banheiro favoritado exibe o badge de favorito no pin do mapa.
- Trocar de aparelho e logar na mesma conta: os favoritos persistem (lidos de `favorites`, não de estado local).
- Lista de Favoritos vazia mostra o estado vazio com a orientação de favoritar pelo mapa.
- Desfavoritar pela lista remove o card da lista e o badge do pin correspondente.

## Fora do escopo

- Cadastro de pin (FAB, AddPinModal): spec 0009.
- Oferta de 2FA pós-primeiro-login: spec própria (já fora de escopo da 0003).
- Ordenação/filtro da lista de favoritos: PRD não pede, volume de uso não justifica na v1.

## Dependências

- Spec 0002 aplicada (`favorites`, RLS de leitura/escrita só do dono).
- Spec 0003 (sessão autenticada, `ProfileScreen` já existe).
- Spec 0005 (`MapScreen` existe, ainda que não montado em `App.tsx`).
- Spec 0006 (`BathroomDetailSheet` com o placeholder de estrela a preencher).
