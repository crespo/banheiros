GRANT INSERT ON reports TO authenticated;

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY reports_insert_authenticated ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
