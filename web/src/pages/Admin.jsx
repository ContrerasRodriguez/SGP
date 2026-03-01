import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../api.js";
import { Link } from "react-router-dom";



export default function Admin() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ nombre: "", cargo: "Facilitadora", rut: "", correo: "" });
  const [msg, setMsg] = useState("");
  const [pinModal, setPinModal] = useState(null); // { nombre, pin }

  function isActivo(f) {
    return f.activo === true || f.activo === 1;
  }

  async function load() {
    const data = await apiGet("/facilitadoras");
    setRows(data);
  }

  useEffect(() => {
    load().catch(e => setMsg(e.message));
  }, []);

  const activosPrimero = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aa = isActivo(a) ? 1 : 0;
      const bb = isActivo(b) ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return String(a.nombre).localeCompare(String(b.nombre), "es");
    });
  }, [rows]);

  async function createFac(e) {
    e.preventDefault();
    setMsg("");

    const nombre = form.nombre.trim();
    const cargo = form.cargo;
    const rut = form.rut.trim() || null;
    const correo = form.correo.trim() || null;

    if (!nombre) return setMsg("Falta nombre.");

    try {
      const created = await apiPost("/facilitadoras", { nombre, cargo, rut, correo });
      const id = created?.id;

      // Genera PIN inmediatamente (se muestra 1 vez)
      const dataPin = await apiPost(`/facilitadoras/${id}/pin/reset`, {});
      setPinModal({ nombre, pin: dataPin.pin });

      setForm({ nombre: "", cargo: "Facilitadora", rut: "", correo: "" });
      await load();
      setMsg("✅ Facilitadora creada + PIN generado.");
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function toggleActivo(f) {
    setMsg("");
    try {
      await apiPatch(`/facilitadoras/${f.id}`, { activo: !isActivo(f) });
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function resetPin(f) {
    setMsg("");
    const ok = confirm(`¿Resetear PIN para ${f.nombre}? (se mostrará una sola vez)`);
    if (!ok) return;
    try {
      const data = await apiPost(`/facilitadoras/${f.id}/pin/reset`, {});
      setPinModal({ nombre: f.nombre, pin: data.pin });
      await load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <div>
          <div className="actions" style={{ marginTop: 12 }}>
  <Link className="btn" to="/pedagogia">🧩 Pedagogía · Actividades & Planificador</Link>
</div>
        <div className="cardTitle">Admin · Facilitadoras</div>
        <div className="muted">Crea, activa/inactiva y genera PIN (4 dígitos).</div>
        </div>
        <Link className="btn" to="/clientes/leads">👥 Leads</Link>
        </div>
        {msg && <div className="msg">{msg}</div>}
      </section>

      <section className="card">
        <div className="cardTitle">Nueva facilitadora</div>
        <form onSubmit={createFac} className="grid">
          <div>
            <label>Nombre</label><br/>
            <input value={form.nombre} onChange={(e)=>setForm(s=>({ ...s, nombre:e.target.value }))} required />
          </div>
          <div style={{marginTop:10}}>
            <label>Cargo</label><br/>
            <select value={form.cargo} onChange={(e)=>setForm(s=>({ ...s, cargo:e.target.value }))}>
              <option>Facilitadora</option>
              <option>Educadora de Párvulos</option>
              <option>Coordinadora Pedagógica</option>
            </select>
          </div>
          <div style={{marginTop:10}}>
            <label>RUT (opcional)</label><br/>
            <input value={form.rut} onChange={(e)=>setForm(s=>({ ...s, rut:e.target.value }))} />
          </div>
          <div style={{marginTop:10}}>
            <label>Correo (opcional)</label><br/>
            <input value={form.correo} onChange={(e)=>setForm(s=>({ ...s, correo:e.target.value }))} />
          </div>
          <div style={{marginTop:14}}>
            <button className="btn primary" type="submit">Guardar + Generar PIN</button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="cardTitle">Listado</div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Activa</th>
                <th>PIN</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activosPrimero.map(f => (
                <tr key={f.id}>
                  <td>{f.nombre}</td>
                  <td>{f.cargo}</td>
                  <td><span className={`pill ${isActivo(f) ? "ok" : "off"}`}>{isActivo(f) ? "Activa" : "Inactiva"}</span></td>
                  <td>{f.has_pin ? "Asignado ✅" : "Sin PIN"}</td>
                  <td style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                    <button className="btn" onClick={()=>resetPin(f)}>{f.has_pin ? "Reset PIN" : "Generar PIN"}</button>
                    <button className="btn danger" onClick={()=>toggleActivo(f)}>{isActivo(f) ? "Inactivar" : "Activar"}</button>
                  </td>
                </tr>
              ))}
              {!activosPrimero.length && (
                <tr><td colSpan="5" className="muted">No hay facilitadoras aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {pinModal && (
        <div className="modalBackdrop" onClick={() => setPinModal(null)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.6)", display:"grid", placeItems:"center", padding:16
        }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{maxWidth:420, width:"100%"}}>
            <div className="cardTitle">PIN generado</div>
            <div className="muted">Se muestra una sola vez. Entrégalo a la facilitadora.</div>
            <div style={{marginTop:12, padding:12, borderRadius:14, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.10)"}}>
              <div style={{fontWeight:900}}>{pinModal.nombre}</div>
              <div style={{fontSize:34, fontWeight:900, letterSpacing:6, marginTop:6}}>{pinModal.pin}</div>
            </div>
            <div style={{marginTop:12}}>
              <button className="btn" onClick={() => setPinModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
