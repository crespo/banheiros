CREATE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'username' IS NOT NULL THEN
    INSERT INTO profiles (user_id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
