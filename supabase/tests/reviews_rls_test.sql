BEGIN;
SELECT plan(2);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, status)
  SELECT id, 'visible review', 'approved' FROM bathrooms LIMIT 1;

SET LOCAL ROLE anon;

SELECT ok(
  EXISTS(SELECT 1 FROM reviews WHERE comment = 'visible review'),
  'anon can see an approved review'
);

RESET ROLE;

INSERT INTO reviews (bathroom_id, comment, status)
  SELECT id, 'hidden review', 'pending' FROM bathrooms LIMIT 1;

SET LOCAL ROLE anon;

SELECT ok(
  NOT EXISTS(SELECT 1 FROM reviews WHERE comment = 'hidden review'),
  'anon cannot see a pending review'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
