GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
