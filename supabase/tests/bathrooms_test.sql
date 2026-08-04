BEGIN;
SELECT plan(5);

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

INSERT INTO bathrooms (source, kind, status, location)
  VALUES ('osm', 'public', 'approved', ST_SetSRID(ST_MakePoint(-35.73, -9.66), 4326)::geography);

SELECT is(
  ST_AsText((SELECT location::geometry FROM bathrooms WHERE kind = 'public' AND status = 'approved')),
  'POINT(-35.73 -9.66)',
  'location stores coordinates as a geography point'
);

SELECT * FROM finish();
ROLLBACK;
