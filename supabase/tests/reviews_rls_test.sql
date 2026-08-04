BEGIN;
SELECT plan(1);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, status)
  SELECT id, 'visible review', 'approved' FROM bathrooms LIMIT 1;

SET LOCAL ROLE anon;

SELECT ok(
  EXISTS(SELECT 1 FROM reviews WHERE comment = 'visible review'),
  'anon can see an approved review'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
