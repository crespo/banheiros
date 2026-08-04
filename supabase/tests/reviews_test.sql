BEGIN;
SELECT plan(4);

INSERT INTO reviews (comment) VALUES ('ok');

SELECT isnt(
  (SELECT id FROM reviews LIMIT 1),
  NULL,
  'id auto-generates a uuid'
);

SELECT throws_ok(
  $$ INSERT INTO reviews (comment, accessibility) VALUES ('bad rating', 4) $$,
  '23514',
  NULL,
  'accessibility rating must be between 1 and 3'
);

SELECT throws_ok(
  $$ INSERT INTO reviews (accessibility) VALUES (2) $$,
  '23502',
  NULL,
  'comment is required'
);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reviews (bathroom_id, comment, show_username)
  SELECT id, 'first review', false FROM bathrooms LIMIT 1;

SELECT results_eq(
  $$ SELECT show_username, status FROM reviews WHERE comment = 'first review' $$,
  $$ VALUES (false, 'pending'::text) $$,
  'review stores show_username and defaults status to pending'
);

SELECT * FROM finish();
ROLLBACK;
