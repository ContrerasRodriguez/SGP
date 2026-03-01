import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, initDb } from "./db.js";
initDb();

const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CORS_ORIGIN }));

const PORT = Number(process.env.PORT || 3000);

// Helpers
function uid() {
  return crypto.randomUUID();
}

function toLocalDateKey(date = new Date()) {
  // YYYY-MM-DD en horario local del PC (importante para “hoy”)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generatePin4() {
  // 1000-9999 => menos “adivinable” que 0000-9999
  return String(Math.floor(1000 + Math.random() * 9000));
}

const FacilitadoraCreateSchema = z.object({
  nombre: z.string().min(2),
  cargo: z.string().min(2),
  rut: z.string().optional().nullable(),
  correo: z.string().email().optional().nullable()
});

const FacilitadoraPatchSchema = z.object({
  nombre: z.string().min(2).optional(),
  cargo: z.string().min(2).optional(),
  rut: z.string().optional().nullable(),
  correo: z.string().email().optional().nullable(),
  activo: z.boolean().optional()
});



const KioscoMarkSchema = z.object({
  pin: z.string().regex(/^\d{4}$/)
});

const LeadCreateSchema = z.object({
  origen: z.string().optional().default("wordpress"),
  nombre_contacto: z.string().min(2),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  mensaje: z.string().optional().nullable(),
  preferencias: z.any().optional().nullable(), // lo guardamos como JSON string
});

const LeadPatchSchema = z.object({
  status: z.enum(["nuevo", "contactado", "visita_agendada", "inscrito", "descartado"]).optional(),
  nombre_contacto: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  mensaje: z.string().optional().nullable(),
  preferencias: z.any().optional().nullable(),
});

const ApoderadoCreateSchema = z.object({
  nombre: z.string().min(2),
  rut: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
});

const NinoCreateSchema = z.object({
  apoderado_id: z.string().min(5),
  nombre: z.string().min(2),
  fecha_nacimiento: z.string().optional().nullable(), // YYYY-MM-DD
  nivel: z.string().optional().nullable(),
  alergias: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
});

// --- Endpoints ---
import { z } from "zod";

const RepoPutSchema = z.object({
  data: z.array(z.any()),
  updated_by: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

app.get("/pedagogia/repo", (req, res) => {
  const row = db.prepare(`SELECT data_json, updated_at, updated_by, note FROM pedagogia_repo WHERE id=1`).get();
  const data = row ? JSON.parse(row.data_json) : [];
  res.json({ ok: true, data, meta: row ? { updated_at: row.updated_at, updated_by: row.updated_by, note: row.note } : null });
});

app.put("/pedagogia/repo", (req, res) => {
  const parsed = RepoPutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE pedagogia_repo
    SET data_json = ?, updated_at = ?, updated_by = ?, note = ?
    WHERE id=1
  `).run(JSON.stringify(parsed.data.data), now, parsed.data.updated_by || null, parsed.data.note || null);

  res.json({ ok: true, updated_at: now });
});

// GET marcas (historial)
// /marcas?from=2026-03-01&to=2026-03-31&facilitadora_id=...
app.get("/marcas", (req, res) => {
  const from = String(req.query.from || "");
  const to = String(req.query.to || "");
  const facilitadoraId = String(req.query.facilitadora_id || "");

  // Si no mandan fechas, por defecto: hoy
  const hoyKey = toLocalDateKey(new Date());
  const fromKey = from || hoyKey;
  const toKey = to || hoyKey;

  const start = `${fromKey}T00:00:00.000`;
  const end = `${toKey}T23:59:59.999`;

  let rows;
  if (facilitadoraId) {
    rows = db.prepare(`
      SELECT m.id, m.tipo, m.timestamp, m.source,
             f.id as facilitadora_id, f.nombre, f.rut, f.cargo, f.correo
      FROM marcas_horario m
      JOIN facilitadoras f ON f.id = m.facilitadora_id
      WHERE m.timestamp >= ? AND m.timestamp <= ?
        AND f.id = ?
      ORDER BY m.timestamp DESC
    `).all(start, end, facilitadoraId);
  } else {
    rows = db.prepare(`
      SELECT m.id, m.tipo, m.timestamp, m.source,
             f.id as facilitadora_id, f.nombre, f.rut, f.cargo, f.correo
      FROM marcas_horario m
      JOIN facilitadoras f ON f.id = m.facilitadora_id
      WHERE m.timestamp >= ? AND m.timestamp <= ?
      ORDER BY m.timestamp DESC
    `).all(start, end);
  }

  res.json(rows);
});

// GET marcas (historial)
// /marcas?from=2026-03-01&to=2026-03-31&facilitadora_id=...
app.get("/marcas", (req, res) => {
  const from = String(req.query.from || "");
  const to = String(req.query.to || "");
  const facilitadoraId = String(req.query.facilitadora_id || "");

  // Si no mandan fechas, por defecto: hoy
  const hoyKey = toLocalDateKey(new Date());
  const fromKey = from || hoyKey;
  const toKey = to || hoyKey;

  const start = `${fromKey}T00:00:00.000`;
  const end = `${toKey}T23:59:59.999`;

  let rows;
  if (facilitadoraId) {
    rows = db.prepare(`
      SELECT m.id, m.tipo, m.timestamp, m.source,
             f.id as facilitadora_id, f.nombre, f.rut, f.cargo, f.correo
      FROM marcas_horario m
      JOIN facilitadoras f ON f.id = m.facilitadora_id
      WHERE m.timestamp >= ? AND m.timestamp <= ?
        AND f.id = ?
      ORDER BY m.timestamp DESC
    `).all(start, end, facilitadoraId);
  } else {
    rows = db.prepare(`
      SELECT m.id, m.tipo, m.timestamp, m.source,
             f.id as facilitadora_id, f.nombre, f.rut, f.cargo, f.correo
      FROM marcas_horario m
      JOIN facilitadoras f ON f.id = m.facilitadora_id
      WHERE m.timestamp >= ? AND m.timestamp <= ?
      ORDER BY m.timestamp DESC
    `).all(start, end);
  }

  res.json(rows);
});

// --- CLIENTES: Leads ---
// GET /leads?status=nuevo
app.get("/leads", (req, res) => {
  const status = String(req.query.status || "").trim();
  let rows;
  if (status) {
    rows = db
      .prepare(
        `SELECT id, created_at, status, origen, nombre_contacto, email, telefono, mensaje, preferencias_json
         FROM leads
         WHERE status = ?
         ORDER BY created_at DESC`
      )
      .all(status);
  } else {
    rows = db
      .prepare(
        `SELECT id, created_at, status, origen, nombre_contacto, email, telefono, mensaje, preferencias_json
         FROM leads
         ORDER BY created_at DESC
         LIMIT 200`
      )
      .all();
  }

  // parse preferencias_json
  const out = rows.map((r) => ({
    ...r,
    preferencias: r.preferencias_json ? safeJsonParse(r.preferencias_json) : null,
  }));
  res.json(out);
});

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

// POST /leads (WordPress webhook o manual)
app.post("/leads", (req, res) => {
  const parsed = LeadCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const id = uid();
  const created_at = new Date().toISOString();
  const {
    origen,
    nombre_contacto,
    email,
    telefono,
    mensaje,
    preferencias,
  } = parsed.data;

  db.prepare(
    `INSERT INTO leads (id, created_at, status, origen, nombre_contacto, email, telefono, mensaje, preferencias_json)
     VALUES (?, ?, 'nuevo', ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    created_at,
    origen,
    nombre_contacto.trim(),
    (email || null),
    (telefono || null),
    (mensaje || null),
    preferencias ? JSON.stringify(preferencias) : null
  );

  res.json({ id });
});

// PATCH /leads/:id (cambiar estado)
app.patch("/leads/:id", (req, res) => {
  const id = req.params.id;
  const parsed = LeadPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "Lead no existe." });

  const next = {
    status: parsed.data.status ?? existing.status,
    nombre_contacto: parsed.data.nombre_contacto ?? existing.nombre_contacto,
    email: parsed.data.email !== undefined ? parsed.data.email : existing.email,
    telefono: parsed.data.telefono !== undefined ? parsed.data.telefono : existing.telefono,
    mensaje: parsed.data.mensaje !== undefined ? parsed.data.mensaje : existing.mensaje,
    preferencias_json:
      parsed.data.preferencias !== undefined
        ? (parsed.data.preferencias ? JSON.stringify(parsed.data.preferencias) : null)
        : existing.preferencias_json,
  };

  db.prepare(
    `UPDATE leads
     SET status = ?, nombre_contacto = ?, email = ?, telefono = ?, mensaje = ?, preferencias_json = ?
     WHERE id = ?`
  ).run(
    next.status,
    next.nombre_contacto,
    next.email,
    next.telefono,
    next.mensaje,
    next.preferencias_json,
    id
  );

  res.json({ ok: true });
});

// --- CLIENTES: Apoderados ---
app.get("/apoderados", (req, res) => {
  const rows = db.prepare(`
    SELECT id, created_at, nombre, rut, email, telefono, direccion, notas, activo
    FROM apoderados
    ORDER BY activo DESC, nombre ASC
  `).all();
  res.json(rows);
});

app.post("/apoderados", (req, res) => {
  const parsed = ApoderadoCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const id = uid();
  const created_at = new Date().toISOString();
  const a = parsed.data;

  db.prepare(`
    INSERT INTO apoderados (id, created_at, nombre, rut, email, telefono, direccion, notas, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    id,
    created_at,
    a.nombre.trim(),
    a.rut?.trim() || null,
    a.email?.trim() || null,
    a.telefono?.trim() || null,
    a.direccion?.trim() || null,
    a.notas?.trim() || null
  );

  res.json({ id });
});

// --- CLIENTES: Niños ---
app.get("/ninos", (req, res) => {
  const apoderado_id = String(req.query.apoderado_id || "").trim();

  let rows;
  if (apoderado_id) {
    rows = db.prepare(`
      SELECT id, created_at, apoderado_id, nombre, fecha_nacimiento, nivel, alergias, observaciones, activo
      FROM ninos
      WHERE apoderado_id = ?
      ORDER BY activo DESC, nombre ASC
    `).all(apoderado_id);
  } else {
    rows = db.prepare(`
      SELECT id, created_at, apoderado_id, nombre, fecha_nacimiento, nivel, alergias, observaciones, activo
      FROM ninos
      ORDER BY created_at DESC
      LIMIT 200
    `).all();
  }

  res.json(rows);
});

app.post("/ninos", (req, res) => {
  const parsed = NinoCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const id = uid();
  const created_at = new Date().toISOString();
  const n = parsed.data;

  // validar apoderado existe
  const ap = db.prepare(`SELECT id FROM apoderados WHERE id = ?`).get(n.apoderado_id);
  if (!ap) return res.status(404).json({ error: "Apoderado no existe." });

  db.prepare(`
    INSERT INTO ninos (id, created_at, apoderado_id, nombre, fecha_nacimiento, nivel, alergias, observaciones, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    id,
    created_at,
    n.apoderado_id,
    n.nombre.trim(),
    n.fecha_nacimiento || null,
    n.nivel || null,
    n.alergias || null,
    n.observaciones || null
  );

  res.json({ id });
});



// GET facilitadoras
app.get("/facilitadoras", (req, res) => {
  const rows = db.prepare(`
   SELECT id, nombre, cargo, rut, correo, activo, created_at,
           CASE WHEN pin_hash IS NULL THEN 0 ELSE 1 END AS has_pin
    FROM facilitadoras
    ORDER BY activo DESC, nombre ASC`).all();
  res.json(rows);
});

// POST facilitadoras
app.post("/facilitadoras", (req, res) => {
  const parsed = FacilitadoraCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { nombre, cargo, rut, correo } = parsed.data;
  const id = uid();
  const created_at = new Date().toISOString();

  db.prepare(`
  INSERT INTO facilitadoras (id, nombre, cargo, rut, correo, activo, created_at)
  VALUES (?, ?, ?, ?, ?, 1, ?)
`).run(id, nombre.trim(), cargo.trim(), rut?.trim() || null, correo?.trim() || null, created_at);

  res.json({ id });
});

// PATCH facilitadoras/:id (editar + activar/inactivar)
app.patch("/facilitadoras/:id", (req, res) => {
  const id = req.params.id;
  const parsed = FacilitadoraPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = db.prepare(`SELECT * FROM facilitadoras WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: "No existe facilitadora." });

  const next = {
  nombre: parsed.data.nombre ?? existing.nombre,
  cargo: parsed.data.cargo ?? existing.cargo,
  rut: parsed.data.rut ?? existing.rut,
  correo: parsed.data.correo ?? existing.correo,
  activo: parsed.data.activo !== undefined ? (parsed.data.activo ? 1 : 0) : existing.activo
};

  db.prepare(`UPDATE facilitadoras
  SET nombre = ?, cargo = ?, rut = ?, correo = ?, activo = ?
  WHERE id = ?
`).run(next.nombre, next.cargo, next.rut, next.correo, next.activo, id);
  res.json({ ok: true });
});

// POST reset PIN (devuelve el PIN SOLO UNA VEZ)
app.post("/facilitadoras/:id/pin/reset", (req, res) => {
  const id = req.params.id;
  const fac = db.prepare(`SELECT * FROM facilitadoras WHERE id = ?`).get(id);
  if (!fac) return res.status(404).json({ error: "No existe facilitadora." });

  const pin = generatePin4();
  const hash = bcrypt.hashSync(pin, 10);

  db.prepare(`
    UPDATE facilitadoras
    SET pin_hash = ?
    WHERE id = ?
  `).run(hash, id);

  // ⚠️ se devuelve una sola vez para que tú lo entregues
  res.json({ pin });
});

/* // POST kiosco marcar por PIN
app.post("/kiosco/marcar", (req, res) => {
  const parsed = KioscoMarkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "PIN inválido" });

  const { pin } = parsed.data;

  // Buscar facilitadoras con pin_hash (no hay índice directo, pero el equipo es pequeño)
  const facs = db.prepare(`
    SELECT id, nombre, cargo, activo, pin_hash
    FROM facilitadoras
    WHERE pin_hash IS NOT NULL
  `).all();

  const fac = facs.find(f => f.pin_hash && bcrypt.compareSync(pin, f.pin_hash));
  if (!fac) return res.status(401).json({ error: "PIN incorrecto." });
  if (!fac.activo) return res.status(403).json({ error: "Facilitadora inactiva." });

  const hoyKey = toLocalDateKey(new Date());
  const start = `${hoyKey}T00:00:00.000`;
  const end = `${hoyKey}T23:59:59.999`;

  const marcasHoy = db.prepare(`
    SELECT id, tipo, timestamp
    FROM marcas_horario
    WHERE facilitadora_id = ?
      AND timestamp >= ?
      AND timestamp <= ?
    ORDER BY timestamp ASC
  `).all(fac.id, start, end);

  // Determinar próxima acción
  const tieneEntrada = marcasHoy.some(m => m.tipo === "entrada");
  const tieneSalida = marcasHoy.some(m => m.tipo === "salida");

  let tipo;
  if (!tieneEntrada && !tieneSalida) {
    tipo = "entrada";
  } else if (tieneEntrada && !tieneSalida) {
    tipo = "salida";
  } else {
    return res.status(409).json({ error: "Ya registraste entrada y salida hoy." });
  }

  // ✅ regla confirmada: salida sin entrada => bloquea (ya cubierto)
  if (tipo === "salida" && !tieneEntrada) {
    return res.status(409).json({ error: "Falta tu entrada de hoy. Habla con administración." });
  }

  const nowIso = new Date().toISOString();
  const markId = uid();
  db.prepare(`
    INSERT INTO marcas_horario (id, facilitadora_id, tipo, timestamp, source)
    VALUES (?, ?, ?, ?, 'kiosco')
  `).run(markId, fac.id, tipo, nowIso);

  res.json({
    ok: true,
    tipo,
    timestamp: nowIso
  }); */

  // POST kiosco marcar por PIN
app.post("/kiosco/marcar", (req, res) => {
  const parsed = KioscoMarkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "PIN inválido" });

  const { pin } = parsed.data;

  // Buscar facilitadoras con pin_hash (equipo pequeño => ok)
  const facs = db.prepare(`
     SELECT id, nombre, cargo, rut, correo, activo, pin_hash
    FROM facilitadoras
    WHERE pin_hash IS NOT NULL
  `).all();

  const fac = facs.find(f => f.pin_hash && bcrypt.compareSync(pin, f.pin_hash));
  if (!fac) return res.status(401).json({ error: "PIN incorrecto." });
  if (!fac.activo) return res.status(403).json({ error: "Facilitadora inactiva." });

  // Rango hoy (según lógica actual)
  const hoyKey = toLocalDateKey(new Date());
  const start = `${hoyKey}T00:00:00.000`;
  const end = `${hoyKey}T23:59:59.999`;

  const marcasHoy = db.prepare(`
    SELECT id, tipo, timestamp
    FROM marcas_horario
    WHERE facilitadora_id = ?
      AND timestamp >= ?
      AND timestamp <= ?
    ORDER BY timestamp ASC
  `).all(fac.id, start, end);

  // --- Anti doble-tap (60s) ---
  // Si el último registro fue hace <60s, bloquea
  const last = marcasHoy.length ? marcasHoy[marcasHoy.length - 1] : null;
  if (last) {
    const lastMs = Date.parse(last.timestamp);
    const nowMs = Date.now();
    const diffSec = (nowMs - lastMs) / 1000;
    if (diffSec >= 0 && diffSec < 60) {
      return res.status(429).json({ error: "Registro repetido muy rápido. Espera 1 minuto y reintenta." });
    }
  }

  // Determinar próxima acción (una entrada + una salida por día)
  const tieneEntrada = marcasHoy.some(m => m.tipo === "entrada");
  const tieneSalida = marcasHoy.some(m => m.tipo === "salida");

  let tipo;
  if (!tieneEntrada && !tieneSalida) {
    tipo = "entrada";
  } else if (tieneEntrada && !tieneSalida) {
    tipo = "salida";
  } else {
    return res.status(409).json({ error: "Ya registraste entrada y salida hoy." });
  }

  // Bloqueo explícito doble entrada/salida (extra defensa)
  if (last && last.tipo === tipo) {
    return res.status(409).json({ error: `Ya registraste ${tipo} hoy. (Bloqueo doble marca)` });
  }

  // ✅ regla confirmada: salida sin entrada => bloquea (en tu lógica ya no ocurre)
  if (tipo === "salida" && !tieneEntrada) {
    return res.status(409).json({ error: "Falta tu entrada de hoy. Habla con administración." });
  }

  const nowIso = new Date().toISOString();
  const markId = uid();

  db.prepare(`
    INSERT INTO marcas_horario (id, facilitadora_id, tipo, timestamp, source)
    VALUES (?, ?, ?, ?, 'kiosco')
  `).run(markId, fac.id, tipo, nowIso);

  res.json({
    ok: true,
  tipo,
  timestamp: nowIso,           // ✅ hora fija de la marca (backend)
  facilitadora: {
    id: fac.id,
    nombre: fac.nombre,
    cargo: fac.cargo,
    rut: fac.rut || "",
    correo: fac.correo || ""}
  });
});

// GET kiosco estado del día (opcional, para UX)
app.get("/kiosco/estado", (req, res) => {
  const pin = String(req.query.pin || "");
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: "PIN inválido" });

const facs = db.prepare(`
  SELECT id, nombre, cargo, rut, correo, activo, pin_hash
  FROM facilitadoras
  WHERE pin_hash IS NOT NULL
`).all();


  const fac = facs.find(f => f.pin_hash && bcrypt.compareSync(pin, f.pin_hash));
  if (!fac) return res.status(401).json({ error: "PIN incorrecto." });
  if (!fac.activo) return res.status(403).json({ error: "Facilitadora inactiva." });

  const hoyKey = toLocalDateKey(new Date());
  const start = `${hoyKey}T00:00:00.000`;
  const end = `${hoyKey}T23:59:59.999`;

  const marcasHoy = db.prepare(`
    SELECT tipo, timestamp
    FROM marcas_horario
    WHERE facilitadora_id = ?
      AND timestamp >= ?
      AND timestamp <= ?
    ORDER BY timestamp ASC
  `).all(fac.id, start, end);

  const tieneEntrada = marcasHoy.some(m => m.tipo === "entrada");
  const tieneSalida = marcasHoy.some(m => m.tipo === "salida");

  let nextAction = "entrada";
  if (tieneEntrada && !tieneSalida) nextAction = "salida";
  if (tieneEntrada && tieneSalida) nextAction = "cerrado";

  res.json({
    ok: true,
    facilitadora: { id: fac.id, nombre: fac.nombre, cargo: fac.cargo },
    hoyKey,
    nextAction,
    last: marcasHoy.length ? marcasHoy[marcasHoy.length - 1] : null
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});


// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SGP server en http://0.0.0.0:${PORT}`);
});
