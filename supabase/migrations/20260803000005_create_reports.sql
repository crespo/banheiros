CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bathroom_id uuid REFERENCES bathrooms (id),
  comment text,
  resolved boolean DEFAULT false
);
