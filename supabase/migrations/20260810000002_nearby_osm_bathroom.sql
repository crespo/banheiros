CREATE FUNCTION nearby_osm_bathroom(in_lat double precision, in_lon double precision)
RETURNS TABLE (name text, open_time time, close_time time)
LANGUAGE sql
STABLE
AS $$
  SELECT name, open_time, close_time
  FROM bathrooms
  WHERE source = 'osm'
    AND (name IS NOT NULL OR open_time IS NOT NULL OR close_time IS NOT NULL)
    AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(in_lon, in_lat), 4326)::geography, 50)
  ORDER BY location <-> ST_SetSRID(ST_MakePoint(in_lon, in_lat), 4326)::geography
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION nearby_osm_bathroom(double precision, double precision) TO authenticated;
