BEGIN;
SELECT plan(4);

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

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind) VALUES ('osm', 'bogus') $$,
  '23514',
  NULL,
  'kind must be public or instore'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'bogus') $$,
  '23514',
  NULL,
  'status must be approved, pending, or rejected'
);

SELECT * FROM finish();
ROLLBACK;
