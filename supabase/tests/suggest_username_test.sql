BEGIN;
SELECT plan(2);

SELECT is(
  suggest_username('raul@gmail.com'),
  'raul',
  'suggest_username returns the email local-part when it is free'
);

INSERT INTO auth.users (id, email) VALUES ('50000000-0000-0000-0000-000000000024', 'taken2@test.com');
INSERT INTO profiles (user_id, username) VALUES ('50000000-0000-0000-0000-000000000024', 'raul');

SELECT is(
  suggest_username('raul@gmail.com'),
  'raul1',
  'suggest_username appends 1 when the base username is taken'
);

SELECT * FROM finish();
ROLLBACK;
