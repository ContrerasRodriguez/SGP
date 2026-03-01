// src/pages/ManualFacilitadoras.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export default function ManualFacilitadoras() {
  const checklist = useMemo(
    () => [
      {
        title: "Presencia activa",
        desc: "Estoy físicamente presente en el juego (suelo/rodillas), no observando a distancia.",
      },
      {
        title: "Participación emocional",
        desc: "Transmito entusiasmo, empatía y calidez; el niño siente compañía real.",
      },
      {
        title: "Diálogo significativo",
        desc: "Hago preguntas abiertas, escucho, valido emociones y amplío lenguaje.",
      },
      {
        title: "Extensión del juego",
        desc: "Propongo materiales/ideas que enriquecen sin dirigir; sostengo la exploración.",
      },
      {
        title: "Autonomía y cuidado",
        desc: "Acompaño conflictos con calma; promuevo acuerdos y cuidado del entorno.",
      },
      {
        title: "Orden y cierre",
        desc: "La actividad termina con limpieza y devolución del espacio; niños participan.",
      },
    ],
    []
  );

  const roleCards = useMemo(
    () => [
      {
        title: "Acompañar",
        bullets: [
          "Cuidamos desde el vínculo: nombre, mirada, cercanía.",
          "Observamos para entender, no para controlar.",
          "Sostenemos emociones: calma, límites claros y amables.",
        ],
      },
      {
        title: "Participar",
        bullets: [
          "Entramos al juego: proponemos, nos movemos, nos ensuciamos si toca.",
          "No nos quedamos paradas mirando (especialmente en patio).",
          "Creamos diálogo y experiencias reales con los niños.",
        ],
      },
      {
        title: "Cuidar el espacio",
        bullets: [
          "Orden general permanente (previene accidentes y estrés).",
          "No colgar cosas en cables/cordeles; si se cuelga, se retira al final.",
          "No meter hojas/papeles en zócalos (riesgo/combustible).",
          "Toda actividad se puede hacer, pero se deja limpio y desarmado al final.",
        ],
      },
      {
        title: "Documentar",
        bullets: [
          "Registramos momentos clave (logros, intereses, lenguaje, vínculos).",
          "La documentación es memoria pedagógica: sirve para planificar mejor.",
          "Lo simple vale: 1 foto + 2 líneas claras ya es progreso.",
        ],
      },
    ],
    []
  );

  function onPrint() {
    window.print();
  }

  return (
    <main className="container">
      {/* HERO */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="cardTitle">📘 Manual de Bienvenida · Facilitadoras</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Reggio Emilia + Filosofía Maker · Cuidado, juego y creatividad con responsabilidad compartida.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn" onClick={onPrint}>🖨️ Imprimir</button>
            <Link className="btn" to="/admin">← Volver a Admin</Link>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,.08)",
            background: "rgba(0,0,0,.02)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>
            “Libertad pedagógica + responsabilidad compartida”
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            Aquí creamos un espacio vivo: exploramos, jugamos y cuidamos. La calidad del vínculo se nota en lo cotidiano.
          </div>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className="card">
        <div className="cardTitle">Quiénes somos</div>
        <div className="muted" style={{ marginBottom: 12 }}>
          Pequeños Creadores es un espacio cálido e intencional: el juego es aprendizaje, y el ambiente enseña.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,.08)" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>🤝 Vínculo</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Presencia real, confianza y seguridad emocional.
            </div>
          </div>
          <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,.08)" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>🎨 Creatividad</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Materiales, preguntas y asombro para explorar.
            </div>
          </div>
          <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,.08)" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>🛡️ Cuidado</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Rutinas claras, prevención y cuidado del entorno.
            </div>
          </div>
          <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(0,0,0,.08)" }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>🧩 Juego</div>
            <div className="muted" style={{ marginTop: 6 }}>
              El juego es el corazón: acompańamos desde dentro.
            </div>
          </div>
        </div>
      </section>

      {/* TU ROL */}
      <section className="card">
        <div className="cardTitle">Tu rol</div>
        <div className="muted" style={{ marginBottom: 12 }}>
          No buscamos “vigilancia”: buscamos presencia, criterio pedagógico y cuidado activo.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {roleCards.map((c) => (
            <div
              key={c.title}
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,.08)",
                background: "rgba(0,0,0,.01)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>{c.title}</div>
              <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18 }}>
                {c.bullets.map((b, i) => (
                  <li key={i} className="muted" style={{ marginBottom: 8 }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE DESTACADO */}
      <section className="card">
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(34,197,94,.25)",
            background: "rgba(34,197,94,.08)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>El juego importa</div>
          <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>
            “No miramos el juego: jugamos con los niños.”
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            Especialmente en patio: el adulto entra al juego, crea diálogo, propone experiencias y sostiene la convivencia.
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="card">
        <div className="cardTitle">Indicadores de desempeño (observable)</div>
        <div className="muted" style={{ marginBottom: 12 }}>
          Señales concretas que buscamos ver todos los días.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          {checklist.map((it) => (
            <div
              key={it.title}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr",
                gap: 10,
                alignItems: "start",
                padding: 12,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,.08)",
              }}
            >
              <div style={{ fontSize: 18, lineHeight: "22px" }}>✅</div>
              <div>
                <div style={{ fontWeight: 900 }}>{it.title}</div>
                <div className="muted" style={{ marginTop: 4 }}>{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CIERRE */}
      <section className="card">
        <div className="cardTitle">Cierre</div>
        <div className="muted" style={{ marginTop: 6 }}>
          <b>Libertad pedagógica + responsabilidad compartida.</b> Puedes crear, proponer y adaptar: pero siempre cuidando
          seguridad, orden y cierre. Nuestro estándar es simple: <b>el niño aprende y el espacio queda como estaba</b>.
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={onPrint}>🖨️ Imprimir manual</button>
          <Link className="btn" to="/admin">Volver a Admin</Link>
        </div>
      </section>

      {/* Nota: si quieres estilos de impresión sin tocar CSS global */}
      <style>{`
        @media print {
          .btn, .topbar, nav { display: none !important; }
          .card { break-inside: avoid; }
          body { background: #fff !important; }
        }
      `}</style>
    </main>
  );
}
