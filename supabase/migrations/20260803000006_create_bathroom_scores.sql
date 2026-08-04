CREATE VIEW bathroom_scores AS
SELECT
  bathroom_id,
  round(avg((accessibility + lighting + odor + maintenance + cleanliness) / 5.0), 1) AS overall,
  round(avg(accessibility), 1) AS accessibility,
  round(avg(lighting), 1) AS lighting,
  round(avg(odor), 1) AS odor,
  round(avg(maintenance), 1) AS maintenance,
  round(avg(cleanliness), 1) AS cleanliness
FROM reviews
WHERE status = 'approved'
GROUP BY bathroom_id;
