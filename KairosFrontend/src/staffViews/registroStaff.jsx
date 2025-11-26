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
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!formData.rolId) {
      setError("Debe seleccionar un rol")
      return
    }

    setLoading(true)
    setError("")

    try {
      await userService.Create({
        name: formData.userName.trim(),
        password: formData.password,
        state: "Activo",
        rolId: Number(formData.rolId),
      })

      setSuccess(true)
      setTimeout(() => navigate("/admin/usuarios"), 1500)
    } catch (err) {
      console.error(err)
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Error al registrar usuario"
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
              {success && <div className="alert alert-success">Registrado exitosamente</div>}

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

                <div className="mb-3">
                  <label className="form-label fw-semibold">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                  <button className="btn btn-primary flex-fill" disabled={loading}>
                    Registrar
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
