BEGIN;
SELECT plan(2);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, status, accessibility, lighting, odor, maintenance, cleanliness)
  SELECT id, 'great place', 'approved', 3, 3, 3, 3, 3 FROM bathrooms LIMIT 1;

SELECT is(
  (SELECT overall FROM bathroom_scores WHERE bathroom_id = (SELECT id FROM bathrooms LIMIT 1)),
  3.0::numeric,
  'overall score averages an approved review ratings'
);

INSERT INTO reviews (bathroom_id, comment, status, accessibility, lighting, odor, maintenance, cleanliness)
  SELECT id, 'pending review', 'pending', 1, 1, 1, 1, 1 FROM bathrooms LIMIT 1;

SELECT is(
  (SELECT overall FROM bathroom_scores WHERE bathroom_id = (SELECT id FROM bathrooms LIMIT 1)),
  3.0::numeric,
  'pending reviews do not affect the score'
);

SELECT * FROM finish();
ROLLBACK;
