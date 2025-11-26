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

  // Cargar roles desde /api/rols
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

    // Validaciones básicas
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
      // Usamos directamente el rolId seleccionado
      const rolId = Number(formData.rolId)

      await userService.Create({
        userName: formData.userName.trim(),
        password: formData.password,
        state: "Activo",
        rolId,
      })

      setSuccess(true)

      // Ir a la lista de usuarios
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0 fade-in">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0 h4">Registrar Personal</h2>
            </div>

            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && (
                <div className="alert alert-success">
                  Usuario registrado correctamente.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Usuario */}
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

                {/* Contraseñas */}
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

                {/* Rol */}
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

                {/* Botones */}
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
    </div>
  )
}
