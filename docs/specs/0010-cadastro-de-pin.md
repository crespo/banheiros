# Spec 0010: Cadastro de pin

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-02, spec 0002 (`bathrooms`), spec 0004 (moderação), spec 0005 (mapa, FAB), design v2 (`docs/design/js/AddPinModal.jsx`)

## Objetivo

Usuário logado sugere um novo banheiro pelo mapa: nome, categoria, endereço, horário. Entra na mesma fila de moderação automática das avaliações antes de aparecer para todo mundo. Fecha a lacuna deixada pela spec 0005: o FAB (`+`) já existe no `MapScreen` e a Edge Function `moderate-submit` já sabe processar `type: "pin"` (insere em `bathrooms` com `source: "community"` e `status` do veredito) — falta só o formulário e a ligação entre os dois.

## Entregáveis

### AddPinModal (novo componente)
- Modal do design v2 (`AddPinModal.jsx`): nome, categoria (4 opções via rádio — `public`, `instore`, `public_paid`, `instore_paid`, que o front decompõe em `kind`/`paid` antes de enviar), endereço, horário de abertura/fechamento. Chaves i18n `addPin.*` já existem desde a spec 0001, nenhuma nova precisa ser criada.
- Botão de envio desabilitado até nome (>2 caracteres) e endereço (>3 caracteres) preenchidos, mesma regra do protótipo.
- Ao enviar: geocodificar o endereço digitado via Nominatim (mesmo endpoint que o `MapScreen` já usa para a busca por endereço, spec 0005) para obter lat/lon — o formulário não pede escolher um ponto no mapa, o endereço é a única fonte de localização. Sem resultado de geocodificação, mostra erro e não envia.
- Chama `moderate-submit` com `{ type: "pin", name, address, kind, paid, open_time, close_time, lat, lon }`, autenticado (mesmo padrão de `ReviewComposer`, spec 0007).
- Veredito `approved`/`pending`: banner de sucesso (`addPin.successNote`) e fecha o modal. Veredito `rejected`: mesma UX de aviso de moderação já usada no `ReviewComposer`.

### Extensão da `moderate-submit`
- `PinSubmission` hoje não aceita `open_time`/`close_time`, mas a tabela `bathrooms` (spec 0002) já tem essas colunas. Adicionar os dois campos ao tipo e ao insert — mudança pequena e aditiva na function existente, sem quebrar o formato usado pela extração de texto/moderação (`extractText`, que já lida com `PinSubmission` pelo campo `name`+`address`, não pelos horários).

### Ligar o FAB
- `MapScreen` já recebe `onAddBathroom?: () => void` (spec 0005) mas ninguém passa essa prop hoje. `App.tsx` passa um handler que abre o `AddPinModal`, mesmo padrão de estado local que `MapScreen` já usa para `selectedId`/`BathroomDetailSheet`.
- Usuário deslogado nunca vê o FAB: `MapScreen` só é montado depois do login (`App.tsx`), então o critério do PRD ("usuário deslogado tenta acessar o FAB, é direcionado ao login") já está satisfeito pela estrutura de navegação existente — nenhuma lógica nova necessária, só confirmar via teste.

### Should Have: cadastro assistido por OSM
- Ao geocodificar o endereço, se o resultado cair perto (mesmo raio usado para deduplicar no `osm-sync`, ADR-0004) de um banheiro já sincronizado do OSM (`source = 'osm'`) que tenha nome e/ou horário preenchidos, pré-preencher esses campos no formulário antes do usuário editar. Usuário sempre pode sobrescrever.

## Critérios de aceitação

- Dado um usuário logado, quando toca no FAB, então o `AddPinModal` abre com os campos do design v2.
- Dado nome ou endereço vazios/curtos demais, quando o formulário renderiza, então "Enviar para moderação" fica desabilitado.
- Dado um endereço que geocodifica com sucesso, quando o usuário envia um pin válido, então recebe a confirmação de envio e o pin não aparece no mapa antes da aprovação (mesma fila de moderação das avaliações).
- Dado um endereço que não geocodifica, quando o usuário tenta enviar, então vê um erro claro em vez de uma chamada silenciosamente quebrada.
- Dado um pin aprovado pela moderação, quando o mapa recarrega, então o novo pin aparece com `source: "community"`.
- Dado um pin reprovado pela moderação, quando o veredito volta, então o usuário vê o aviso de moderação, igual ao fluxo de avaliação.
- Dado um endereço próximo de um POI já sincronizado do OSM com nome/horário conhecidos, quando o formulário geocodifica, então nome e horário vêm pré-preenchidos, editáveis.
- Dado um usuário deslogado, não existe caminho de UI até o FAB (ele só aparece depois do login) — coberto por teste de integração, não por lógica nova.

## Fora do escopo

- Escolher a localização do pin manualmente no mapa (arrastar um marcador, tocar num ponto): a v1 usa só a geocodificação do endereço digitado.
- Editar ou remover um pin depois de enviado: fluxo de correção fica para quando houver necessidade concreta.
- Fotos no cadastro de pin: specs distintas (0013 cobre fotos só no detalhe/avaliação por enquanto).

## Dependências

- Spec 0002 aplicada (`bathrooms`, colunas `open_time`/`close_time`, `source`, `status`).
- Spec 0004 aplicada (`moderate-submit` já existe e já trata `type: "pin"` para os campos que já tinha).
- Spec 0005 aplicada (`MapScreen`, FAB, integração Nominatim para geocodificação).
- Spec 0009 (deploy): a Perspective API precisa estar configurada em produção para o veredito de moderação valer para pins, não só para avaliações — já é dependência compartilhada, nada novo aqui.
