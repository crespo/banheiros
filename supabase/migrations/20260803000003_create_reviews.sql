CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment text NOT NULL,
  accessibility smallint CHECK (accessibility BETWEEN 1 AND 3),
  lighting smallint CHECK (lighting BETWEEN 1 AND 3),
  odor smallint CHECK (odor BETWEEN 1 AND 3),
  maintenance smallint CHECK (maintenance BETWEEN 1 AND 3),
  cleanliness smallint CHECK (cleanliness BETWEEN 1 AND 3),
  bathroom_id uuid REFERENCES bathrooms (id),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  show_username boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
  UNIQUE (bathroom_id, user_id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
