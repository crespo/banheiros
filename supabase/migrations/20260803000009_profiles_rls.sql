GRANT SELECT ON profiles TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
