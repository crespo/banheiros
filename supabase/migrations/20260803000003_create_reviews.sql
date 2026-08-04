CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment text NOT NULL,
  accessibility smallint CHECK (accessibility BETWEEN 1 AND 3),
  lighting smallint CHECK (lighting BETWEEN 1 AND 3),
  odor smallint CHECK (odor BETWEEN 1 AND 3),
  maintenance smallint CHECK (maintenance BETWEEN 1 AND 3),
  cleanliness smallint CHECK (cleanliness BETWEEN 1 AND 3)
);
