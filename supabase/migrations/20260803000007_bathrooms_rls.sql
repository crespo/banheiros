GRANT SELECT ON bathrooms TO anon, authenticated;

ALTER TABLE bathrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY bathrooms_select_approved ON bathrooms
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY bathrooms_select_own ON bathrooms
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());
