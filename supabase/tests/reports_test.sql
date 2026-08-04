BEGIN;
SELECT plan(3);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reports (bathroom_id)
  SELECT id FROM bathrooms LIMIT 1;

SELECT results_eq(
  $$ SELECT resolved, comment FROM reports LIMIT 1 $$,
  $$ VALUES (false, NULL::text) $$,
  'report defaults to unresolved with no comment'
);

SELECT throws_ok(
  $$ INSERT INTO reports (bathroom_id) VALUES (gen_random_uuid()) $$,
  '23503',
  NULL,
  'bathroom_id must reference an existing bathroom'
);

INSERT INTO auth.users (id, email) VALUES ('a7000000-0000-0000-0000-000000000013', 'reporter@test.com');
INSERT INTO reports (bathroom_id, user_id, comment)
  SELECT id, 'a7000000-0000-0000-0000-000000000013', 'stays after delete' FROM bathrooms LIMIT 1;
DELETE FROM auth.users WHERE id = 'a7000000-0000-0000-0000-000000000013';

SELECT is(
  (SELECT user_id FROM reports WHERE comment = 'stays after delete'),
  NULL::uuid,
  'report survives with user_id set to null when the reporter account is deleted'
);

SELECT * FROM finish();
ROLLBACK;
