BEGIN;
SELECT plan(3);

INSERT INTO auth.users (id, email) VALUES ('a0000000-0000-0000-0000-000000000001', 'u@test.com');
INSERT INTO profiles (user_id, username) VALUES ('a0000000-0000-0000-0000-000000000001', 'testuser');

SELECT is(
  (SELECT default_show_username FROM profiles WHERE user_id = 'a0000000-0000-0000-0000-000000000001'),
  false,
  'default_show_username defaults to false'
);

SELECT throws_ok(
  $$ INSERT INTO profiles (user_id, username) VALUES ('b0000000-0000-0000-0000-000000000002', 'TestUser') $$,
  '23505',
  NULL,
  'username uniqueness is case-insensitive'
);

SELECT throws_ok(
  $$ INSERT INTO profiles (user_id, username) VALUES ('c0000000-0000-0000-0000-000000000003', 'ab') $$,
  '23514',
  NULL,
  'username shorter than 3 chars is rejected'
);

SELECT * FROM finish();
ROLLBACK;
