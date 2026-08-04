CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username citext UNIQUE NOT NULL
    CHECK (char_length(username) BETWEEN 3 AND 30)
    CHECK (username::text ~ '^[a-z0-9._]+$'),
  default_show_username boolean default false,
  language text default 'pt'
);
