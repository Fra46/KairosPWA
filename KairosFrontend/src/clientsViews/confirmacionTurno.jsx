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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-radial py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-xl border-0 fade-in scale-in">
              <div className="card-body p-5 text-center">
                {/* Icono de éxito animado */}
                <div className="mb-4 position-relative">
                  <div className="success-checkmark">
                    <div className="check-icon">
                      <span className="icon-line line-tip"></span>
                      <span className="icon-line line-long"></span>
                      <div className="icon-circle"></div>
                      <div className="icon-fix"></div>
                    </div>
                  </div>
                </div>

                {/* Título */}
                <h1 className="display-4 fw-bold text-gradient-orange mb-3">¡Turno Confirmado!</h1>

                <p className="text-muted fs-5 mb-4">Tu turno ha sido registrado exitosamente</p>

                {/* Número de turno destacado */}
                <div className="card bg-gradient-orange text-white mb-4 shadow-lg">
                  <div className="card-body py-4">
                    <p className="text-white-50 mb-2 text-uppercase small fw-semibold letter-spacing">
                      Tu número de turno es
                    </p>
                    <h2 className="display-1 fw-bold mb-0 glow-text">{turnNumber}</h2>
                  </div>
                </div>

                {/* Detalles del turno */}
                <div className="bg-light rounded-3 p-4 mb-4 text-start">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <div className="icon-circle-small bg-primary bg-opacity-10 me-3">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-primary"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted small mb-0">Cliente</p>
                          <p className="fw-semibold mb-0">{clientName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <div className="icon-circle-small bg-success bg-opacity-10 me-3">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-success"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted small mb-0">Servicio</p>
                          <p className="fw-semibold mb-0">{serviceName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex align-items-center">
                        <div className="icon-circle-small bg-info bg-opacity-10 me-3">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-info"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted small mb-0">Documento</p>
                          <p className="fw-semibold mb-0">{documento}</p>
                        </div>
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
                  <strong>Por favor, espera tu turno.</strong> Recibirás una notificación cuando sea tu momento de ser
                  atendido.
                </div>

                {/* Contador regresivo */}
                <div className="text-center mb-3">
                  <p className="text-muted small mb-2">Regresando al inicio en</p>
                  <div className="countdown-circle mx-auto">{countdown}</div>
                </div>

                {/* Botón manual */}
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
          </div>
        </div>
      </div>
    </div>
  )
}
