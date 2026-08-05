BEGIN;
SELECT plan(2);

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('60000000-0000-0000-0000-000000000025', 'newsignup@test.com', '{"username":"newsignup"}');

SELECT is(
  (SELECT username FROM profiles WHERE user_id = '60000000-0000-0000-0000-000000000025')::text,
  'newsignup',
  'inserting an auth.users row with a username in metadata creates a matching profile'
);

SELECT lives_ok(
  $$ INSERT INTO auth.users (id, email) VALUES ('70000000-0000-0000-0000-000000000026', 'nometa@test.com') $$,
  'inserting an auth.users row without username metadata does not error'
);

SELECT * FROM finish();
ROLLBACK;
