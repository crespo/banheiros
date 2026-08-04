CREATE VIEW bathroom_scores AS
SELECT
  bathroom_id,
  avg((accessibility + lighting + odor + maintenance + cleanliness) / 5.0) AS overall,
  round(avg(accessibility), 1) AS accessibility
FROM reviews
WHERE status = 'approved'
GROUP BY bathroom_id;
