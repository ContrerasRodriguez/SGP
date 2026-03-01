CREATE TABLE IF NOT EXISTS pedagogia_repo (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT, -- facilitadora_id (opcional)
  note TEXT
);

INSERT OR IGNORE INTO pedagogia_repo (id, data_json, updated_at)
VALUES (1, '[]', datetime('now'));
