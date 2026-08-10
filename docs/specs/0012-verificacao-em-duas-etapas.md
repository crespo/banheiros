# Spec 0012: Verificação em duas etapas (2FA TOTP)

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0003 (Supabase), spec 0003 (auth e perfil, "fora do escopo: spec própria"), design v2 (`docs/design/js/TwoFaFlow.jsx`)

## Objetivo

Oferecer 2FA por TOTP como etapa opcional e pulável logo depois do primeiro login, com enrollment completo (QR code, confirmação por código de 6 dígitos), gerenciável depois no perfil. A tela de auth (login/cadastro) não menciona 2FA em nenhum momento — só aparece depois que a conta já existe. Usa o MFA nativo do Supabase Auth (`supabase.auth.mfa.*`), não um sistema próprio de TOTP.

## Entregáveis

### Oferta pós-primeiro-login
- Tela do design v2 (`TwoFaOffer`): aparece uma única vez, logo depois que `ChooseUsernameScreen` completa (`onCreated`) — esse é exatamente o momento de "primeiro login", sem precisar de uma coluna nova para rastrear isso. Dois botões: ativar (entra no enrollment) ou pular (segue direto pro app, chaves `twofa.enable`/`twofa.skip` já existem desde a spec 0001).
- Usuários que já passaram por essa tela antes (logins seguintes) nunca veem a oferta de novo.

### Enrollment
- Fluxo de duas telas do design v2 (`TwoFaEnroll`): QR code + chave manual, depois confirmação por código de 6 dígitos.
- `supabase.auth.mfa.enroll({ factorType: 'totp' })` gera o QR (URI `otpauth://`) e a chave manual reais — a v1 do design usa um QR mockado, aqui vira o QR de verdade, renderizado a partir da URI que o Supabase retorna.
- Confirmação: `supabase.auth.mfa.challenge()` + `.verify()` com o código de 6 dígitos digitado. Sucesso mostra `twofa.enabledToast` e segue pro app; falha mantém na tela com o campo de código limpo.

### Desafio no login (não coberto pelo design v2)
- O design v2 só cobre oferta + enrollment, nenhuma tela de "digite o código" no momento do login para quem já tem 2FA ativo. Esse passo é obrigatório pelo próprio Supabase Auth (sessão fica em `aal1` até passar no desafio de MFA) e precisa de uma tela nova: reaproveita o mesmo input de código de 6 dígitos do enrollment (`twofa.codeLabel`/`code-input`), chamando `challenge()` + `verify()` do fator já cadastrado em vez de criar um novo.
- Acontece entre "login bem-sucedido" e "app libera as abas" — mesmo ponto do fluxo onde hoje `App.tsx` decide entre `ChooseUsernameScreen`/telas principais.

### Gerenciar no perfil
- `ProfileScreen` ganha uma seção de segurança: mostra se 2FA está ativo (`supabase.auth.mfa.listFactors()`), botão para desativar (`unenroll()`, com confirmação explícita, mesmo padrão de "excluir conta") ou para ativar se o usuário pulou na oferta inicial (reusa o mesmo componente de enrollment).
- Chaves i18n novas necessárias (não existem no design v2, que só cobre oferta/enrollment): status ativo/inativo, botão desativar, confirmação de desativação. Seguir o namespace `twofa.*` já estabelecido.

## Critérios de aceitação

- Dado o primeiro login de uma conta nova, quando `ChooseUsernameScreen` completa, então a oferta de 2FA aparece antes do app principal.
- Dado um usuário que pula a oferta, quando loga de novo depois, então não vê a oferta outra vez (mas pode ativar pelo perfil).
- Dado o enrollment, quando o usuário escaneia o QR com um app autenticador real e digita o código de 6 dígitos correto, então a conta fica com 2FA ativo e confirmado.
- Dado um código de 6 dígitos errado no enrollment, quando o usuário confirma, então vê o erro e pode tentar de novo sem reiniciar o QR.
- Dado um usuário com 2FA ativo, quando faz login com email/senha ou Google, então precisa digitar o código de 6 dígitos antes de entrar no app.
- Dado um usuário com 2FA ativo, quando abre o perfil, então vê o status ativo e pode desativar com confirmação explícita.
- Dado qualquer tela de login ou cadastro, quando renderiza, então não menciona 2FA em nenhum texto (só a oferta pós-primeiro-login e o perfil tocam no assunto).

## Fora do escopo

- **Backup codes**: o PRD pede como parte do enrollment completo, mas o MFA nativo do Supabase Auth não tem códigos de backup de fábrica — implementar exigiria uma tabela própria (códigos hasheados, fluxo de geração/regeneração/consumo único), escopo maior que o resto desta spec. Decisão: lançar sem backup codes na v1 (perder acesso ao autenticador = contato com suporte para desativar manualmente via service role) e abrir spec própria se isso virar problema real de suporte.
- Múltiplos fatores TOTP por conta (trocar de aparelho sem perder acesso): Supabase permite múltiplos fatores, mas a v1 assume um fator por conta, alinhado ao design v2.
- SMS ou outros fatores além de TOTP: fora do escopo do PRD.

## Dependências

- Spec 0003 aplicada (fluxo de auth, `ChooseUsernameScreen`, `ProfileScreen`).
- MFA habilitado no projeto Supabase (configuração do lado do projeto, não código) — cobrir na spec 0009 (deploy) se ainda não estiver habilitado por padrão no projeto de produção.
