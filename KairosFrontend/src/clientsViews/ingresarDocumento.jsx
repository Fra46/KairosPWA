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
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5" style={{ overflow: "hidden" }}>
      <div className="container">
        <div className="text-center mb-4">
          <button className="btn btn-light btn-lg" onClick={() => navigate("/")}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        </div>

        <div className="card shadow-lg border-0 fade-in">
          <div className="card-body p-5">
            <h2 className="text-center mb-4 kairos-logo-small">Digite su número de documento</h2>

            <div className="mb-4">
              <div className="numpad-display d-flex align-items-center justify-content-center">
                {documento || "0"}
              </div>
            </div>

            {error && (
              <div className="alert alert-danger alert-kairos mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
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
                <button className="numpad-btn w-100 text-danger" onClick={handleClear} disabled={loading}>
                  Borrar
                </button>
              </div>

              <div className="col-4">
                <button className="numpad-btn w-100" onClick={() => handleNumberClick("0")} disabled={loading}>
                  0
                </button>
              </div>

              <div className="col-4">
                <button className="numpad-btn w-100 text-warning" onClick={handleDelete} disabled={loading}>
                  <i className="bi bi-backspace"></i>
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-100" onClick={handleSubmit} disabled={loading || !documento}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Verificando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  OK
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
