BEGIN;
SELECT plan(1);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');

SET LOCAL ROLE anon;

SELECT ok(
  EXISTS(SELECT 1 FROM bathrooms WHERE status = 'approved'),
  'anon can see an approved bathroom'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
