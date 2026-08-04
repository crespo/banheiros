BEGIN;
SELECT plan(1);

INSERT INTO auth.users (id, email) VALUES ('30000000-0000-0000-0000-000000000022', 'reporter2@test.com');
INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"30000000-0000-0000-0000-000000000022"}', true);

SELECT lives_ok(
  $$ INSERT INTO reports (bathroom_id, user_id, comment)
       SELECT id, '30000000-0000-0000-0000-000000000022', 'broken sink' FROM bathrooms LIMIT 1 $$,
  'authenticated user can insert a report'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
