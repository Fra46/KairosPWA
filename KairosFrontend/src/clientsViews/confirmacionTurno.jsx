"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function ConfirmacionTurno() {
  const location = useLocation()
  const navigate = useNavigate()
  const { turnNumber, serviceName, clientName, documento } = location.state || {}
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    if (!turnNumber) {
      navigate("/")
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [turnNumber, navigate])

  if (!turnNumber) return null

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-lg border-0 fade-in">
              <div className="card-body p-5 text-center">
                {/* Encabezado */}
                <div className="mb-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "88px",
                      height: "88px",
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                      boxShadow: "var(--shadow-primary)",
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>

                  <h1 className="kairos-logo-small mb-1">¡Turno Confirmado!</h1>
                  <p className="text-muted mb-0">Se ha generado tu turno correctamente</p>
                </div>

                {/* Número de turno destacado */}
                <div className="my-4">
                  <div className="turn-card p-4 turn-card-active">
                    <div className="d-flex flex-column align-items-center">
                      <p className="text-muted small mb-2 text-uppercase fw-semibold letter-spacing">Tu número de turno</p>
                      <div className="turn-number-large mb-2">{turnNumber}</div>
                      <p className="turn-info mb-0">Servicio: <span className="fw-bold">{serviceName}</span></p>
                    </div>
                  </div>
                </div>

                {/* Detalles compactos */}
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-4">
                    <div className="card turn-card text-start">
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Cliente</p>
                        <p className="fw-semibold mb-0">{clientName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="card turn-card text-start">
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Documento</p>
                        <p className="fw-semibold mb-0">{documento}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="card turn-card text-start">
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Tiempo estimado</p>
                        <p className="fw-semibold mb-0">En espera</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="alert alert-info alert-kairos border-0 mb-4">
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
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <strong>Por favor, espere su turno.</strong> Será notificado cuando esté por ser atendido.
                </div>

                {/* Contador / CTA */}
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
                  <div className="text-center">
                    <p className="text-muted small mb-1">Regresando al inicio en</p>
                    <div
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.06))",
                        border: "3px solid rgba(249,115,22,0.12)",
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "var(--kairos-primary)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      {countdown}
                    </div>
                  </div>

                  <div className="text-center">
                    <button className="btn btn-outline-primary btn-lg" onClick={() => navigate("/")}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="me-2"
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      Volver al Inicio Ahora
                    </button>
                  </div>
                </div>

                {/* Nota pequeña */}
                <p className="text-muted small mt-4 mb-0">Si necesita asistencia, consulte con el personal o pulse el botón de ayuda en pantalla.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}