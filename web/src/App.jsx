import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Admin from "./pages/Admin.jsx";
import Kiosco from "./pages/Kiosco.jsx";
import Leads from "./pages/Leads.jsx";
import PedagogiaTools from "./pages/PedagogiaTools.jsx";
import Historial from "./pages/Historial.jsx";

const NAV_ITEMS = [
  { to: "/admin", label: "Admin", match: "/admin" },
  { to: "/historial", label: "Historial", match: "/historial" },
  { to: "/clientes/leads", label: "Leads", match: "/clientes/leads" },
  { to: "/pedagogia", label: "Pedagogía", match: "/pedagogia" },
  { to: "/kiosco", label: "Kiosco", match: "/kiosco" },
];

export default function App() {
  const loc = useLocation();
  const isKiosco = loc.pathname.startsWith("/kiosco");

  return (
    <div className="app">
      {!isKiosco && (
        <header className="topbar">
          <div>
            <div className="title">Pequeños Creadores · SGP</div>
            <div className="subtitle">Gestión operativa: administración, asistencia, leads y pedagogía</div>
          </div>

          <nav className="nav" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                className={loc.pathname.startsWith(item.match) ? "active" : ""}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/clientes/leads" element={<Leads />} />
        <Route path="/pedagogia" element={<PedagogiaTools />} />
        <Route path="/kiosco" element={<Kiosco />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}
