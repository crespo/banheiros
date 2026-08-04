BEGIN;
SELECT plan(1);

SELECT is(
  suggest_username('raul@gmail.com'),
  'raul',
  'suggest_username returns the email local-part when it is free'
);

SELECT * FROM finish();
ROLLBACK;
