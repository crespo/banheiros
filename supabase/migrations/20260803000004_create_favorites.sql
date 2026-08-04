CREATE TABLE favorites (
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  bathroom_id uuid,
  PRIMARY KEY (user_id, bathroom_id)
);
