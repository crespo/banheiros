BEGIN;
SELECT plan(4);

INSERT INTO auth.users (id, email) VALUES ('fc000000-0000-0000-0000-000000000018', 'ownprofile@test.com');
INSERT INTO profiles (user_id, username) VALUES ('fc000000-0000-0000-0000-000000000018', 'ownprofile');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"fc000000-0000-0000-0000-000000000018"}', true);

SELECT ok(
  EXISTS(SELECT 1 FROM profiles WHERE user_id = 'fc000000-0000-0000-0000-000000000018'),
  'owner can select their own profile'
);

RESET ROLE;

INSERT INTO auth.users (id, email) VALUES ('0d000000-0000-0000-0000-000000000019', 'strangerprofile@test.com');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"0d000000-0000-0000-0000-000000000019"}', true);

SELECT ok(
  NOT EXISTS(SELECT 1 FROM profiles WHERE user_id = 'fc000000-0000-0000-0000-000000000018'),
  'a stranger cannot see another user''s profile'
);

SELECT lives_ok(
  $$ INSERT INTO profiles (user_id, username) VALUES ('0d000000-0000-0000-0000-000000000019', 'strangerprofile') $$,
  'owner can insert their own profile'
);

SELECT lives_ok(
  $$ UPDATE profiles SET default_show_username = true WHERE user_id = '0d000000-0000-0000-0000-000000000019' $$,
  'owner can update their own profile'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
