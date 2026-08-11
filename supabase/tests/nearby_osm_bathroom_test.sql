BEGIN;
SELECT plan(4);

SELECT is(
  (SELECT count(*) FROM nearby_osm_bathroom(-9.66, -35.73)),
  0::bigint,
  'returns no rows when there is no bathroom nearby'
);

INSERT INTO bathrooms (source, kind, status, name, open_time, close_time, location, osm_id)
  VALUES ('osm', 'public', 'approved', 'Banheiro Praça', '06:00', '22:00', ST_SetSRID(ST_MakePoint(-35.73, -9.66), 4326)::geography, 1);

SELECT results_eq(
  $$ SELECT name, open_time, close_time FROM nearby_osm_bathroom(-9.6603, -35.7303) $$,
  $$ VALUES ('Banheiro Praça'::text, '06:00'::time, '22:00'::time) $$,
  'returns name and hours of an OSM bathroom within 50m'
);

INSERT INTO auth.users (id, email) VALUES ('c1000000-0000-0000-0000-000000000001', 'creator@test.com');
INSERT INTO bathrooms (source, kind, status, name, created_by, location)
  VALUES ('community', 'public', 'approved', 'Banheiro Comunidade', 'c1000000-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(-35.73, -9.66), 4326)::geography);

SELECT results_eq(
  $$ SELECT name, open_time, close_time FROM nearby_osm_bathroom(-9.6603, -35.7303) $$,
  $$ VALUES ('Banheiro Praça'::text, '06:00'::time, '22:00'::time) $$,
  'excludes source=community bathrooms even when close by'
);

INSERT INTO bathrooms (source, kind, status, location, osm_id)
  VALUES ('osm', 'public', 'approved', ST_SetSRID(ST_MakePoint(-35.7303, -9.6603), 4326)::geography, 2);

SELECT results_eq(
  $$ SELECT name, open_time, close_time FROM nearby_osm_bathroom(-9.6603, -35.7303) $$,
  $$ VALUES ('Banheiro Praça'::text, '06:00'::time, '22:00'::time) $$,
  'excludes OSM bathrooms with no name and no hours even when closer'
);

SELECT * FROM finish();
ROLLBACK;
