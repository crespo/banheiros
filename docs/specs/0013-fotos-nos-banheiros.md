# Spec 0013: Fotos nos banheiros

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0003 (Supabase), ADR-0005 (Perspective API, texto), spec 0006 (detalhe do banheiro), spec 0009 (deploy, bucket de Storage), design v2 (`docs/design/js/BathroomModal.jsx`)

## Objetivo

Usuários logados enviam fotos no detalhe do banheiro. O design v2 só tem uma fileira de 3 slots decorativos (`photo-row`/`photo-slot`, ícone de câmera) sem nenhuma interação de upload desenhada — esta spec define a interação e a estrutura de dados do zero, algo que o handoff não cobre.

## Decisão: sem moderação automática de imagem na v1

O PRD pede "uploads passam pela mesma moderação" das avaliações e pins. Mas a moderação automática existente (ADR-0005) é a Perspective API, que só avalia **texto** — não existe verificação automática de conteúdo de imagem no projeto hoje, e adicionar uma (Cloud Vision SafeSearch ou equivalente) é uma decisão de arquitetura nova, fora do que esta spec pode decidir sozinha (exigiria seu próprio ADR).

Para não prometer uma moderação que não existe de verdade: fotos publicam imediatamente após o upload (sem fila `pending`), e ficam sujeitas ao fluxo de "reportar problema" que já existe (spec 0006) para remoção depois do fato. Se isso virar risco real de conteúdo impróprio, o time abre um ADR de moderação de imagem antes de expandir o volume.

## Entregáveis

### Dado e Storage
- Tabela `bathroom_photos`: `id`, `bathroom_id` (FK), `user_id` (FK, nullable — mesma regra de anonimização das `reviews` quando a conta é excluída), `storage_path`, `created_at`. RLS: leitura pública, insert só do próprio usuário autenticado, sem update/delete via API (remoção só por report + ação manual do time, mesmo modelo que já existe para pins/avaliações problemáticas).
- Bucket de Storage (já provisionado, spec 0009 cobre a criação): path `bathroom-photos/{bathroom_id}/{user_id}-{timestamp}.{ext}`. Policy: upload só autenticado, leitura pública.
- Validação client-side antes do upload: tipo `image/*`, tamanho máximo (proposta: 5MB) — mensagem clara se o arquivo não passar.

### UI no detalhe do banheiro
- Substitui os 3 slots decorativos por uma fileira real: fotos existentes (`bathroom_photos` do banheiro, mais recentes primeiro) mais um botão de adicionar (ícone de câmera) para usuários logados.
- Estado vazio: `t("bathroom.noPhotos")` (chave já existe desde a spec 0001) quando não há nenhuma foto.
- Ao escolher um arquivo válido: upload para o Storage, insert em `bathroom_photos`, a foto aparece na fileira assim que o upload confirma (sem precisar recarregar o detalhe).
- Toque numa foto abre em tamanho maior (lightbox simples) — sem edição, sem legenda.

## Critérios de aceitação

- Dado um banheiro sem fotos, quando o detalhe abre, então mostra o estado vazio "Sem fotos ainda".
- Dado um usuário logado no detalhe, quando escolhe uma imagem válida, então ela aparece na fileira de fotos assim que o upload termina, sem precisar recarregar.
- Dado um arquivo que não é imagem ou passa do tamanho máximo, quando o usuário tenta enviar, então vê o erro e o upload não acontece.
- Dado um usuário deslogado no detalhe, quando o botão de adicionar foto aparece, então clicar nele direciona ao login (mesmo padrão de qualquer ação que exige sessão).
- Dado uma foto enviada, quando qualquer outro usuário abre o mesmo banheiro, então a foto aparece publicamente, sem fila de aprovação.
- Dado uma foto imprópria já publicada, quando alguém usa "reportar problema" no banheiro, então o report entra na mesma fila manual que já existe, e o time remove a foto direto no Storage/banco (sem painel de admin, mesma limitação da v1 que já vale para pins/avaliações).
- Dado um usuário que exclui a conta, quando a exclusão completa, então suas fotos já publicadas permanecem (mesma lógica de anonimização das avaliações: `user_id` vira null, a foto em si não é removida).

## Fora do escopo

- Moderação automática de conteúdo de imagem: decisão fora desta spec, ver seção acima.
- Editar, recortar ou adicionar legenda a fotos.
- Limite de fotos por usuário/por banheiro além da validação básica de arquivo.
- Denúncia dedicada por foto (usa o "reportar problema" do banheiro como um todo, já existente).

## Dependências

- Spec 0002 aplicada (padrão de tabelas/RLS a seguir).
- Spec 0006 aplicada (`BathroomDetailSheet`, fluxo de "reportar problema" que cobre a remoção pós-publicação).
- Spec 0009 aplicada (bucket de Storage provisionado em produção).
