# Spec 0007: Avaliação

**Date:** 2026-08-06
**Status:** Ready
**Refs:** PRD 2026-08-02, spec 0002 (`reviews`), spec 0004 (`moderate-submit`), spec 0006 (detalhe do banheiro), design v2 (`docs/design/js/ReviewComposer.jsx`)

## Objetivo

O botão "Escrever avaliação" do sheet (spec 0006) abre o compositor: 5 critérios obrigatórios, comentário obrigatório, escolha de visibilidade do usuário, envio pela `moderate-submit` (spec 0004). Reabrir o compositor num banheiro já avaliado pelo usuário carrega a avaliação existente para edição, nunca cria uma segunda linha.

## Entregáveis

### Abrir o compositor
- Substitui a view do sheet (mesmo padrão do protótipo: `view: "detail" | "review"` dentro do `BathroomDetailSheet` da 0006, não uma rota nova).
- Ao abrir, busca a review do próprio usuário para aquele `bathroom_id` (`reviews` filtrado por `user_id = auth.uid()`, RLS da 0002 já permite).
  - Existe: pré-preenche as 5 notas, o comentário e a visibilidade com os valores da review existente (não com o default do perfil — é a edição do que já foi enviado).
  - Não existe: campos vazios; visibilidade pré-selecionada com `profiles.default_show_username` (spec 0003). "Manter anônimo" é o pré-selecionado quando o default é `false` (PRD).
- "Voltar" (seta) retorna ao `view: "detail"` sem salvar.

### Formulário
- 5 linhas de critério (`ratingCat.*`, já existentes em `src/i18n`), seletor de 1 a 3 com rótulo visível em cada opção (PRD: escala semântica fixa, não só número).
- Campo de comentário, obrigatório.
- Botão de publicar (`review.submit`) desabilitado enquanto falta qualquer um dos 5 critérios ou o comentário está vazio (PRD, critério literal). Sem validação de conteúdo ofensivo no cliente — a wordlist do protótipo não entra (decisão já registrada na 0004); a decisão de conteúdo é sempre da `moderate-submit`.
- Visibilidade: dois rádios, "Manter anônimo" / "Mostrar @username", nota explicando o default da conta (`review.hideUsernameNote`, já existente).

### Envio
- Publicar chama a Edge Function `moderate-submit` (spec 0004) com `bathroom_id`, as 5 notas, `comment`, `show_username`. Nenhum insert direto do cliente na tabela `reviews` (a function é o único caminho de publicação, spec 0004).
- Função faz upsert sobre a unique `(bathroom_id, user_id)`: criar e editar usam a mesma chamada, sem branch no cliente.
- Resposta `approved`: volta para `view: "detail"`, mostra o banner de sucesso (`review.successMessage`, mesmo padrão do protótipo, alguns segundos e some), e a spec 0006 já cobre o refetch de `bathroom_scores` e da lista de reviews — este disparo de refetch é entregável desta spec (o sheet precisa saber que algo mudou).
- Resposta `rejected`: permanece em `view: "review"`, mostra o motivo (`review.moderationWarning`) sem apagar o texto digitado, usuário edita e reenvia.
- Resposta `pending` (falha/timeout da Perspective, fail closed): mostra confirmação de "em análise" (`review.pendingMessage`, chave nova — não existe no dicionário atual) e volta para `view: "detail"`; a review não aparece na lista pública ainda, e não entra na média até ser aprovada.
- Erro de rede/infra (não veredito de moderação): mensagem de erro genérica, formulário permanece preenchido, sem perder o texto.

## Critérios de aceitação

- Compositor sem os 5 critérios preenchidos ou sem comentário: botão de publicar desabilitado.
- Comentário ofensivo: `moderate-submit` rejeita, a review não publica, usuário vê o motivo e o texto permanece editável.
- Comentário limpo: publica, aparece na lista do sheet e entra na média (`bathroom_scores`) na próxima leitura.
- Usuário com `default_show_username = false`: abrir o compositor pela primeira vez nesse banheiro mostra "Manter anônimo" pré-selecionado; ele pode trocar só para aquela avaliação sem alterar o default da conta.
- Usuário que já avaliou o banheiro: tocar em "Escrever avaliação" abre o compositor preenchido com a avaliação existente (notas, comentário, visibilidade); publicar substitui a mesma linha, sem duplicar e sem contar duas vezes na média.
- Falha/timeout da Perspective: usuário vê confirmação de "em análise", sem promessa de prazo, review não some do fluxo mas também não aparece pública ainda.
- Publicar com sucesso: sheet volta pro detalhe com o banner de sucesso e a nota geral/lista refletem a nova avaliação sem precisar reabrir o sheet manualmente.

## Fora do escopo

- Lógica de moderação em si (thresholds, Perspective, upsert): spec 0004, já Ready.
- Bottom sheet, dados do banheiro, horário, favoritar: spec 0006.
- Fotos na avaliação: spec própria (should-have do PRD).

## Dependências

- Spec 0002 aplicada (`reviews`, unique `(bathroom_id, user_id)`, RLS de select/insert do próprio usuário).
- Spec 0004 (`moderate-submit` deployada/mockável local).
- Spec 0006 (o sheet e o ponto de entrada "Escrever avaliação" precisam existir para este montar dentro dele).
- Spec 0003 (`profiles.default_show_username`, sessão autenticada).
- Nova chave i18n `review.pendingMessage` (pt/en) a adicionar em `src/i18n` antes do /dev desta spec.
