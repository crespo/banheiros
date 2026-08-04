GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT ON reviews TO authenticated;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_select_approved ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY reviews_insert_own ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (status = 'pending' AND user_id = auth.uid());
