"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { userService } from "../services/userService"
import { rolService } from "../services/rolService"

export default function RegistroStaff() {
  const navigate = useNavigate()

  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    rolId: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await rolService.GetAll()
        setRoles(data || [])
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, rolId: data[0].idRol }))
        }
      } catch (err) {
        console.error("Error cargando roles:", err)
        setError("No se pudieron cargar los roles")
      }
    }

    loadRoles()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!formData.userName.trim()) {
      setError("El nombre de usuario es obligatorio.")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    if (!formData.rolId) {
      setError("Debe seleccionar un rol.")
      return
    }

    setLoading(true)

    try {
      const rolId = Number(formData.rolId)

      await userService.Create({
        userName: formData.userName.trim(),
        password: formData.password,
        state: "Activo",
        rolId,
      })

      setSuccess(true)
      navigate("/admin/usuarios")
    } catch (err) {
      console.error(err)
      const data = err.response?.data

      let message =
        data?.message ||
        data?.title ||
        "Error al registrar usuario"

      if (data?.errors) {
        const firstError = Object.values(data.errors)[0]?.[0]
        if (firstError) message = firstError
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "680px", margin: "0 auto" }}>
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <h2 className="kairos-logo-small mb-1">Registrar Personal</h2>
              <p className="text-muted mb-3">Cree una cuenta para el personal del sistema</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && (
              <div className="alert alert-success">
                Usuario registrado correctamente.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Confirmar</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Rol</label>
                <select
                  className="form-select"
                  name="rolId"
                  value={formData.rolId}
                  onChange={handleChange}
                >
                  {roles.map((r) => (
                    <option key={r.idRol} value={r.idRol}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary flex-fill"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/admin/usuarios")}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
