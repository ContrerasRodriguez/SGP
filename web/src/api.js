const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function http(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

export const apiPost = (p, b) => http("POST", p, b);
export const apiGet = (p) => http("GET", p);
export const apiPatch = (p, b) => http("PATCH", p, b);
export const apiPut = (p, b) => http("PUT", p, b);


