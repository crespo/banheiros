CREATE FUNCTION suggest_username(email text)
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  base text := split_part(email, '@', 1);
  candidate text := base;
  suffix int := 0;
BEGIN
  WHILE NOT is_username_available(candidate::citext) LOOP
    suffix := suffix + 1;
    candidate := base || suffix;
  END LOOP;
  RETURN candidate;
END;
$$;

GRANT EXECUTE ON FUNCTION suggest_username(text) TO anon, authenticated;
