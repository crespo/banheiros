BEGIN;
SELECT plan(3);

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

INSERT INTO bathrooms (source, kind, status, name) VALUES ('osm', 'public', 'approved', 'Score Test Bathroom');
INSERT INTO reviews (bathroom_id, comment, status, accessibility, lighting, odor, maintenance, cleanliness)
  SELECT id, 'r1', 'approved', 3, 1, 1, 1, 1 FROM bathrooms WHERE name = 'Score Test Bathroom';
INSERT INTO reviews (bathroom_id, comment, status, accessibility, lighting, odor, maintenance, cleanliness)
  SELECT id, 'r2', 'approved', 3, 1, 1, 1, 1 FROM bathrooms WHERE name = 'Score Test Bathroom';
INSERT INTO reviews (bathroom_id, comment, status, accessibility, lighting, odor, maintenance, cleanliness)
  SELECT id, 'r3', 'approved', 2, 1, 1, 1, 1 FROM bathrooms WHERE name = 'Score Test Bathroom';

SELECT is(
  (SELECT accessibility FROM bathroom_scores WHERE bathroom_id = (SELECT id FROM bathrooms WHERE name = 'Score Test Bathroom')),
  2.7::numeric,
  'per-category average rounds to 1 decimal'
);

SELECT * FROM finish();
ROLLBACK;
