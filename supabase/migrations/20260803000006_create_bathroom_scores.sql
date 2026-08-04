CREATE VIEW bathroom_scores AS
SELECT
  bathroom_id,
  avg((accessibility + lighting + odor + maintenance + cleanliness) / 5.0) AS overall
FROM reviews
GROUP BY bathroom_id;
