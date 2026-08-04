BEGIN;
SELECT plan(1);

INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO reports (bathroom_id)
  SELECT id FROM bathrooms LIMIT 1;

SELECT results_eq(
  $$ SELECT resolved, comment FROM reports LIMIT 1 $$,
  $$ VALUES (false, NULL::text) $$,
  'report defaults to unresolved with no comment'
);

SELECT * FROM finish();
ROLLBACK;
