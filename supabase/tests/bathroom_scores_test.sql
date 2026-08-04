BEGIN;
SELECT plan(1);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, status, accessibility, lighting, odor, maintenance, cleanliness)
  SELECT id, 'great place', 'approved', 3, 3, 3, 3, 3 FROM bathrooms LIMIT 1;

SELECT is(
  (SELECT overall FROM bathroom_scores WHERE bathroom_id = (SELECT id FROM bathrooms LIMIT 1)),
  3.0::numeric,
  'overall score averages an approved review ratings'
);

SELECT * FROM finish();
ROLLBACK;
