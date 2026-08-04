BEGIN;
SELECT plan(2);

INSERT INTO auth.users (id, email) VALUES ('40000000-0000-0000-0000-000000000023', 'taken@test.com');
INSERT INTO profiles (user_id, username) VALUES ('40000000-0000-0000-0000-000000000023', 'takenname');

SET LOCAL ROLE anon;

SELECT is(
  is_username_available('takenname'),
  false,
  'is_username_available returns false for a taken username'
);

SELECT is(
  is_username_available('freename'),
  true,
  'is_username_available returns true for an available username'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
