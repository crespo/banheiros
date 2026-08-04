GRANT SELECT ON bathrooms TO anon, authenticated;
GRANT INSERT ON bathrooms TO authenticated;

ALTER TABLE bathrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY bathrooms_select_approved ON bathrooms
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY bathrooms_select_own ON bathrooms
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY bathrooms_insert_community ON bathrooms
  FOR INSERT
  TO authenticated
  WITH CHECK (source = 'community' AND status = 'pending' AND created_by = auth.uid());
