# Runbook de deploy — produção

Passo a passo manual para colocar o Banheiros no ar, conforme spec `docs/specs/0009-deploy-e-infraestrutura.md`.
Nada aqui é automatizado: são passos de console/CLI que quem faz o deploy executa uma vez (e de novo a cada mudança de schema/functions, no caso do lado Supabase).

## 1. Projeto Supabase de produção

1. Criar o projeto em [supabase.com](https://supabase.com) (região São Paulo, se disponível; senão a mais próxima).
2. Login local: `supabase login`, depois `supabase link --project-ref <ref-do-projeto>`.
3. Aplicar todas as migrations: `supabase db push`.
4. Deploy das 3 Edge Functions:
   ```
   supabase functions deploy delete-account
   supabase functions deploy moderate-submit
   supabase functions deploy osm-sync
   ```
5. Secret de moderação (única que precisa de setup manual — `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente):
   ```
   supabase secrets set PERSPECTIVE_API_KEY=<chave-de-produção>
   ```
6. Bucket de Storage: confirmar que já existe (conforme o time) e revisar as policies de acesso para fotos de perfil/avaliação (a feature de upload em si é da spec 0013 — aqui só a config do bucket).
7. Login com Google: no Google Cloud Console, atualizar (ou criar) as redirect URIs do OAuth client para apontar para o domínio de produção, não mais `localhost`. Configurar client id/secret em Supabase Auth → Providers → Google.
8. Templates de email (confirmação de cadastro, redefinição de senha): revisar em Supabase Auth → Email Templates. V1 usa o serviço nativo do Supabase, aceitando o rate limit padrão.

## 2. Agendar o osm-sync

A migration `supabase/migrations/20260810000001_enable_osm_sync_schedule.sql` habilita as extensions `pg_cron` e `pg_net` (aplicada junto com o `db push` do passo 1.3). O agendamento em si depende da URL da function já implantada e de uma chave válida — roda-se uma vez, manualmente, no SQL editor do projeto de produção:

```sql
-- 1. Guardar a chave anon no Vault (rodar uma vez):
select vault.create_secret('<anon-key-do-projeto>', 'osm_sync_anon_key');

-- 2. Agendar o job diário (ajustar o project-ref na URL):
select cron.schedule(
  'osm-sync-daily',
  '0 3 * * *', -- diário às 03:00 UTC; ajustar a cadência se a Overpass API reclamar de volume
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/osm-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'osm_sync_anon_key')
    )
  );
  $$
);
```

Confirmar que rodou: `select * from cron.job_run_details order by start_time desc limit 5;`

## 3. Frontend em produção (Vercel)

1. Importar o repositório no Vercel, branch `main` como produção.
2. Variáveis de ambiente (Production): `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apontando para o projeto criado no passo 1 — nunca para `127.0.0.1`.
3. Domínio próprio: adicionar em Vercel → Domains e configurar os registros DNS (A/CNAME) que o Vercel indicar no provedor de DNS do domínio. HTTPS é automático.
4. `vercel.json` (já no repo) faz o rewrite de qualquer rota para `index.html`, necessário para que `/termos`, `/privacidade` e o resto do app funcionem em refresh direto — Vercel detecta e aplica automaticamente no deploy.
5. Deploy automático: a integração nativa Vercel↔GitHub publica a cada merge em `main`, em paralelo ao `lint → test → build` do `ci.yml`. Nenhuma mudança de CI necessária.

## 4. Verificação pós-deploy

- [ ] Acessar o domínio de produção abre o app via HTTPS.
- [ ] Cadastro e login (email/senha e Google) funcionam contra o projeto de produção.
- [ ] Uma avaliação nova passa pela moderação real (Perspective API), não um stub.
- [ ] `select * from cron.job_run_details` mostra execuções do `osm-sync-daily`.
- [ ] App é instalável como PWA a partir do domínio de produção.
- [ ] O checkbox de cadastro linka para `/termos` e `/privacidade` reais (conteúdo ainda é placeholder — texto jurídico é decisão de negócio, fora do escopo desta spec).

## Fora deste runbook

Texto de Termos/Privacidade, SMTP customizado, observability, e automação de deploy do lado Supabase em CI — todos fora do escopo da spec 0009 (v1 aceita runbook manual).
