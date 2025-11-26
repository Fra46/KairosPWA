"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { clientService } from "../services/clientService"

export default function RegistroCliente() {
  const navigate = useNavigate()
  const location = useLocation()
  const { documento, docType } = location.state || {}

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("El nombre es obligatorio")
      return
    }

    if (!documento) {
      setError("No se encontró el documento. Vuelve a ingresar tu documento.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await clientService.Create({
        id: documento,                 // ← documento del cliente (string)
        name: formData.name.trim(),
        // Estos campos no existen en el DTO, pero el binder los ignora sin problema
        email: formData.email || null,
        phone: formData.phone || null,
        state: "Activo",
      })

      if (response) {
        // Cliente registrado, ir a selección de servicio
        navigate("/seleccionar-servicio", {
          state: {
            clientId: response.idClient,
            clientName: response.name,
            documento,
          },
        })
      }
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.message ||
        "Error al registrar. Intente nuevamente."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5">
      <div className="container">
        <div className="text-center mb-4">
          <button
            className="btn btn-light btn-lg"
            onClick={() => navigate("/ingresar-documento", { state: { docType } })}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        </div>

        <div
          className="card shadow-lg border-0 fade-in"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div className="mb-3">
                <i
                  className="bi bi-person-plus-fill text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
              <h2 className="kairos-logo-small mb-2">Registro de Cliente</h2>
              <p className="text-muted">
                Documento: <strong>{documento}</strong>
              </p>
            </div>

            {error && (
              <div className="alert alert-danger alert-kairos mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre completo</label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-lg"
                  placeholder="Escriba su nombre"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Correo electrónico (opcional)</label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Teléfono (opcional)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control form-control-lg"
                  placeholder="Número de contacto"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Registrar y solicitar turno
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
