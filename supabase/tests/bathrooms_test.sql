BEGIN;
SELECT plan(9);

INSERT INTO bathrooms (source) VALUES ('osm');

SELECT isnt(
  (SELECT id FROM bathrooms LIMIT 1),
  NULL,
  'id auto-generates a uuid'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source) VALUES ('bogus') $$,
  '23514',
  NULL,
  'source must be osm or community'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind) VALUES ('osm', 'bogus') $$,
  '23514',
  NULL,
  'kind must be public or instore'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'bogus') $$,
  '23514',
  NULL,
  'status must be approved, pending, or rejected'
);

INSERT INTO bathrooms (source, kind, status, location)
  VALUES ('osm', 'public', 'approved', ST_SetSRID(ST_MakePoint(-35.73, -9.66), 4326)::geography);

SELECT is(
  ST_AsText((SELECT location::geometry FROM bathrooms WHERE kind = 'public' AND status = 'approved')),
  'POINT(-35.73 -9.66)',
  'location stores coordinates as a geography point'
);

INSERT INTO bathrooms (source, kind, status, paid, name, address, open_time, close_time, osm_tags, osm_seen_at, osm_id)
  VALUES ('osm', 'public', 'approved', true, 'Banheiro Central', 'Praca X', '06:00', '22:00', '{"fee":"yes"}'::jsonb, '2026-01-01T00:00:00Z', 123);

SELECT results_eq(
  $$ SELECT paid, name, address, open_time, close_time, osm_tags, osm_seen_at, osm_id FROM bathrooms WHERE osm_id = 123 $$,
  $$ VALUES (true, 'Banheiro Central'::text, 'Praca X'::text, '06:00'::time, '22:00'::time, '{"fee":"yes"}'::jsonb, '2026-01-01T00:00:00Z'::timestamptz, 123::bigint) $$,
  'bathroom stores paid, name, address, hours, osm_tags, osm_seen_at, and osm_id'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind, status, osm_id) VALUES ('osm', 'public', 'approved', 123) $$,
  '23505',
  NULL,
  'osm_id is unique'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind, status, osm_id) VALUES ('community', 'public', 'pending', 999) $$,
  '23514',
  NULL,
  'community bathrooms cannot have an osm_id'
);

INSERT INTO auth.users (id, email) VALUES ('b2000000-0000-0000-0000-000000000008', 'creator@test.com');
INSERT INTO bathrooms (source, kind, status, created_by, name)
  VALUES ('community', 'public', 'pending', 'b2000000-0000-0000-0000-000000000008', 'Creator Bathroom');
DELETE FROM auth.users WHERE id = 'b2000000-0000-0000-0000-000000000008';

SELECT is(
  (SELECT created_by FROM bathrooms WHERE name = 'Creator Bathroom'),
  NULL::uuid,
  'created_by is set to null when the creator account is deleted'
);

SELECT * FROM finish();
ROLLBACK;
