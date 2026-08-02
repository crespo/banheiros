# PRD: Banheiros — encontrar e avaliar banheiros públicos

**Date:** 2026-08-02
**Status:** Draft

## Problem

Quem está na rua e precisa de um banheiro não tem como saber onde existe um acessível ao público, se está aberto, se é pago e em que condições está. A informação existe de forma fragmentada (OpenStreetMap tem localizações, mas sem qualidade nem condições reais), e a frustração é recorrente para pedestres, turistas, motoristas de app, gestantes, idosos e pessoas com deficiência. Hoje a solução é perguntar, torcer ou consumir algo num comércio para usar o banheiro.

## Background

A ideia inicial foi validada num handoff de design de alta fidelidade (`design_handoff_banheiros/README.md`): um app mobile-first com mapa, pins de banheiros em 4 categorias (público, comercial, e variantes pagas), avaliações em 5 critérios (acessibilidade, iluminação, odor, manutenção, limpeza) numa escala de 1 a 3, favoritos, e envio de novos pins pela comunidade. O protótipo clicável define layout, copy PT/EN, tokens visuais e interações. Falta agora transformar o protótipo em produto real: dados de banheiros vindos do OpenStreetMap, backend com contas e persistência, moderação automática de conteúdo e as decisões de stack.

O diferencial do produto é avaliar o banheiro em critérios que importam na decisão de ir até lá (dá pra acessar de cadeira de rodas? tem luz à noite? o cheiro é suportável?), e não uma nota genérica de 5 estrelas.

## Requirements

### Must Have

- **Mapa com banheiros reais**: ao entrar, o mapa centra na melhor informação de localização disponível (posição precisa, senão região aproximada, senão a região padrão de cobertura). Com localização ativa, a posição do usuário aparece como um círculo verde, distinto dos pins de banheiro. Pins vindos do OpenStreetMap mais os cadastrados pela comunidade, coloridos por categoria (público / comercial) com badge de pago e badge de favorito. Busca por endereço ou local.
- **Filtro por categoria**: chips Todos / Público / Comercial / Pago, mais uma legenda explicando os pins.
- **Detalhe do banheiro**: bottom sheet com nome, categoria, tags grátis/pago, endereço, horário com status "Aberto agora" / "Fechado agora", nota geral (média dos 5 critérios, escala de 3), notas por critério e lista de avaliações.
- **Escrever avaliação**: 5 critérios obrigatórios numa escala de semântica fixa (1 = ruim, 2 = razoável, 3 = bom, rótulos visíveis no seletor), comentário obrigatório, escolha por avaliação entre anônimo ou mostrar o @usuario. Uma avaliação por usuário por banheiro: voltar ao compositor edita a existente, e a média conta cada usuário uma vez. Conteúdo passa por moderação automática antes de publicar; texto ofensivo bloqueia o envio com aviso claro.
- **Favoritos**: favoritar/desfavoritar em qualquer lugar (pin, sheet, lista), lista dedicada, persistido na conta.
- **Contas**: cadastro e login com email/senha (com confirmação de email obrigatória antes do primeiro login) e com Google. Sem campo de nome: a identidade da conta é o username, obrigatório e único, pedido depois do email e pré-preenchido com uma sugestão disponível derivada dele (raul@gmail.com sugere "raul"; se ocupado, "raul1", e assim por diante), sempre editável. O username aparece nas avaliações só se o usuário optar; preferência padrão configurável no perfil, com override por avaliação.
- **Excluir conta**: disponível no perfil. Remove o login e os dados pessoais; avaliações já publicadas permanecem como "Usuário anônimo" (exigência LGPD).
- **Cadastrar banheiro**: usuário logado sugere um novo pin (nome, categoria, endereço, horários). Entra em fila de moderação automática antes de aparecer no mapa.
- **Idiomas PT e EN**: troca de idioma disponível antes do login e no perfil. Estrutura de chaves preparada para um terceiro idioma sem retrabalho. Conteúdo gerado por usuários não é traduzido.
- **Reportar problema num pin**: afordância no detalhe do banheiro que grava o report (pin, usuário, comentário opcional) numa fila interna, revisada manualmente pelo time direto no banco. Sem painel de admin na v1; o pin permanece visível até revisão.

### Should Have

- **2FA por TOTP**: oferecido como etapa opcional e pulável logo após o primeiro login, e gerenciável no perfil depois. Fluxo completo de enrollment (QR code, confirmação de código de 6 dígitos, backup codes). A tela de auth não menciona 2FA.
- **Fotos nos banheiros**: fotos enviadas por usuários no detalhe, com estado vazio "sem fotos ainda". Uploads passam pela mesma moderação.
- **Cadastro de pin assistido por OSM**: ao escolher o local no mapa, sugerir nome e horários quando o ponto bate com um POI existente no OSM.
- **Recuperação de senha**: link "Esqueci minha senha" funcional (o protótipo só tem o affordance).

### Out of Scope

- **Ocupação em tempo real ou fila**: sem dado confiável para isso; risco de prometer o que não se sustenta.
- **Navegação turn-by-turn**: o app abre o app de mapas do sistema se precisar; não reimplementa rota.
- **Monetização** (anúncios, planos, parceria com estabelecimentos): decisão de negócio para depois de validar uso.
- **Moderação humana com painel admin**: a v1 usa moderação automática; painel de revisão manual fica para quando houver volume.
- **Terceiro idioma**: a estrutura fica pronta, mas só PT e EN entram na v1.

## Constraints

- **Plataforma alvo: Web/PWA** (decidido em ADR-0001). Mapa via MapLibre GL com tiles OSM, geolocalização do browser, instalável, sem app store na v1.
- **Dados de localização vêm do OpenStreetMap** (Overpass API ou extrato sincronizado). Isso implica atribuição obrigatória ao OSM e lidar com dados incompletos (horário ausente, nome genérico).
- **Moderação precisa ser automática e server-side**. A lista de palavras client-side do protótipo é placeholder; conteúdo só publica depois de aprovado por um serviço real de moderação de texto.
- **O design do handoff é referência direcional, não final**: fluxos, copy PT/EN e a estrutura do design system "Organic" valem como base, mas o visual passará por uma iteração v2 antes de ser tratado como fonte de verdade pixel-perfect. A v2 re-tematiza a paleta: verdes como cores principal e secundária, com contraste elegante entre elas, e laranja como accent.
- **Login com Google exige integração OAuth real** e conformidade com as diretrizes de marca do botão do Google.
- **LGPD**: contas com email, avaliações vinculadas a usuário e opção de anonimato exigem cuidado com dados pessoais desde a v1 (mínimo: exclusão de conta e anonimato efetivo nas avaliações).
- **Cobertura v1: Maceió**. O sync OSM cobre só essa região. Fora dela, o mapa mostra um aviso de "região ainda não coberta" em vez de vazio silencioso.
- **Termos de Uso e Política de Privacidade precisam existir antes do lançamento**: o checkbox do cadastro aponta para esses documentos.

## Success Metrics

Proposta inicial, a calibrar antes do lançamento: 4 semanas após lançar em Maceió, ter pelo menos 50 avaliações orgânicas (fora círculo pessoal) e 30% dos avaliadores voltando para uma segunda avaliação ou favorito. Atingir isso destrava a conversa de expansão de cobertura e monetização; não atingir pede investigação antes de investir mais.

## Acceptance Criteria

### Mapa e descoberta
- Dado que o usuário está logado com localização permitida, quando abre o app, então vê o mapa centrado na sua posição com pins de banheiros num raio útil.
- Dado localização ativa, quando o mapa renderiza, então a posição do usuário aparece como um círculo verde, visualmente distinto dos pins de banheiro.
- Dado o filtro "Público" ativo, quando o mapa renderiza, então só pins de banheiros públicos (grátis e pagos) aparecem.
- Dado um banheiro pago, quando seu pin renderiza, então exibe o badge de cifrão além da cor da categoria.
- Dado que o usuário nega a permissão de localização, quando abre o mapa, então vê o mapa numa região padrão com a busca por endereço funcional.
- Dado que o usuário está fora da área de cobertura, quando abre o mapa, então vê um aviso de que a região ainda não é coberta, sem mapa vazio silencioso.

### Detalhe e horário
- Dado um banheiro com horário 06:00 às 22:00, quando o usuário abre o detalhe às 23:00, então vê o pill "Fechado agora".
- Dado um banheiro sem horário no OSM, quando o detalhe abre, então a linha de horário mostra estado desconhecido em vez de inventar horário.
- Dado o bottom sheet aberto, quando o usuário arrasta para baixo além do limiar ou toca no backdrop ou no X, então o sheet fecha; soltar antes do limiar retorna o sheet à posição.
- Dado o detalhe aberto, quando o usuário reporta um problema, então vê confirmação de envio, o report entra na fila interna e o pin permanece visível até revisão.

### Avaliação e moderação
- Dado o compositor de avaliação, quando falta qualquer um dos 5 critérios ou o comentário está vazio, então o botão de publicar permanece desabilitado.
- Dado um comentário com linguagem ofensiva, quando a moderação o reprova, então a avaliação não publica e o usuário vê o motivo.
- Dado um usuário com visibilidade padrão "anônimo", quando abre o compositor, então "Manter anônimo" vem pré-selecionado e ele pode trocar só para aquela avaliação.
- Dada uma avaliação publicada, quando outro usuário abre o detalhe, então a nota geral reflete a média real de todas as avaliações, com 1 casa decimal na escala de 3.
- Dado um usuário que já avaliou o banheiro, quando toca em "Escrever avaliação", então o compositor abre preenchido com a avaliação existente e publicar a substitui, mantendo um voto por usuário na média.

### Favoritos e conta
- Dado um banheiro favoritado, quando o usuário troca de aparelho e loga na mesma conta, então o favorito persiste.
- Dado o cadastro, quando a senha tem menos de 6 caracteres ou difere da confirmação ou os termos não foram aceitos, então "Criar conta" permanece desabilitado.
- Dado o email raul@gmail.com no cadastro, quando o campo de username aparece, então vem pré-preenchido com um username disponível derivado do email ("raul", ou "raul1" se ocupado, e assim por diante), editável pelo usuário.
- Dado um username já em uso, quando o usuário tenta criar a conta com ele, então vê a indisponibilidade e pode aceitar a sugestão alternativa ou digitar outro.
- Dado o primeiro login após confirmar a conta, quando a sessão abre, então o usuário vê a etapa opcional de ativar a verificação em duas etapas, com opção clara de pular.
- Dado login com Google, quando o OAuth completa, então a conta usa o email do perfil Google sem pedir senha.
- Dado um cadastro por email ainda não confirmado, quando o usuário tenta logar, então o login é bloqueado com instrução para verificar a caixa de entrada e opção de reenviar o link.
- Dado um usuário que exclui a conta, quando a exclusão completa, então o login deixa de funcionar e suas avaliações publicadas passam a exibir "Usuário anônimo".

### Cadastro de pin
- Dado um usuário logado, quando submete um novo banheiro válido, então recebe confirmação de envio para moderação e o pin não aparece no mapa antes de aprovado.
- Dado um usuário deslogado, quando tenta acessar o FAB de adicionar, então é direcionado ao login.
