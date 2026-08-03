# Spec 0003: Auth e perfil

**Date:** 2026-08-03
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0003 (Supabase), design v2 (`docs/design/js/AuthScreen.jsx`, `ProfileScreen.jsx`)

## Objetivo

Contas reais via Supabase Auth: cadastro e login com email/senha (confirmação de email obrigatória) e com Google, username obrigatório e único com sugestão derivada do email, recuperação de senha, e a tela de Perfil com idioma, visibilidade padrão e exclusão de conta. O cliente supabase-js nasce aqui e vira a fronteira de dados do app.

## Entregáveis

### Cliente Supabase
- `src/lib/supabase.ts`: cliente único, URL e anon key via env do Vite. Nenhum outro módulo instancia cliente.

### Cadastro e login (email/senha)
- Telas de auth do design v2: login e cadastro com os estados e a copy do handoff, chaves i18n já migradas na 0001.
- Cadastro: email → username → senha → confirmar senha → aceite dos termos. "Criar conta" desabilitado enquanto senha < 6, confirmação difere ou termos não aceitos (PRD).
- Username: pré-preenchido com sugestão derivada do email ("raul", senão "raul1", ...), sempre editável. Disponibilidade via a function `security definer` da 0002; a iteração da sugestão é client-side sobre ela. Regras de formato (3–30, `[a-z0-9._]`) validadas no campo com mensagem, além do constraint no banco.
- Confirmação de email obrigatória: login antes de confirmar é bloqueado com instrução e botão de reenviar o link (fluxo nativo do Supabase Auth).
- "Esqueci minha senha": envia o link de reset e a tela de redefinição funciona (o protótipo só tem o affordance).

### Login com Google
- OAuth via Supabase Auth, botão conforme diretrizes de marca do Google. Conta criada pelo Google cai no mesmo passo de username (sugestão a partir do email do perfil) antes de entrar no app.

### Perfil
- Tela do design v2: avatar com inicial do username, linha @username + email, troca de idioma, toggle de visibilidade padrão do username em avaliações (`default_show_username`), logout, excluir conta.
- Idioma passa a persistir em `profiles.language`; localStorage permanece só como cache pré-login (comportamento da 0001 intacto antes de logar).
- Excluir conta: Edge Function `delete-account` (service role) autenticada que remove o auth user. O schema da 0002 garante o efeito LGPD: profile e favoritos somem em cascade, reviews ficam com `user_id` null e exibem "Usuário anônimo". Confirmação explícita na UI antes de executar.

### Sessão e navegação
- App abre na auth quando deslogado; sessão persistida e restaurada no reload. Rotas internas (mapa, favoritos, perfil) exigem sessão.

## Critérios de aceitação

- Cadastro com raul@gmail.com sugere username disponível derivado ("raul", ou "raul1" se ocupado), editável; username em uso mostra indisponibilidade e alternativa.
- Cadastro sem confirmar email: login bloqueado com aviso e reenvio de link; após confirmar, login entra.
- Login com Google completa sem pedir senha e passa pelo passo de username na primeira vez.
- "Esqueci minha senha" redefine a senha e o login novo funciona.
- Trocar idioma no perfil persiste na conta: logar em outro aparelho carrega o idioma salvo.
- Excluir conta: login deixa de funcionar, reviews publicadas passam a "Usuário anônimo", favoritos e profile somem.
- Reload mantém a sessão; logout volta pra auth.

## Fora do escopo

- 2FA TOTP e a tela de oferta pós-primeiro-login (spec própria; a tela já existe no design v2).
- Qualquer tela além de auth e perfil (mapa, favoritos: specs próprias).
- Painel de admin, roles.

## Dependências

- Spec 0002 aplicada (tabela `profiles`, function de disponibilidade de username).
- Supabase CLI + Docker local; emails de confirmação testados no Mailpit do CLI.
- Credenciais OAuth do Google (client id/secret) configuradas no Supabase; em dev, fluxo verificado manualmente.
