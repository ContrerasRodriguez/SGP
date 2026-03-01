import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, apiPatch, apiPut } from "../api.js"; // si no tienes apiPut, te lo dejo abajo

function getLS(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}
function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function PedagogiaTools() {
  const [facs, setFacs] = useState([]);
  const [msg, setMsg] = useState("");

  // “responsable” elegido desde maestro facilitadoras
  const [responsableId, setResponsableId] = useState(() => localStorage.getItem("pc_responsable_id") || "");
  const responsable = useMemo(() => facs.find(f => f.id === responsableId), [facs, responsableId]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await apiGet("/facilitadoras");
        setFacs(rows);
      } catch (e) {
        setMsg(e.message);
      }
    })();
  }, []);

  function onChangeResp(id) {
    setResponsableId(id);
    localStorage.setItem("pc_responsable_id", id);
    // opcional: publicar también el nombre/cargo para que el HTML lo use si quieres
    const f = facs.find(x => x.id === id);
    localStorage.setItem("pc_responsable_nombre", f?.nombre || "");
    localStorage.setItem("pc_responsable_cargo", f?.cargo || "");
  }

  async function pushRepoToBackend() {
    setMsg("");
    try {
      const data = getLS("pc_repo_actividades_all", []);
      if (!Array.isArray(data) || !data.length) {
        setMsg("⚠️ No hay pc_repo_actividades_all en localStorage. Publica desde el Visualizador primero.");
        return;
      }
      await apiPut("/pedagogia/repo", {
        data,
        updated_by: responsableId || null,
        note: "sync desde navegador (localStorage pc_repo_actividades_all)",
      });
      setMsg(`✅ Repo subido al backend (${data.length} actividades).`);
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function pullRepoFromBackend() {
    setMsg("");
    try {
      const res = await apiGet("/pedagogia/repo");
      const data = res?.data || [];
      setLS("pc_repo_actividades_all", data);
      localStorage.setItem("pc_repo_last_sync", new Date().toISOString());
      setMsg(`✅ Repo bajado desde backend (${data.length} actividades) y guardado en localStorage.`);
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <div className="cardTitle">Pedagogía · Herramientas</div>
        <div className="muted">
          Visualizador + Generador/Planificador integrados dentro del sistema. Sincronización con backend.
        </div>

        {msg && <div className="msg">{msg}</div>}

        <div className="row" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ minWidth: 260 }}>
            <div className="muted" style={{ marginBottom: 6 }}>Responsable (desde Facilitadoras)</div>
            <select value={responsableId} onChange={(e) => onChangeResp(e.target.value)}>
              <option value="">(sin responsable)</option>
              {facs.map(f => <option key={f.id} value={f.id}>{f.nombre} · {f.cargo}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap" }}>
            <button className="btn primary" onClick={pushRepoToBackend}>⬆️ Subir Repo al Backend</button>
            <button className="btn" onClick={pullRepoFromBackend}>⬇️ Bajar Repo del Backend</button>
          </div>

          <div className="muted" style={{ alignSelf: "end" }}>
            {responsable ? `Activo: ${responsable.nombre}` : "Responsable no seleccionado"}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardTitle">Visualizador de Actividades</div>
        <div className="muted">Edita, reporta y publica al planificador (usa localStorage).</div>
        <div style={{ height: "78vh", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
          <iframe
            title="Visualizador"
            src="/tools/visualizador_actividades_v2.5_sync.html"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </section>

      <section className="card">
        <div className="cardTitle">Generador de Proyectos + Planificador Semanal</div>
        <div className="muted">Sincroniza desde Visualizador (localStorage) y planifica la semana.</div>
        <div style={{ height: "78vh", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
          <iframe
            title="Planificador"
            src="/tools/sistema_generador_a11y_sync.html"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </section>
    </main>
  );
}

