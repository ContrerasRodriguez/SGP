import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Admin from "./pages/Admin.jsx";
import Kiosco from "./pages/Kiosco.jsx";
import Leads from "./pages/Leads.jsx";
import PedagogiaTools from "./pages/PedagogiaTools.jsx";
import Historial from "./pages/Historial.jsx";
import Layout from "./Layout.jsx";


<Routes>
  <Route element={<Layout />}></Route>
  <Route element={<Layout />}></Route>
  <Route path="/admin" element={<Admin />} />
  <Route path="/kiosco" element={<Kiosco />} />
  <Route path="/pedagogia" element={<PedagogiaTools />} />
  <Route path="*" element={<Navigate to="/admin" replace />} />
  <Route path="/historial" element={<Historial />} />
</Routes>



export default function App() {
  const loc = useLocation();
  const isKiosco = loc.pathname.startsWith("/kiosco");

  return (
    <div className="app">
      {!isKiosco && (
        <header className="topbar">
          <div>
            <div className="title">Pequeños Creadores · SGP</div>
            <div className="subtitle">Admin + Kiosco (PIN 4 dígitos)</div>
          </div>
          <nav className="nav">
            <Link className={loc.pathname.startsWith("/admin") ? "active" : ""} to="/admin">Admin</Link>
            <Link className={loc.pathname.startsWith("/kiosco") ? "active" : ""} to="/kiosco">Kiosco</Link>
          </nav>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/kiosco" element={<Kiosco />} />
        <Route path="/clientes/leads" element={<Leads />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}
