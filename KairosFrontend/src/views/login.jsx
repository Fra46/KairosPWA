"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { userService } from "../services/userService"
import { useAuth } from "../context/useAuth"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()

  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("[v0] Attempting login with username:", userName)

    try {
      const data = await userService.Login({
        userName,
        password,
      })

      console.log("[v0] Login response data:", data)

      login(data)

      console.log("[v0] Auth saved, redirecting based on role:", data.user?.role)

      const from = location.state?.from?.pathname

      if (from) {
        console.log("[v0] Redirecting to original destination:", from)
        navigate(from, { replace: true })
      } else if (data.user?.role === "Administrador") {
        console.log("[v0] Redirecting to admin services")
        navigate("/admin/servicios", { replace: true })
      } else {
        console.log("[v0] Redirecting to employee next turn")
        navigate("/empleado/siguiente-turno", { replace: true })
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Credenciales inválidas.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-gradient-radial py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-xl border-0 fade-in">
              <div className="card-body p-5">
                {/* Logo y título */}
                <div className="text-center mb-4">
                  <div className="logo-circle mx-auto mb-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h1 className="kairos-logo-large mb-2">KAIROS</h1>
                  <p className="text-muted mb-0">Acceso Personal</p>
                  <p className="text-muted small">Sistema de Gestión de Turnos</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-kairos mb-4" role="alert">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="me-2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Usuario */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Usuario</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Botón de login */}
                  <button type="submit" className="btn btn-primary w-100 btn-lg mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Iniciando Sesión...
                      </>
                    ) : (
                      <>
                        <svg
                          width="20"
                          height="20"
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
                        Iniciar Sesión
                      </>
                    )}
                  </button>

                  {/* Link volver */}
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={() => navigate("/")}>
                    Volver al Inicio
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
