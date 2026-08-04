BEGIN;
SELECT plan(2);

INSERT INTO auth.users (id, email) VALUES ('1e000000-0000-0000-0000-000000000020', 'favowner@test.com');
INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO favorites (user_id, bathroom_id)
  SELECT '1e000000-0000-0000-0000-000000000020', id FROM bathrooms LIMIT 1;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"1e000000-0000-0000-0000-000000000020"}', true);

SELECT ok(
  EXISTS(SELECT 1 FROM favorites WHERE user_id = '1e000000-0000-0000-0000-000000000020'),
  'owner can select their own favorite'
);

RESET ROLE;

INSERT INTO auth.users (id, email) VALUES ('2f000000-0000-0000-0000-000000000021', 'favstranger@test.com');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"2f000000-0000-0000-0000-000000000021"}', true);

SELECT ok(
  NOT EXISTS(SELECT 1 FROM favorites WHERE user_id = '1e000000-0000-0000-0000-000000000020'),
  'a stranger cannot see another user''s favorite'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
