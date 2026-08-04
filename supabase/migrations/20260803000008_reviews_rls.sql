GRANT SELECT ON reviews TO anon, authenticated;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_select_approved ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');
