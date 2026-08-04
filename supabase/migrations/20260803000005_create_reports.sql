CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id uuid,
  comment text,
  resolved boolean DEFAULT false
);
