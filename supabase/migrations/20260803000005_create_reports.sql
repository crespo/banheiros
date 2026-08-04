CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id uuid REFERENCES bathrooms (id),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  comment text,
  resolved boolean DEFAULT false
);
