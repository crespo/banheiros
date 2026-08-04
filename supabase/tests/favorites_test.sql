BEGIN;
SELECT plan(2);

INSERT INTO auth.users (id, email) VALUES ('e5000000-0000-0000-0000-000000000011', 'fav@test.com');
INSERT INTO bathrooms (source, kind, status) VALUES ('osm', 'public', 'approved');
INSERT INTO favorites (user_id, bathroom_id)
  SELECT 'e5000000-0000-0000-0000-000000000011', id FROM bathrooms LIMIT 1;

SELECT throws_ok(
  $$ INSERT INTO favorites (user_id, bathroom_id)
       SELECT 'e5000000-0000-0000-0000-000000000011', id FROM bathrooms LIMIT 1 $$,
  '23505',
  NULL,
  'a user cannot favorite the same bathroom twice'
);

DELETE FROM auth.users WHERE id = 'e5000000-0000-0000-0000-000000000011';

SELECT is(
  (SELECT count(*) FROM favorites WHERE user_id = 'e5000000-0000-0000-0000-000000000011'),
  0::bigint,
  'favorite is deleted when the user is deleted'
);

SELECT * FROM finish();
ROLLBACK;
