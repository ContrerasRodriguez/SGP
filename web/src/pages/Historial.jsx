import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api.js";

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmt(iso) {
  const d = new Date(iso);
  return {
    fecha: d.toLocaleDateString("es-CL"),
    hora: d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

export default function Historial() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const [from, setFrom] = useState(todayKey());
  const [to, setTo] = useState(todayKey());

  async function load() {
    setMsg("");
    try {
      const data = await apiGet(`/marcas?from=${from}&to=${to}`);
      setRows(data);
    } catch (e) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(() => rows, [rows]);

  return (
    <main className="container">
      <section className="card">
        <div className="cardTitle">Historial · Registros (Entrada/Salida)</div>
        <div className="muted">Filtra por fecha y revisa marcas por facilitadora.</div>
        {msg && <div className="msg">{msg}</div>}

        <div className="grid" style={{ marginTop: 12 }}>
          <div>
            <label>Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label>Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="actions" style={{ alignSelf: "end" }}>
            <button className="btn primary" onClick={load}>Buscar</button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardTitle">Resultados</div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Facilitadora</th>
                <th>RUT</th>
                <th>Cargo</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const t = fmt(r.timestamp);
                return (
                  <tr key={r.id}>
                    <td>{t.fecha}</td>
                    <td>{t.hora}</td>
                    <td>
                      <span className={`pill ${r.tipo === "entrada" ? "ok" : "off"}`}>
                        {r.tipo === "entrada" ? "Entrada" : "Salida"}
                      </span>
                    </td>
                    <td>{r.nombre}</td>
                    <td>{r.rut || "—"}</td>
                    <td>{r.cargo}</td>
                    <td className="muted">{r.source}</td>
                  </tr>
                );
              })}
              {!items.length && (
                <tr><td colSpan="7" className="muted">Sin registros en el rango.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}