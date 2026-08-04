BEGIN;
SELECT plan(1);

INSERT INTO auth.users (id, email) VALUES ('fc000000-0000-0000-0000-000000000018', 'ownprofile@test.com');
INSERT INTO profiles (user_id, username) VALUES ('fc000000-0000-0000-0000-000000000018', 'ownprofile');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"fc000000-0000-0000-0000-000000000018"}', true);

SELECT ok(
  EXISTS(SELECT 1 FROM profiles WHERE user_id = 'fc000000-0000-0000-0000-000000000018'),
  'owner can select their own profile'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
