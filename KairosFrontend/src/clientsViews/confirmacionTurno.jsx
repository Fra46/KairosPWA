"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"

export default function ConfirmacionTurno() {
  const location = useLocation()
  const navigate = useNavigate()
  const { turnNumber, serviceName, clientName, documento, serviceId, priority, docType } = location.state || {}
  const [countdown, setCountdown] = useState(15)
  const [ticketUrl, setTicketUrl] = useState("")
  const isKiosk = location.pathname.startsWith("/kiosko/")
  const basePath = isKiosk ? "/kiosko" : ""

  const formatDocumentTypeLabel = (value) => {
    if (!value) return "Cédula"
    const map = {
      cedula: "Cédula de Ciudadanía",
      cedula_extranjera: "Cédula de Extranjería",
      tarjeta_identidad: "Tarjeta de Identidad",
      pasaporte: "Pasaporte",
      licencia_conduccion: "Licencia de Conducción",
      ppt: "PPT",
    }
    return map[value] || value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  useEffect(() => {
    if (!turnNumber) {
      navigate(`${basePath}/`)
      return
    }

    if (documento && serviceId) {
      const baseUrl = `${window.location.origin}`
      setTicketUrl(
        `${baseUrl}/turno-detalle?documento=${encodeURIComponent(documento)}&serviceId=${encodeURIComponent(serviceId)}`
      )
    }

    // Solo auto-redirigir si NO es kiosko
    if (!isKiosk) {
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
    }
  }, [turnNumber, documento, serviceId, navigate, isKiosk])

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
                  <p className="text-muted mb-1">Banco - gestión de turnos</p>
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
                <div className="row gx-3 gy-3 mb-4 align-items-stretch justify-content-center">
                  <div className="col-6 col-md-2">
                    <div className="card turn-card text-start" style={{ padding: "1rem 1rem" }}>
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Cliente</p>
                        <p className="fw-semibold mb-0">{clientName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <div className="card turn-card text-start" style={{ padding: "1rem 1rem" }}>
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Documento</p>
                        <p className="fw-semibold mb-0">{documento}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <div className="card turn-card text-start" style={{ padding: "1rem 1rem" }}>
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Tipo de documento</p>
                        <p className="fw-semibold mb-0">{formatDocumentTypeLabel(docType)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <div className="card turn-card text-start" style={{ padding: "1rem 1rem" }}>
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Prioridad</p>
                        <p className="fw-semibold mb-0">{priority || "Normal"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-2">
                    <div className="card turn-card text-start" style={{ padding: "1rem 1rem" }}>
                      <div className="turn-card-body">
                        <p className="text-muted small mb-1">Tiempo estimado</p>
                        <p className="fw-semibold mb-0">En espera</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket de impresión tipo recibo */}
                <div className="ticket-print-area d-none d-print-block" aria-hidden="true">
                  <div className="receipt-ticket">
                    <div className="receipt-header mb-3">
                      <div className="receipt-title">Kairos Banco</div>
                      <div className="receipt-subtitle">Comprobante de Turno</div>
                    </div>
                    <div className="receipt-body">
                      <div className="receipt-row receipt-center mb-3">
                        <div className="receipt-turn-number">{turnNumber}</div>
                      </div>
                      <div className="receipt-row mb-2">
                        <span className="receipt-label">Servicio</span>
                        <span>{serviceName}</span>
                      </div>
                      <div className="receipt-row mb-2">
                        <span className="receipt-label">Cliente</span>
                        <span>{clientName}</span>
                      </div>
                      <div className="receipt-row mb-2">
                        <span className="receipt-label">Documento</span>
                        <span>{documento}</span>
                      </div>
                      <div className="receipt-row mb-2">
                        <span className="receipt-label">Tipo documento</span>
                        <span>{formatDocumentTypeLabel(docType)}</span>
                      </div>
                      <div className="receipt-row mb-2">
                        <span className="receipt-label">Prioridad</span>
                        <span>{priority || "Normal"}</span>
                      </div>
                      <div className="receipt-row mb-2">
                        <span className="receipt-label">Consulta</span>
                        <span>{ticketUrl}</span>
                      </div>
                    </div>
                    <div className="receipt-footer mt-4">
                      <p className="mb-2">Presenta este recibo en el punto de atención al momento de tu turno.</p>
                      <p className="small mb-0">Sujeto a horario de atención y disponibilidad del servicio.</p>
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

                {/* Botón de impresión y volver (solo kiosko) */}
                {isKiosk && (
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-primary btn-lg rounded-4 w-100"
                        onClick={() => window.print()}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <polyline points="6 9 6 2 18 2 18 9"></polyline>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                          <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Imprimir Turno
                      </button>
                    </div>
                    <div className="col-12 col-md-6">
                      <button
                        className="btn btn-outline-primary btn-lg rounded-4 w-100"
                        onClick={() => navigate(`${basePath}/home`)}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <path d="M19 12H5"></path>
                          <polyline points="12 19 5 12 12 5"></polyline>
                          <path d="M5 12h14"></path>
                        </svg>
                        Volver al inicio del kiosko
                      </button>
                    </div>
                  </div>
                )}

                {/* Contador / CTA */}
                {!isKiosk && (
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
                      <button className="btn btn-outline-primary btn-lg" onClick={() => navigate(`${basePath}/`)}>
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
                )}

                {isKiosk && (
                  <div className="alert alert-warning border-0 mb-4">
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
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <strong>Modo Kiosko:</strong> Su turno ha sido confirmado. Por favor, retire el comprobante impreso.
                  </div>
                )}

                {/* Nota pequeña */}
                <p className="text-muted small mt-4 mb-0">Si necesita asistencia, consulte con el personal o pulse el botón de ayuda en pantalla.</p>
                {ticketUrl && (
                  <div className="mt-4 p-4 rounded-4" style={{ background: "rgba(247, 115, 22, 0.09)" }}>
                    <p className="fw-semibold mb-3">Escanee para ver el estado de su turno</p>
                    <div className="d-flex justify-content-center mb-3">
                      <div style={{ background: "white", padding: "1rem", borderRadius: "1rem" }}>
                        <QRCode value={ticketUrl} size={180} />
                      </div>
                    </div>
                    <p className="small text-muted mb-0">También puede visitar:</p>
                    <a href={ticketUrl} target="_blank" rel="noreferrer" className="d-block text-decoration-none fw-semibold">
                      {ticketUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}