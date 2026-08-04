BEGIN;
SELECT plan(6);

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

INSERT INTO auth.users (id, email) VALUES ('b8000000-0000-0000-0000-000000000014', 'owner@test.com');
INSERT INTO bathrooms (source, kind, status, created_by, name)
  VALUES ('community', 'public', 'pending', 'b8000000-0000-0000-0000-000000000014', 'Owner Pending Bathroom');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"b8000000-0000-0000-0000-000000000014"}', true);

SELECT ok(
  EXISTS(SELECT 1 FROM bathrooms WHERE name = 'Owner Pending Bathroom'),
  'owner can see their own pending bathroom'
);

RESET ROLE;

INSERT INTO auth.users (id, email) VALUES ('c9000000-0000-0000-0000-000000000015', 'stranger@test.com');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"c9000000-0000-0000-0000-000000000015"}', true);

SELECT ok(
  NOT EXISTS(SELECT 1 FROM bathrooms WHERE name = 'Owner Pending Bathroom'),
  'a stranger cannot see another user''s pending bathroom'
);

RESET ROLE;

INSERT INTO auth.users (id, email) VALUES ('da000000-0000-0000-0000-000000000016', 'inserter@test.com');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"da000000-0000-0000-0000-000000000016"}', true);

SELECT lives_ok(
  $$ INSERT INTO bathrooms (source, kind, status, created_by)
       VALUES ('community', 'public', 'pending', 'da000000-0000-0000-0000-000000000016') $$,
  'authenticated user can insert a community bathroom pending as themselves'
);

SELECT throws_ok(
  $$ INSERT INTO bathrooms (source, kind, status, created_by) VALUES ('osm', 'public', 'approved', 'da000000-0000-0000-0000-000000000016') $$,
  '42501',
  NULL,
  'authenticated user cannot insert a bathroom claiming osm source or approved status'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
