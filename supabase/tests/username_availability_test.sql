BEGIN;
SELECT plan(1);

INSERT INTO auth.users (id, email) VALUES ('40000000-0000-0000-0000-000000000023', 'taken@test.com');
INSERT INTO profiles (user_id, username) VALUES ('40000000-0000-0000-0000-000000000023', 'takenname');

SET LOCAL ROLE anon;

SELECT is(
  is_username_available('takenname'),
  false,
  'is_username_available returns false for a taken username'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
