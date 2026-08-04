BEGIN;
SELECT plan(1);

INSERT INTO bathrooms (source) VALUES ('osm');

SELECT isnt(
  (SELECT id FROM bathrooms LIMIT 1),
  NULL,
  'id auto-generates a uuid'
);

SELECT * FROM finish();
ROLLBACK;
