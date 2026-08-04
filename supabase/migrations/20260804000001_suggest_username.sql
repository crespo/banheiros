CREATE FUNCTION suggest_username(email text)
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT split_part(email, '@', 1);
$$;

GRANT EXECUTE ON FUNCTION suggest_username(text) TO anon, authenticated;
