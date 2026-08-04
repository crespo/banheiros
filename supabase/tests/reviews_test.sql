BEGIN;
SELECT plan(2);

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

SELECT * FROM finish();
ROLLBACK;
