import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiPost } from "../api.js";

export default function Kiosco() {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [now, setNow] = useState(new Date());
  const [lastMark, setLastMark] = useState(null); // respuesta del backend

  const inputRef = useRef(null);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const clock = useMemo(
    () => now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now]
  );
  const dateStr = useMemo(() => now.toLocaleDateString("es-CL"), [now]);

  function formatLocalFromIso(iso) {
    const d = new Date(iso);
    return {
      fecha: d.toLocaleDateString("es-CL"),
      hora: d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
  }

  useEffect(() => {
    if (lastMark?.ok) {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        setLastMark(null);
        setMsg("");
        setPin("");
        requestAnimationFrame(() => inputRef.current?.focus());
      }, 10_000);
    }
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [lastMark?.ok]);

  function clearAll() {
    setPin("");
    setMsg("");
    setLastMark(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function appendDigit(d) {
    if (busy) return;
    if (pin.length >= 4) return;
    setPin((p) => (p + d).slice(0, 4));
    setMsg("");
  }
  function backspace() {
    if (busy) return;
    setPin((p) => p.slice(0, -1));
    setMsg("");
  }

  async function marcar() {
    setMsg("");
    setLastMark(null);

    if (!/^\d{4}$/.test(pin)) {
      setMsg("Ingresa un PIN válido de 4 dígitos.");
      return;
    }

    setBusy(true);
    try {
      const data = await apiPost("/kiosco/marcar", { pin });
      setLastMark(data);

      const tipoTxt = data.tipo === "entrada" ? "Entrada" : "Salida";
      const { fecha, hora } = formatLocalFromIso(data.timestamp);
      setMsg(`✅ ${tipoTxt} registrada a las ${hora} (${fecha})`);

      setPin("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (e) {
      setMsg(e.message || "Error al marcar.");
    } finally {
      setBusy(false);
    }
  }

  function enviarPorCorreo() {
    if (!lastMark?.ok) return;

    const fac = lastMark.facilitadora || {};
    const to = (fac.correo || "").trim();
    if (!to) {
      setMsg("⚠️ No tienes correo registrado. Pide a administración que lo agregue.");
      return;
    }

    const tipoTxt = lastMark.tipo === "entrada" ? "Entrada" : "Salida";
    const { fecha, hora } = formatLocalFromIso(lastMark.timestamp);

    const subject = encodeURIComponent(`Registro de horario · ${tipoTxt} · ${fecha}`);
    const body = encodeURIComponent(
      [
        "Registro de horario (Pequeños Creadores)",
        "",
        `Nombre: ${fac.nombre || ""}`,
        `RUT: ${fac.rut || "—"}`,
        `Cargo: ${fac.cargo || ""}`,
        `Fecha: ${fecha}`,
        `Hora: ${hora}`,
        `Tipo: ${tipoTxt}`,
        "",
        "Este correo fue generado desde el kiosco SGP."
      ].join("\n")
    );

    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
  }

  const digits = ["1","2","3","4","5","6","7","8","9","0"];
  const ticketTime = lastMark?.timestamp ? formatLocalFromIso(lastMark.timestamp) : null;

  return (
    <div className="kiosco">
      <div className="kHeader">
        <div className="kClock">{clock}</div>
        <div className="kDate">{dateStr}</div>
      </div>

      <div className="kCard">
        <div className="kTitle">Kiosco · Registro de Entrada/Salida</div>
        <div className="kSubtitle">Ingresa tu PIN (4 dígitos) y presiona Marcar.</div>

        {msg && <div className={`kMsg ${msg.startsWith("✅") ? "ok" : "bad"}`}>{msg}</div>}

        <div className="kPinRow">
          <input
            ref={inputRef}
            className="kPin"
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(v);
              setMsg("");
            }}
            disabled={busy}
          />
          <button className="kBtn danger" onClick={backspace} disabled={busy}>Borrar</button>
          <button className="kBtn primary" onClick={marcar} disabled={busy}>{busy ? "Marcando..." : "Marcar"}</button>
        </div>

        <div className="kPad">
          {digits.slice(0, 9).map((d) => (
            <button key={d} className="kKey" onClick={() => appendDigit(d)} disabled={busy}>{d}</button>
          ))}
          <button className="kKey ghost" onClick={clearAll} disabled={busy}>Limpiar</button>
          <button className="kKey" onClick={() => appendDigit("0")} disabled={busy}>0</button>
          <button className="kKey ghost" onClick={marcar} disabled={busy}>OK</button>
        </div>

        {lastMark?.ok && (
          <div className="kTicket">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div className="kTicketTitle">Confirmación</div>
              <button className="kBtn" onClick={clearAll}>Cerrar</button>
            </div>

            <div className="kTicketGrid">
              <div className="kLabel">Nombre</div>
              <div className="kValue">{lastMark.facilitadora?.nombre || "—"}</div>

              <div className="kLabel">RUT</div>
              <div className="kValue">{lastMark.facilitadora?.rut || "—"}</div>

              <div className="kLabel">Fecha</div>
              <div className="kValue">{ticketTime?.fecha || "—"}</div>

              <div className="kLabel">Hora</div>
              <div className="kValue">{ticketTime?.hora || "—"}</div>

              <div className="kLabel">Tipo</div>
              <div className="kValue">{lastMark.tipo === "entrada" ? "Entrada" : "Salida"}</div>
            </div>

            <div className="kEmailRow">
              <button className="kBtn" onClick={enviarPorCorreo}>Enviar a correo</button>
            </div>

            <div className="kSmall">* Se limpia automáticamente en 10 segundos.</div>
          </div>
        )}
      </div>

      <style>{`
        .kiosco{min-height:100vh; display:flex; justify-content:center; padding:24px; background:#0b1220;}
        .kHeader{position:fixed; top:16px; left:16px; right:16px; display:flex; justify-content:space-between; align-items:baseline; color:#fff; opacity:.95;}
        .kClock{font-size:44px; font-weight:800; letter-spacing:0.5px;}
        .kDate{font-size:18px; opacity:.9}
        .kCard{width:min(760px, 100%); margin-top:90px; background:#0f1a2f; border:1px solid rgba(255,255,255,.08); border-radius:18px; padding:20px; color:#fff;}
        .kTitle{font-size:22px; font-weight:800;}
        .kSubtitle{opacity:.85; margin-top:6px; margin-bottom:14px;}
        .kMsg{margin:10px 0 14px; padding:10px 12px; border-radius:12px; font-weight:700;}
        .kMsg.ok{background:rgba(34,197,94,.14); border:1px solid rgba(34,197,94,.25);}
        .kMsg.bad{background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.25);}
        .kPinRow{display:flex; gap:10px; align-items:stretch; flex-wrap:wrap; margin-bottom:14px;}
        .kPin{flex:1; min-width:200px; font-size:34px; padding:12px 14px; border-radius:14px; border:1px solid rgba(255,255,255,.12); background:#0b1326; color:#fff; text-align:center; letter-spacing:10px;}
        .kBtn{border:none; border-radius:14px; padding:12px 16px; font-weight:800; cursor:pointer; background:rgba(255,255,255,.12); color:#fff;}
        .kBtn.primary{background:#2563eb;}
        .kBtn.danger{background:rgba(239,68,68,.22); border:1px solid rgba(239,68,68,.35);}
        .kBtn:disabled{opacity:.6; cursor:not-allowed;}
        .kPad{display:grid; grid-template-columns:repeat(3,1fr); gap:10px;}
        .kKey{font-size:26px; padding:18px 12px; border-radius:16px; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.08); color:#fff; font-weight:900;}
        .kKey.ghost{background:transparent;}
        .kTicket{margin-top:18px; padding:14px; border-radius:16px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10);}
        .kTicketTitle{font-weight:900;}
        .kTicketGrid{display:grid; grid-template-columns:120px 1fr; gap:8px 10px; align-items:center; margin-top:10px;}
        .kLabel{opacity:.8; font-weight:700;}
        .kValue{font-weight:900;}
        .kEmailRow{display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;}
        .kSmall{margin-top:8px; opacity:.75; font-size:12px;}
      `}</style>
    </div>
  );
}
