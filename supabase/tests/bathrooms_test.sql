BEGIN;
SELECT plan(2);

INSERT INTO bathrooms (source) VALUES ('osm');

SELECT isnt(
  (SELECT id FROM bathrooms LIMIT 1),
  NULL,
  'id auto-generates a uuid'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source) VALUES ('bogus') $$,
  '23514',
  NULL,
  'source must be osm or community'
);

SELECT * FROM finish();
ROLLBACK;
