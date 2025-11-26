"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { clientService } from "../services/clientService"

export default function IngresarDocumento() {
  const navigate = useNavigate()
  const location = useLocation()
  const docType = location.state?.docType || "cedula"

  const [documento, setDocumento] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleNumberClick = (num) => {
    if (documento.length < 15) {
      setDocumento(documento + num)
    }
  }

  const handleClear = () => {
    setDocumento("")
    setError("")
  }

  const handleDelete = () => {
    setDocumento(documento.slice(0, -1))
    setError("")
  }

  const handleSubmit = async () => {
    if (!documento || documento.length < 6) {
      setError("Por favor ingrese un número de documento válido")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Buscar cliente por su Id (documento)
      const response = await clientService.GetByIdAlternative(documento)

      if (response) {
        // Cliente existe, ir a selección de servicio
        navigate("/seleccionar-servicio", {
          state: {
            clientId: response.idClient, // PK interno
            clientName: response.name,
            documento,                   // el documento digitado
          },
        })
      }
    } catch (err) {
      // Cliente no existe → ir a registro
      if (err.response?.status === 404) {
        navigate("/registro-cliente", {
          state: { documento, docType },
        })
      } else {
        console.error(err)
        setError("Error al verificar el documento. Intente nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-4">
          <button className="btn btn-light btn-lg" onClick={() => navigate("/")} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="ms-2">Volver</span>
          </button>
        </div>

        <div className="card shadow-lg border-0 fade-in" style={{ maxWidth: "600px", margin: "0 auto" }}>
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-2">Digite su número de documento</h2>
              <p className="text-muted mb-0">Ingrese su documento para continuar</p>
            </div>

            <div className="mb-4">
              <div className="numpad-display">{documento || "0"}</div>
            </div>

            {error && (
              <div
                className="alert alert-danger mb-4"
                role="alert"
                style={{
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
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

            <div className="row g-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div key={num} className="col-4">
                  <button
                    className="numpad-btn w-100"
                    onClick={() => handleNumberClick(num.toString())}
                    disabled={loading}
                  >
                    {num}
                  </button>
                </div>
              ))}

              <div className="col-4">
                <button
                  className="numpad-btn w-100"
                  onClick={handleClear}
                  disabled={loading}
                  style={{ color: "var(--kairos-danger)", fontWeight: 700, fontSize: "1.25rem" }}
                >
                  Borrar
                </button>
              </div>

              <div className="col-4">
                <button className="numpad-btn w-100" onClick={() => handleNumberClick("0")} disabled={loading}>
                  0
                </button>
              </div>

              <div className="col-4">
                <button
                  className="numpad-btn w-100"
                  onClick={handleDelete}
                  disabled={loading}
                  style={{ fontSize: "1.5rem" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-100"
              onClick={handleSubmit}
              disabled={loading || !documento}
              style={{ fontSize: "1.25rem", padding: "1rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Verificando...
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="ms-2">Continuar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
