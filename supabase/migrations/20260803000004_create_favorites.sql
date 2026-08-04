CREATE TABLE favorites (
  user_id uuid,
  bathroom_id uuid,
  PRIMARY KEY (user_id, bathroom_id)
);
