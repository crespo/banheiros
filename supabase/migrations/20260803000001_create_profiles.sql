CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE profiles (
  user_id uuid,
  username citext UNIQUE,
  default_show_username boolean default false
);
