"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { turnService } from "../services/turnService"

export default function TurnoDetalle() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const documento = searchParams.get("documento")
  const serviceId = Number(searchParams.get("serviceId"))
  const [turn, setTurn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!documento || serviceId <= 0) {
      setError("No se encontró la referencia del turno. Verifique el código QR o contacte al personal.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    turnService
      .GetPublicStatus(documento, serviceId)
      .then((response) => {
        if (!response) {
          setError("No se encontró un turno activo para este documento y servicio.")
          setTurn(null)
          return
        }

        setTurn(response)
      })
      .catch((err) => {
        console.error(err)
        setError("Error al cargar los datos del turno. Intente nuevamente.")
      })
      .finally(() => setLoading(false))
  }, [documento, serviceId])

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "840px", margin: "0 auto" }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 7v5" />
                  <path d="M9 14l3 3 3-3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-2">Detalle de Turno</h2>
              <p className="text-muted mb-0">Banco - seguimiento rápido de su turno</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="fw-semibold mt-3">Cargando información del turno...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            ) : (
              turn && (
                <div>
                  <div className="turn-card turn-card-active mb-4">
                    <div className="d-flex flex-column align-items-center text-center">
                      <p className="text-muted small mb-2 text-uppercase fw-semibold letter-spacing">Turno activo</p>
                      <div className="turn-number-large mb-3">{turn.number}</div>
                      <p className="mb-1">Servicio: <strong>{turn.serviceName}</strong></p>
                      <p className="mb-0">Prioridad: <strong>{turn.priority}</strong></p>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <div className="card turn-card p-4">
                        <p className="text-muted small mb-1">Cliente</p>
                        <p className="fw-semibold mb-0">{turn.clientName}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="card turn-card p-4">
                        <p className="text-muted small mb-1">Documento</p>
                        <p className="fw-semibold mb-0">{documento}</p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="card turn-card p-4">
                        <p className="text-muted small mb-1">Tipo de documento</p>
                        <p className="fw-semibold mb-0">{turn.clientDocumentType?.replace(/_/g, " ") || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
              <button className="btn btn-outline-primary btn-lg" onClick={() => navigate(-1)}>
                Volver
              </button>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/")}>
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
