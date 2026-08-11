ALTER TABLE bathrooms
  ADD COLUMN lat double precision GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED,
  ADD COLUMN lon double precision GENERATED ALWAYS AS (ST_X(location::geometry)) STORED;
