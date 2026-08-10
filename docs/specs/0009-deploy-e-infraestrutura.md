# Spec 0009: Deploy e infraestrutura de produção

**Date:** 2026-08-10
**Status:** Ready
**Refs:** PRD 2026-08-02, ADR-0001 (PWA), ADR-0003 (Supabase), ADR-0004 (extrato OSM sincronizado), ADR-0005 (Perspective API)

## Objetivo

Tudo que existe hoje roda só local (Supabase CLI + Docker, `npm run dev`). Esta spec liga o app a serviços reais e o coloca no ar: projeto Supabase de produção com o schema e as 3 Edge Functions já existentes, frontend publicado no domínio próprio via Vercel, e o pipeline de deploy automático. Não entrega nenhuma feature nova de produto — é a spec que torna as specs 0001–0008 acessíveis fora da máquina de quem programou.

## Entregáveis

### Projeto Supabase de produção
- Criar o projeto Supabase hospedado (região mais próxima do público-alvo; se São Paulo estiver disponível na Supabase, preferir essa).
- Aplicar todas as migrations existentes (`supabase db push` ou equivalente) contra o projeto novo: schema completo de `bathrooms`, `profiles`, `favorites`, `reviews`, `bathroom_scores`, `reports`, políticas de RLS de cada uma (specs 0002–0008).
- Deploy das 3 Edge Functions existentes: `delete-account`, `moderate-submit`, `osm-sync`.
- Secrets das functions: `PERSPECTIVE_API_KEY` (usada por `moderate-submit`, ADR-0005) configurada via `supabase secrets set`. `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente pelo runtime do Supabase em produção — não precisam de setup manual.
- Agendar `osm-sync` como Edge Function agendada (conforme ADR-0004, "job periódico"), rodando com uma cadência que mantenha os dados razoavelmente atuais sem sobrecarregar a Overpass API — proposta inicial: 1x por dia.
- Configurar o bucket de Storage (já existe, segundo o time) com as policies de acesso corretas para as fotos de perfil/avaliação que specs futuras (0013) vão usar — nesta spec, só a criação/config do bucket, sem feature de upload.
- Login com Google no Supabase Auth: client id/secret do Google Cloud, redirect URIs apontando para o domínio de produção (não mais `localhost`).
- Templates de email do Supabase Auth (confirmação de cadastro, redefinição de senha) usando o serviço de email nativo do Supabase — decisão explícita para a v1, aceitando o rate limit padrão (poucos emails por hora) como limitação conhecida. Migrar para SMTP customizado fica para quando o volume de cadastro justificar.

### Frontend em produção (Vercel)
- Projeto Vercel ligado ao repositório GitHub, branch `main` como produção.
- Variáveis de ambiente de produção no Vercel: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apontando para o projeto Supabase criado acima (nunca para o local).
- Domínio próprio (já registrado) apontado para o Vercel via os registros DNS que o Vercel pedir (A/CNAME conforme o provedor de DNS do domínio).
- HTTPS automático (Vercel cobre isso nativamente).
- Confirmar que o manifest do PWA (`vite-plugin-pwa`, spec 0001) usa a URL de produção como `start_url`/`scope`, e que o app continua instalável a partir do domínio real.

### Pipeline de deploy
- Deploy automático: merge em `main` publica em produção. A integração nativa Vercel↔GitHub cobre isso sem precisar mexer no `ci.yml` — o workflow existente (`lint` → `test` → `build`) continua rodando no push; o deploy do Vercel roda em paralelo/depois, gerado pela própria integração.
- Deploy do lado Supabase (migrations novas, mudanças nas Edge Functions) fica como runbook manual nesta spec (`supabase db push`, `supabase functions deploy <nome>`) — automatizar isso em CI é trabalho futuro, não bloqueia o lançamento.

### Termos de Uso e Política de Privacidade
- O texto jurídico **não existe ainda** e não é escrito nesta spec (fora do escopo de engenharia). Esta spec reserva as rotas/páginas (`/termos`, `/privacidade` ou equivalente) e troca o texto estático do checkbox de cadastro (`auth.termsAgree`, hoje sem link nenhum) por um link real para essas páginas, mesmo que o conteúdo inicial seja um placeholder ("em breve") até o jurídico entregar o texto definitivo.
- Lançar publicamente com o placeholder no lugar do texto real é uma decisão de negócio, não de engenharia — a spec só garante que o link existe e não quebra.

## Critérios de aceitação

- Acessar o domínio de produção abre o app real, servido via HTTPS, sem depender de nada rodando na máquina de ninguém.
- Cadastro e login (email/senha e Google) funcionam contra o projeto Supabase de produção; o login com Google não faz mais round-trip para `localhost`.
- Nova avaliação enviada em produção passa pela moderação real via Perspective API (chave de produção configurada), não por um stub.
- `osm-sync` roda automaticamente na cadência configurada, sem precisar de invocação manual.
- Merge de um PR em `main` resulta no site de produção atualizado, sem passo manual do lado do frontend.
- O app é instalável como PWA a partir do domínio de produção.
- O checkbox de cadastro linka para páginas reais de Termos de Uso e Política de Privacidade (mesmo que o conteúdo ainda seja placeholder).

## Fora do escopo

- Escrever o texto de Termos de Uso e Política de Privacidade (jurídico, decisão de negócio).
- SMTP customizado / branding de email de produção: v1 aceita o serviço nativo do Supabase.
- Observability (Sentry, analytics, error tracking): não pedido pelo PRD, fica para quando houver necessidade concreta.
- Automatizar deploy de migrations/Edge Functions em CI: v1 usa runbook manual.
- Ícones finais de marca do PWA: seguem como placeholder, herdado da spec 0001, até a v2 de design entregar a marca final.
- Feature de upload de fotos: esta spec só prepara o bucket de Storage; a feature em si é a spec 0013.

## Dependências

- Conta Vercel e acesso ao domínio já registrado (DNS) para apontar os registros.
- Conta/projeto Supabase novo: nome do projeto, região, senha do banco de dados.
- Credenciais OAuth do Google (client id/secret) para o domínio de produção — se as credenciais existentes de dev (spec 0003) já cobrem isso, só precisa atualizar as redirect URIs; senão, criar novas no Google Cloud Console.
- Chave de produção da Perspective API (Google Cloud, API "Comment Analyzer") com quota adequada ao volume esperado.
- Specs 0001–0008 aplicadas (todo o schema, functions e telas que esta spec está publicando).
