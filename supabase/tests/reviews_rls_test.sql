BEGIN;
SELECT plan(9);

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

SELECT ok(
  EXISTS(SELECT 1 FROM reviews WHERE comment = 'my own review' AND user_id = 'eb000000-0000-0000-0000-000000000017'),
  'owner can see their own pending review'
);

SELECT lives_ok(
  $$ UPDATE reviews SET comment = 'edited by owner' WHERE user_id = 'eb000000-0000-0000-0000-000000000017' $$,
  'authenticated user can update their own review'
);

SELECT is(
  (SELECT comment FROM reviews WHERE user_id = 'eb000000-0000-0000-0000-000000000017'),
  'edited by owner',
  'the update actually changed the comment, not a silent no-op'
);

SELECT throws_ok(
  $$ UPDATE reviews SET status = 'approved' WHERE user_id = 'eb000000-0000-0000-0000-000000000017' $$,
  '42501',
  NULL,
  'authenticated user cannot self-approve their own review'
);

RESET ROLE;

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved') RETURNING id AS second_bathroom_id \gset
INSERT INTO reviews (bathroom_id, comment, status, user_id)
  VALUES (:'second_bathroom_id', 'already approved', 'approved', 'eb000000-0000-0000-0000-000000000017');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"eb000000-0000-0000-0000-000000000017"}', true);

SELECT throws_ok(
  $$ UPDATE reviews SET comment = 'sneaking an edit in' WHERE comment = 'already approved' $$,
  '42501',
  NULL,
  'editing an approved review without resetting status to pending is blocked'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
