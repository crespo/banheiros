CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE bathrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text CHECK (source IN ('osm', 'community')),
  kind text CHECK (kind IN ('public', 'instore')),
  status text CHECK (status IN ('approved', 'pending', 'rejected')),
  location geography(Point, 4326),
  paid boolean,
  name text,
  address text,
  open_time time,
  close_time time,
  osm_tags jsonb,
  osm_seen_at timestamptz,
  osm_id bigint UNIQUE,
  CHECK (source != 'community' OR osm_id IS NULL)
);
