-- Enables the extensions osm-sync's production cron schedule depends on.
-- The actual cron.schedule() call needs the deployed function URL and an
-- auth key, which only exist per-environment (see docs/DEPLOY.md) — it is
-- run once by hand in the Supabase SQL editor after this migration lands.
create extension if not exists pg_cron;
create extension if not exists pg_net;
