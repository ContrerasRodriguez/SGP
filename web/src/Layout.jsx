import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const loc = useLocation();

  return (
    <>
      <header className="header">
        <div className="container headerInner">
          <div className="logo">
            🏡 Pequeños Creadores
          </div>

          <nav className="nav">
            <Link className={loc.pathname.startsWith("/admin") ? "active" : ""} to="/admin">
              Admin
            </Link>

            <Link className={loc.pathname.startsWith("/kiosco") ? "active" : ""} to="/kiosco">
              Kiosco
            </Link>

            <Link className={loc.pathname.startsWith("/historial") ? "active" : ""} to="/historial">
              Historial
            </Link>
          </nav>
        </div>
      </header>

      <Outlet />
    </>
  );
}