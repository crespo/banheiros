CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE profiles (
  user_id uuid,
  username citext UNIQUE CHECK (char_length(username) >= 3),
  default_show_username boolean default false
);
