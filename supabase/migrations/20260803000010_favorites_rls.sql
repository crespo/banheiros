GRANT SELECT, INSERT ON favorites TO authenticated;

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_select_own ON favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY favorites_insert_own ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
