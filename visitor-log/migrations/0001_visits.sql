CREATE TABLE IF NOT EXISTS visits (
  ip TEXT NOT NULL,
  path TEXT NOT NULL,
  minute_utc TEXT NOT NULL,
  first_seen_utc TEXT NOT NULL,
  last_seen_utc TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1 CHECK (visit_count > 0),
  PRIMARY KEY (ip, path, minute_utc)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS visits_last_seen_utc ON visits (last_seen_utc);
