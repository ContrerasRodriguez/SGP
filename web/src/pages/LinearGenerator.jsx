import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_LINEAR_GENERATOR_API_BASE || "http://localhost:3001";
const DEFAULT_PROJECT_ID = "dae2e165-8816-4cfd-bacf-dda32701d804";
const DEFAULT_TEAM_ID = "cd2352f3-9b25-40dd-9c24-eeb6d6362505";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload;
}

export default function LinearGenerator() {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("strategic-plan-90-days");
  const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID);
  const [teamId, setTeamId] = useState(DEFAULT_TEAM_ID);
  const [preview, setPreview] = useState(null);
  const [health, setHealth] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId),
    [templates, templateId]
  );

  useEffect(() => {
    Promise.all([request("/templates"), request("/health")])
      .then(([templateRows, healthResult]) => {
        setTemplates(templateRows);
        setHealth(healthResult);
      })
      .catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!templateId) return;
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  async function loadPreview() {
    setLoading(true);
    setMessage("");
    setResult(null);
    try {
      const data = await request("/preview", {
        method: "POST",
        body: JSON.stringify({ templateId, projectId, teamId, dryRun: true }),
      });
      setPreview(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function syncIssues() {
    if (!confirmed) {
      setMessage("Confirma que revisaste la vista previa antes de crear issues.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);
    try {
      const data = await request("/sync", {
        method: "POST",
        body: JSON.stringify({ templateId, projectId, teamId, dryRun: false }),
      });
      setResult(data);
      setConfirmed(false);
      setMessage(`Sincronización terminada: ${data.created.length} creados y ${data.skipped.length} omitidos.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <div className="cardTitle">Generador de proyectos para Linear</div>
        <div className="muted">
          Convierte plantillas de gestión en issues consistentes, revisables y sin duplicados.
        </div>

        {message && <div className="msg" style={{ marginTop: 12 }}>{message}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 16 }}>
          <label>
            <div className="muted" style={{ marginBottom: 6 }}>Plantilla</div>
            <select value={templateId} onChange={(event) => { setTemplateId(event.target.value); setConfirmed(false); }} style={{ width: "100%" }}>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} · {template.issueCount} issues
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>Project ID de Linear</div>
            <input value={projectId} onChange={(event) => { setProjectId(event.target.value); setConfirmed(false); }} style={{ width: "100%" }} />
          </label>

          <label>
            <div className="muted" style={{ marginBottom: 6 }}>Team ID de Linear</div>
            <input value={teamId} onChange={(event) => { setTeamId(event.target.value); setConfirmed(false); }} style={{ width: "100%" }} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <button className="btn" onClick={loadPreview} disabled={loading}>Actualizar vista previa</button>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            Revisé títulos, descripciones y destino
          </label>
          <button className="btn primary" onClick={syncIssues} disabled={loading || !confirmed}>
            {loading ? "Procesando…" : "Crear issues en Linear"}
          </button>
        </div>

        <div className="muted" style={{ marginTop: 12 }}>
          Servicio: {health?.ok ? "activo" : "sin verificar"} · API Key: {health?.apiKeyConfigured ? "configurada" : "pendiente"}
        </div>
      </section>

      <section className="card">
        <div className="cardTitle">Vista previa</div>
        <div className="muted">{selectedTemplate?.description || preview?.description}</div>

        {!preview && <div className="muted" style={{ marginTop: 16 }}>Selecciona una plantilla para cargar la vista previa.</div>}

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {preview?.issues?.map((item, index) => (
            <article key={item.key} style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{index + 1}. {item.title}</strong>
                <span className="muted">Prioridad {item.priority === 2 ? "High" : item.priority}</span>
              </div>
              {item.milestone && <div className="muted" style={{ marginTop: 6 }}>Milestone: {item.milestone}</div>}
              {item.dependencies?.length > 0 && <div className="muted" style={{ marginTop: 6 }}>Depende de: {item.dependencies.join(", ")}</div>}
              <details style={{ marginTop: 10 }}>
                <summary>Ver descripción</summary>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.5 }}>{item.description.replace(/<!--.*?-->/g, "")}</pre>
              </details>
            </article>
          ))}
        </div>
      </section>

      {result && (
        <section className="card">
          <div className="cardTitle">Resultado de sincronización</div>
          <div style={{ marginTop: 10 }}>
            <strong>{result.created.length}</strong> issues creados · <strong>{result.skipped.length}</strong> omitidos por existir previamente.
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {result.created.map(({ key, issue }) => (
              <a key={key} href={issue.url} target="_blank" rel="noreferrer">{issue.identifier} · {issue.title}</a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
