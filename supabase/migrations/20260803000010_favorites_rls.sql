GRANT SELECT ON favorites TO authenticated;

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_select_own ON favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
