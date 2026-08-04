CREATE FUNCTION is_username_available(check_username citext)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM profiles WHERE username = check_username);
$$;

GRANT EXECUTE ON FUNCTION is_username_available(citext) TO anon, authenticated;
