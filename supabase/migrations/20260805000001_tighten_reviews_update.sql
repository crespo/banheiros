CREATE POLICY reviews_select_own ON reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY reviews_update_own ON reviews;

CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
