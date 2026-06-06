"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { serviceService } from "../services/serviceService"
import { turnService } from "../services/turnService"
import { cryptoService } from "../services/cryptoService"

export default function SeleccionarServicio() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clientName, documento, docType } = location.state || {}
  const isKiosko = location.pathname.startsWith("/kiosko")
  const basePath = isKiosko ? "/kiosko" : ""

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState("Normal")

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await serviceService.GetAll()
      setServices(response || [])
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los servicios")
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes("deporte") || name.includes("sport")) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    }
    if (name.includes("admin")) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
    if (name.includes("comercial") || name.includes("ventas")) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      )
    }
    if (name.includes("salud") || name.includes("medicina")) {
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    }
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  }

  const handleSelectService = async (serviceId, serviceName) => {
    setRequesting(true)
    setError("")

    const normalizedServiceId = serviceId || 0
    if (!normalizedServiceId || normalizedServiceId <= 0) {
      setError("Servicio inválido.")
      setRequesting(false)
      return
    }

    const publicTurnData = {
      clientDocument: documento,
      clientName: clientName,
      serviceId: normalizedServiceId,
      priority: selectedPriority,
      clientDocumentType: docType || "cedula"
    }

    try {
      let response

      if (window.crypto?.subtle) {
        const publicKey = await cryptoService.GetPublicKey()
        const encryptedPayload = await cryptoService.EncryptPublicTurnPayload(
          publicKey,
          JSON.stringify(publicTurnData)
        )
        response = await turnService.CreatePublicEncrypted(encryptedPayload)
      } else {
        response = await turnService.CreatePublic(publicTurnData)
      }

      if (response) {
        navigate(`${basePath}/confirmacion-turno`, {
          state: {
            turnNumber: response.number,
            serviceId: normalizedServiceId,
            serviceName: serviceName,
            clientName: clientName,
            documento: documento,
            priority: selectedPriority,
            docType: docType || "cedula",
          },
        })
      }
    } catch (err) {
      console.error("Error al crear turno público:", err)

      const backendMessage =
        err.response?.data?.message || err.response?.data?.title || JSON.stringify(err.response?.data ?? {})

      setError(backendMessage || "Error al solicitar el turno. Intente nuevamente.")
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ position: "relative" }}
      >
        <div className="text-center text-white" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ width: "4rem", height: "4rem", borderWidth: "4px" }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="fs-4 fw-semibold">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-4">
          <button className="btn btn-light btn-lg" onClick={() => navigate(`${basePath}/`)} disabled={requesting}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="ms-2">Volver</span>
          </button>
        </div>

        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "900px", margin: "0 auto" }}>
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
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-2">Por favor, elija el servicio</h2>
            </div>

            <div className="text-center mb-4">
              <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                {[
                  { key: "Normal", label: "Normal" },
                  { key: "Embarazada", label: "Embarazada" },
                  { key: "Discapacitado", label: "Discapacitado" },
                  { key: "Mayor", label: "Mayor" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`btn ${selectedPriority === item.key ? "btn-primary" : "btn-outline-primary"} btn-sm rounded-pill`}
                    onClick={() => setSelectedPriority(item.key)}
                    disabled={requesting}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-muted mb-3">Selecciona la condición de prioridad para tu turno.</p>
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill"
                style={{
                  background:
                    "linear-gradient(135deg, var(--kairos-primary-light) 0%, var(--kairos-primary-lighter) 100%)",
                  border: "2px solid var(--kairos-primary)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-gray-800)"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span style={{ color: "var(--kairos-gray-900)", fontWeight: 700 }}>Bienvenido/a, {clientName}</span>
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

            {services.length === 0 ? (
              <div className="text-center py-5">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-gray-400)"
                  strokeWidth="1.5"
                  className="mb-3"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <p className="text-muted fs-5 fw-semibold">No hay servicios disponibles en este momento</p>
              </div>
            ) : (
              <div className="row g-3 mb-4">
                {services.map((service, index) => {
                  const serviceId = service.idService ?? service.IdService
                  const serviceName = service.name ?? service.Name
                  return (
                    <div
                      key={serviceId}
                      className="col-6 col-md-4"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${0.1 + index * 0.05}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <button
                      className="numpad-btn w-100 d-flex flex-column align-items-center justify-content-center gap-2 py-4"
                      onClick={() => handleSelectService(serviceId, serviceName)}
                      disabled={requesting}
                      style={{ minHeight: "140px", fontSize: "0.9rem" }}
                    >
                      <div className="doc-icon" style={{ color: "var(--kairos-primary)", display: "flex" }}>
                        {getServiceIcon(serviceName)}
                      </div>
                      <span className="text-center" style={{ lineHeight: 1.3, fontWeight: 600 }}>
                        {serviceName}
                      </span>
                    </button>
                  </div>
                )})}
              </div>
            )}

            <div className="text-center mt-4">
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-pill"
                style={{
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(251, 146, 60, 0.08) 100%)",
                  border: "2px solid rgba(249, 115, 22, 0.15)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-primary)"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p
                  className="mb-0"
                  style={{
                    color: "var(--kairos-gray-700)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Toque un servicio para continuar
                </p>
              </div>
            </div>

            {requesting && (
              <div
                className="text-center mt-5 pt-4"
                style={{
                  borderTop: "2px solid var(--kairos-gray-200)",
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
                <div
                  className="spinner-border text-primary mb-2"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Procesando...</span>
                </div>
                <p className="text-muted fw-semibold fs-5 mb-0">Generando su turno...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}