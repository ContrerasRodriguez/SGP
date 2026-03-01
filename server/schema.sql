PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS facilitadoras (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  rut TEXT,
  correo TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  pin_hash TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marcas_horario (
  id TEXT PRIMARY KEY,
  facilitadora_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','salida')),
  timestamp TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'kiosco',
  FOREIGN KEY (facilitadora_id) REFERENCES facilitadoras(id)
);

CREATE INDEX IF NOT EXISTS idx_marcas_fac_fecha
ON marcas_horario (facilitadora_id, timestamp);
