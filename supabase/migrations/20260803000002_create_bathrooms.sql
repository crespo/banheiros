CREATE TABLE bathrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text CHECK (source IN ('osm', 'community')),
  kind text CHECK (kind IN ('public', 'instore')),
  status text CHECK (status IN ('approved', 'pending', 'rejected'))
);
