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

    try {
      const data = await userService.Login({
        userName,
        password,
      })

      login(data)

      const from = location.state?.from?.pathname

      if (from) {
        navigate(from, { replace: true })
      } else if (data.user?.role === "Administrador") {
        navigate("/admin/servicios", { replace: true })
      } else {
        navigate("/empleado/siguiente-turno", { replace: true })
      }
    } catch (err) {
      setError("Credenciales inválidas.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "540px", margin: "0 auto" }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-1">KAIROS</h2>
              <p className="text-muted mb-0">Acceso Personal — Sistema de Gestión de Turnos</p>
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
              <div className="mb-3">
                <label className="form-label fw-semibold">Usuario</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white">
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
                    placeholder="Usuario"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Contraseña</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white">
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
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 btn-lg mb-3"
                style={{
                  background: "linear-gradient(90deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                  color: "white",
                  borderRadius: "10px",
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Iniciando Sesión...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="me-2"
                      style={{ verticalAlign: "middle", color: "white" }}
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Iniciar Sesión
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                style={{ borderRadius: "10px" }}
                onClick={() => navigate("/")}
              >
                Volver al Inicio
              </button>
            </form>

            <div className="text-center mt-4">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                style={{
                  background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(251,146,60,0.06) 100%)",
                  border: "1px solid rgba(249,115,22,0.12)",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-primary)"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="text-muted small" style={{ fontWeight: 600 }}>
                  Introduzca sus credenciales para acceder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
