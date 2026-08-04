BEGIN;
SELECT plan(2);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');

SET LOCAL ROLE anon;

SELECT ok(
  EXISTS(SELECT 1 FROM bathrooms WHERE status = 'approved'),
  'anon can see an approved bathroom'
);

RESET ROLE;

INSERT INTO bathrooms (source, kind, status) VALUES ('community', 'public', 'pending');

SET LOCAL ROLE anon;

SELECT is(
  (SELECT count(*) FROM bathrooms WHERE status = 'pending'),
  0::bigint,
  'anon cannot see a pending bathroom'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
