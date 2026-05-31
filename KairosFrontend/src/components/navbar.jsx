"use client"

import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import usePwaInstallPrompt from "../hooks/usePwaInstallPrompt"
import KioskoAuthModal from "./KioskoAuthModal"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { canInstall, promptInstall } = usePwaInstallPrompt()
  const [showKioskoModal, setShowKioskoModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-kairos sticky-top shadow-sm">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center">
          <Link className="navbar-brand kairos-logo d-flex align-items-center" to="/">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="me-2"
            >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="fw-bold">KAIROS BANCO</span>
        </Link>

          {canInstall && (
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-pill px-4 d-none d-lg-inline-flex align-items-center ms-3"
              onClick={promptInstall}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="me-2"
              >
                <path d="M12 5v10"></path>
                <polyline points="8 11 12 15 16 11"></polyline>
                <path d="M20 19H4"></path>
              </svg>
              Instalar App
            </button>
          )}

          <button
            type="button"
            className="btn btn-warning btn-sm rounded-pill px-4 d-none d-md-inline-flex align-items-center ms-3"
            onClick={() => setShowKioskoModal(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="me-2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="20" x2="22" y2="20"></line>
            </svg>
            Modo kiosko
          </button>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
              className={({ isActive }) => `nav-link px-3${isActive ? " active" : ""}`}
              to="/"
              end
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="me-2"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Inicio
            </NavLink>
          </li>

          <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle px-3" href="#" role="button" data-bs-toggle="dropdown">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="me-2"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Pantalla
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                  <li>
                    <NavLink className="dropdown-item" to="/pantalla/atencion">En atención</NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/pantalla/proximos">Próximos</NavLink>
                  </li>
                </ul>
              </li>

            {canInstall && (
              <li className="nav-item d-lg-none">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm rounded-pill px-4 w-100 d-flex align-items-center justify-content-center mb-2"
                  onClick={promptInstall}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="me-2"
                  >
                    <path d="M12 5v10"></path>
                    <polyline points="8 11 12 15 16 11"></polyline>
                    <path d="M20 19H4"></path>
                  </svg>
                  Instalar App
                </button>
              </li>
            )}

            {!user && (
              <li className="nav-item">
                <Link className="btn btn-outline-light btn-sm rounded-pill px-4" to="/login">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="me-2"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Acceso Personal
                </Link>
              </li>
            )}

            {user && (
              <>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle px-3" href="#" role="button" data-bs-toggle="dropdown">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="me-2"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.25M15.54 15.54l4.25 4.25M1 12h6M17 12h6M4.22 19.78l4.25-4.25M15.54 8.46l4.25-4.24"></path>
                    </svg>
                    Gestión
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                    {(user.role === "Empleado" || user.role === "Administrador") && (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/empleado/siguiente-turno">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="me-2"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                            Siguiente Turno
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/empleado/clientes">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="me-2"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
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
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="me-2"
                            >
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            Administrar Servicios
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/admin/usuarios">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="me-2"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Administrar Usuarios
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/registro">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="me-2"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            Registrar Personal
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </li>

                <li className="nav-item">
                  <span className="navbar-text text-white px-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="me-2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {user.name}
                  </span>
                </li>

                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm rounded-pill px-4" onClick={handleLogout}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="me-2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <KioskoAuthModal isOpen={showKioskoModal} onClose={() => setShowKioskoModal(false)} />
    </nav>
  )
}