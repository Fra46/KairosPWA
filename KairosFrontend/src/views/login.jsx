"use client"

import { useState, useEffect } from "react"
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

  // Si ya está logueado → redirigir
  useEffect(() => {
    if (user) {
      const role = user.role
      if (role === "Administrador") navigate("/admin/servicios", { replace: true })
      else if (role === "Empleado") navigate("/empleado/siguiente-turno", { replace: true })
    }
  }, [user, navigate])

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

      if (from) navigate(from, { replace: true })
      else if (data.user.role === "Administrador") navigate("/admin/servicios", { replace: true })
      else navigate("/empleado/siguiente-turno", { replace: true })
    } catch (err) {
      console.error(err)
      setError("Credenciales inválidas.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5 bg-gradient-primary">
      <div className="container">
        <div className="row justify-content-center">

          <div className="col-md-5">
            <div className="card shadow-lg border-0 fade-in">
              <div className="card-body p-5">

                <div className="text-center mb-4">
                  <h2 className="kairos-logo-small">Acceso Personal</h2>
                  <p className="text-muted">Sistema de Gestión de Turnos</p>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Usuario</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                    {loading ? "Ingresando..." : "Iniciar Sesión"}
                  </button>
                </form>

              </div>
            </div>

            <div className="text-center mt-3">
              <button className="btn btn-outline-light" onClick={() => navigate("/")}>
                <i className="bi bi-arrow-left me-2"></i> Volver al inicio
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
