# Spec 0014: Continuidade do fluxo de usuário

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-02, spec 0003 (`AuthScreen`, `ProfileScreen`), spec 0009 (rotas `/termos`/`/privacidade`, `react-router-dom`), spec 0011 (achado registrado sobre `ProfileScreen.changeLanguage`)

## Objetivo

As specs 0001-0009 entregaram cada tela funcionando isoladamente (auth, mapa, detalhe, avaliação, favoritos, perfil), mas o app tem três pontas soltas que quebram a sensação de fluxo contínuo — nenhuma delas depende de feature nova ainda não construída (0010 cadastro de pin, 0011 idioma antes do login, 0012 2FA, 0013 fotos): a recuperação de senha não tem saída, a troca de idioma no perfil não se reflete na tela, e não há como reabrir termos/privacidade depois de logado. Esta spec não adiciona telas novas nem antecipa escopo de outra spec — só liga o que já existe, para que dê pra percorrer o app inteiro (login → mapa → avaliar → favoritar → perfil → esqueci minha senha → volta ao app) sem travar em nenhum ponto. É o "esqueleto" do fluxo: cada trecho já construído puxa o próximo.

## Entregáveis

### Recuperação de senha, fim a fim
- `AuthScreen.forgotPassword` hoje dispara `resetPasswordForEmail` e não mostra nada. Adicionar mensagem de confirmação ("verifique seu e-mail") depois do disparo, chave i18n nova se não houver uma parecida em `auth.*`.
- `ResetPasswordScreen` hoje chama `supabase.auth.updateUser({ password })` sem `.then`/`.catch`, sem mensagem de sucesso ou erro e sem jeito de sair da tela. `Gated` (`App.tsx`) seta `passwordRecovery = true` no evento `PASSWORD_RECOVERY` do Supabase e nunca volta a `false` — hoje o usuário fica preso ali mesmo quando a troca de senha funciona.
- Adicionar callback `onComplete`: `App.tsx` passa `() => setPasswordRecovery(false)` para `ResetPasswordScreen`, que chama isso depois de mostrar uma mensagem de sucesso (mesmo padrão de banner já usado em `BathroomDetailSheet`/`ReviewComposer`). A sessão já está ativa nesse ponto (o evento `PASSWORD_RECOVERY` mantém o login), então voltar `passwordRecovery` a `false` leva direto para as abas do app, sem exigir novo login.
- Erro do `updateUser` (ex.: senha rejeitada pelo Supabase) mostra mensagem de erro em vez de falhar em silêncio.

### Idioma no perfil reflete na hora
- `ProfileScreen.changeLanguage` chama `setLanguage(lang)` e grava no banco, mas nunca atualiza o `profile` local — o rádio não muda visualmente e nenhum texto da tela re-renderiza no idioma novo (achado já registrado na spec 0011; aqui vira o fix).
- Fix: `changeLanguage` também atualiza o estado local (`setProfile(prev => prev ? { ...prev, language: lang } : prev)`) no mesmo clique que chama `setLanguage`, mesma técnica de estado local que a spec 0011 vai aplicar no `AuthScreen`.

### Termos e privacidade acessíveis depois do login
- `ProfileScreen` não tem nenhum link para `/termos`/`/privacidade` — hoje só existe o link no checkbox de cadastro (`AuthScreen`). Adicionar os dois links no rodapé do `ProfileScreen` (as rotas já existem via spec 0009).
- No checkbox de cadastro do `AuthScreen`, os links de termos/privacidade navegam na mesma aba e derrubam o formulário em andamento (usuário perde nome/senha digitados ao voltar). Trocar para `target="_blank" rel="noopener noreferrer"` — abre em nova aba, cadastro continua intacto na aba original.

## Critérios de aceitação

### Recuperação de senha
- Dado um usuário na tela de login, quando toca em "esqueci minha senha", então vê confirmação de que um e-mail foi enviado.
- Dado um usuário que abre o link de recuperação recebido por e-mail e define uma nova senha válida, quando confirma, então vê mensagem de sucesso e é levado para dentro do app (abas), sem precisar logar de novo.
- Dado um usuário que tenta definir uma senha rejeitada pelo Supabase, quando confirma, então vê uma mensagem de erro clara em vez de a tela não reagir.

### Idioma no perfil
- Dado um usuário no `ProfileScreen` em português, quando toca no rádio de inglês, então o rádio marca inglês e todo texto da tela muda para inglês imediatamente, sem reload.
- Dado o idioma trocado no perfil, quando o usuário sai e entra de novo, então o app abre no idioma escolhido (persistência já existente, sem mudança de comportamento).

### Termos e privacidade
- Dado um usuário logado no `ProfileScreen`, quando quer reler os termos ou a política de privacidade, então encontra os links na própria tela, sem precisar digitar a URL.
- Dado um usuário preenchendo o cadastro, quando toca no link de termos ou privacidade, então uma nova aba abre com o documento e a aba de cadastro mantém os dados já digitados.

## Fora do escopo

- FAB de cadastro de pin e `AddPinModal`: spec 0010, que já tem "Ligar o FAB" como entregável próprio.
- Botão de idioma no `AuthScreen` (antes do login): spec 0011.
- 2FA (oferta, enrollment, gerenciamento): spec 0012.
- Fotos no detalhe do banheiro: spec 0013.
- Deep linking para um banheiro específico via URL, persistência de aba selecionada entre sessões, sistema de toast global reutilizável: nenhum pedido concreto do PRD hoje, fica para quando houver necessidade.
- Tratamento de erro do login via Google (OAuth): nenhum caso relatado até agora.

## Dependências

- Spec 0003 aplicada (`AuthScreen`, `ProfileScreen`, fluxo de auth via Supabase).
- Spec 0009 aplicada (rotas `/termos`/`/privacidade`, `react-router-dom` em `App.tsx`) — necessária só para o item de links no `ProfileScreen`; os itens de recuperação de senha e idioma no perfil não dependem dela.
