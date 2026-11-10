SELECT
  ip,
  path,
  first_seen_utc,
  last_seen_utc,
  visit_count
FROM visits
ORDER BY last_seen_utc DESC
LIMIT 100;
