BEGIN;
SELECT plan(7);

INSERT INTO reviews (comment) VALUES ('ok');

SELECT isnt(
  (SELECT id FROM reviews LIMIT 1),
  NULL,
  'id auto-generates a uuid'
);

SELECT throws_ok(
  $$ INSERT INTO reviews (comment, accessibility) VALUES ('bad rating', 4) $$,
  '23514',
  NULL,
  'accessibility rating must be between 1 and 3'
);

SELECT throws_ok(
  $$ INSERT INTO reviews (accessibility) VALUES (2) $$,
  '23502',
  NULL,
  'comment is required'
);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, show_username)
  SELECT id, 'first review', false FROM bathrooms LIMIT 1;

SELECT results_eq(
  $$ SELECT show_username, status FROM reviews WHERE comment = 'first review' $$,
  $$ VALUES (false, 'pending'::text) $$,
  'review stores show_username and defaults status to pending'
);

INSERT INTO auth.users (id, email) VALUES ('c3000000-0000-0000-0000-000000000009', 'reviewer@test.com');
INSERT INTO reviews (bathroom_id, comment, user_id)
  SELECT id, 'anonymize me', 'c3000000-0000-0000-0000-000000000009' FROM bathrooms LIMIT 1;
DELETE FROM auth.users WHERE id = 'c3000000-0000-0000-0000-000000000009';

SELECT is(
  (SELECT user_id FROM reviews WHERE comment = 'anonymize me'),
  NULL::uuid,
  'review survives with user_id set to null when the reviewer account is deleted'
);

INSERT INTO auth.users (id, email) VALUES ('d4000000-0000-0000-0000-000000000010', 'oneperbathroom@test.com');
INSERT INTO reviews (bathroom_id, comment, user_id)
  SELECT id, 'first', 'd4000000-0000-0000-0000-000000000010' FROM bathrooms LIMIT 1;

SELECT throws_ok(
  $$ INSERT INTO reviews (bathroom_id, comment, user_id)
       SELECT id, 'second', 'd4000000-0000-0000-0000-000000000010' FROM bathrooms LIMIT 1 $$,
  '23505',
  NULL,
  'a user cannot review the same bathroom twice'
);

INSERT INTO reviews (comment) VALUES ('timestamped');

SELECT isnt(
  (SELECT created_at FROM reviews WHERE comment = 'timestamped'),
  NULL,
  'created_at defaults to the current time'
);

SELECT * FROM finish();
ROLLBACK;
