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
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-4">
          <button
            className="btn btn-light btn-lg"
            onClick={() => navigate("/ingresar-documento", { state: { docType } })}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="ms-2">Volver</span>
          </button>
        </div>

        <div className="card shadow-lg border-0 fade-in" style={{ maxWidth: "650px", margin: "0 auto" }}>
          <div className="card-body p-5">
            <div className="text-center mb-5">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-2">Registro de Cliente</h2>
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mt-2"
                style={{
                  background: "linear-gradient(135deg, var(--kairos-gray-100) 0%, var(--kairos-gray-50) 100%)",
                  border: "2px solid var(--kairos-gray-200)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-gray-600)"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M7 15h0M7 12h0M7 9h4" />
                </svg>
                <span style={{ color: "var(--kairos-gray-700)", fontWeight: 600, fontSize: "0.95rem" }}>
                  Documento: <strong>{documento}</strong>
                </span>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mb-4" role="alert" style={{ animation: "fadeIn 0.3s ease-out" }}>
                <div className="d-flex align-items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: "1.05rem" }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control form-control-lg"
                  placeholder="Escriba su nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  style={{
                    fontSize: "1.125rem",
                    padding: "1rem 1.25rem",
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mt-2"
                disabled={loading}
                style={{ fontSize: "1.25rem", padding: "1rem" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="ms-2">Registrar y solicitar turno</span>
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
