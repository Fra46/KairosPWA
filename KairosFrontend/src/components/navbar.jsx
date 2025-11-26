"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-kairos sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand kairos-logo" to="/">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="d-inline-block align-text-top me-2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          KAIROS
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/">
                Inicio
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/pantalla">
                Pantalla
              </Link>
            </li>

            {!user && (
              <li className="nav-item">
                <Link className="btn btn-light btn-sm ms-2" to="/login">
                  Acceso Personal
                </Link>
              </li>
            )}

            {user && (
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle fw-semibold" href="#" role="button" data-bs-toggle="dropdown">
                    Gestión
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {(user.role === "Empleado" || user.role === "Administrador") && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/empleado/siguiente-turno">
                            Siguiente Turno
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/empleado/clientes">
                            Consultar Clientes
                          </Link>
                        </li>
                      </>
                    )}

                    {user.role === "Administrador" && (
                      <>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/servicios">
                            Administrar Servicios
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/usuarios">
                            Administrar Usuarios
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/registro">
                            Registrar Personal
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </li>

                <li className="nav-item ms-2">
                  <span className="navbar-text text-white me-3">
                    <i className="bi bi-person-circle me-2"></i>
                    {user.name}
                  </span>
                </li>

                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
