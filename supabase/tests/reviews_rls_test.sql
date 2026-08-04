BEGIN;
SELECT plan(4);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, status)
  SELECT id, 'visible review', 'approved' FROM bathrooms LIMIT 1;

SET LOCAL ROLE anon;

SELECT ok(
  EXISTS(SELECT 1 FROM reviews WHERE comment = 'visible review'),
  'anon can see an approved review'
);

RESET ROLE;

INSERT INTO reviews (bathroom_id, comment, status)
  SELECT id, 'hidden review', 'pending' FROM bathrooms LIMIT 1;

SET LOCAL ROLE anon;

SELECT ok(
  NOT EXISTS(SELECT 1 FROM reviews WHERE comment = 'hidden review'),
  'anon cannot see a pending review'
);

RESET ROLE;

INSERT INTO auth.users (id, email) VALUES ('eb000000-0000-0000-0000-000000000017', 'reviewer2@test.com');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eb000000-0000-0000-0000-000000000017"}', true);

SELECT lives_ok(
  $$ INSERT INTO reviews (bathroom_id, comment, status, user_id)
       SELECT id, 'my own review', 'pending', 'eb000000-0000-0000-0000-000000000017' FROM bathrooms LIMIT 1 $$,
  'authenticated user can insert their own pending review'
);

SELECT throws_ok(
  $$ INSERT INTO reviews (bathroom_id, comment, status, user_id)
       SELECT id, 'forged', 'approved', 'eb000000-0000-0000-0000-000000000017' FROM bathrooms LIMIT 1 $$,
  '42501',
  NULL,
  'authenticated user cannot insert a pre-approved review'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
