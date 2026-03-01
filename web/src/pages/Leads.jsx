import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../api.js";
import { Link } from "react-router-dom";

const ESTADOS = ["nuevo", "contactado", "visita", "inscrito", "descartado"];

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [estado, setEstado] = useState("nuevo");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });

  async function load() {
    const q = estado ? `?estado=${encodeURIComponent(estado)}` : "";
    const data = await apiGet(`/leads${q}`);
    setRows(data);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const q = estado ? `?estado=${encodeURIComponent(estado)}` : "";
        const data = await apiGet(`/leads${q}`);
        if (!alive) return;
        setRows(data);
      } catch (e) {
        if (!alive) return;
        setMsg(e.message);
      }
    })();
    return () => { alive = false; };
  }, [estado]);

  const ordered = useMemo(() => {
    return [...rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }, [rows]);

  async function createLead(e) {
    e.preventDefault();
    setMsg("");
    const nombre = form.nombre.trim();
    if (!nombre) return setMsg("Falta nombre.");

    try {
      await apiPost("/leads", {
        nombre,
        correo: form.correo.trim() || null,
        telefono: form.telefono.trim() || null,
        mensaje: form.mensaje.trim() || null,
        origen: "manual",
      });

      setForm({ nombre: "", correo: "", telefono: "", mensaje: "" });
      await load();
      setMsg("✅ Lead creado.");
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function setLeadEstado(lead, nextEstado) {
    setMsg("");
    try {
      await apiPatch(`/leads/${lead.id}`, { estado: nextEstado });
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  }

  return (
    <main className="container">
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div className="cardTitle">Clientes · Leads</div>
            <div className="muted">
              Captura y seguimiento. (Más adelante conectamos WordPress → lead automático).
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link className="btn" to="/admin">← Volver Admin</Link>
            <button className="btn" onClick={load}>Actualizar</button>
          </div>
        </div>

        {msg && <div className="msg">{msg}</div>}
      </section>

      <section className="card">
        <div className="cardTitle">Nuevo lead (manual)</div>

        <form onSubmit={createLead} className="grid">
          <div>
            <label>Nombre</label>
            <input value={form.nombre} onChange={(e)=>setForm(s=>({ ...s, nombre: e.target.value }))} required />
          </div>
          <div>
            <label>Correo</label>
            <input value={form.correo} onChange={(e)=>setForm(s=>({ ...s, correo: e.target.value }))} placeholder="correo@..." />
          </div>
          <div>
            <label>Teléfono</label>
            <input value={form.telefono} onChange={(e)=>setForm(s=>({ ...s, telefono: e.target.value }))} placeholder="+56..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label>Mensaje / contexto</label>
            <input value={form.mensaje} onChange={(e)=>setForm(s=>({ ...s, mensaje: e.target.value }))} placeholder="Interés, edades, horarios, etc." />
          </div>

          <div className="actions">
            <button className="btn primary" type="submit">Guardar</button>
          </div>
        </form>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="cardTitle">Bandeja</div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div className="muted">Filtrar por estado:</div>
            <select value={estado} onChange={(e)=>setEstado(e.target.value)}>
              {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="tableWrap" style={{ marginTop: 10 }}>
          <table>
            <thead>
              <tr>
                <th>Creado</th>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map(l => (
                <tr key={l.id}>
                  <td className="muted">{fmtDate(l.created_at)}</td>
                  <td style={{ fontWeight: 800 }}>{l.nombre}</td>
                  <td>
                    <div className="muted">{l.correo || "—"}</div>
                    <div className="muted">{l.telefono || "—"}</div>
                  </td>
                  <td className="muted">{l.mensaje || "—"}</td>
                  <td>
                    <span className="pill ok" style={{ textTransform: "capitalize" }}>{l.estado}</span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <select
                      value={l.estado}
                      onChange={(e)=>setLeadEstado(l, e.target.value)}
                      style={{ marginRight: 8 }}
                    >
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn" onClick={() => navigator.clipboard?.writeText(l.id)}>
                      Copiar ID
                    </button>
                  </td>
                </tr>
              ))}

              {!ordered.length && (
                <tr>
                  <td colSpan="6" className="muted">No hay leads en este estado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
