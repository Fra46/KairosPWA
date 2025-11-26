"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { serviceService } from "../services/serviceService"
import { turnService } from "../services/turnService"

export default function SeleccionarServicio() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clientId, clientName, documento } = location.state || {}

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [requesting, setRequesting] = useState(false)

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
    if (name.includes("deporte") || name.includes("sport")) return "⚽"
    if (name.includes("admin")) return "👥"
    if (name.includes("desarrollo") || name.includes("desarrollo")) return "📝"
    if (name.includes("comercial")) return "🛒"
    if (name.includes("salud") || name.includes("medicina")) return "🏥"
    if (name.includes("financ") || name.includes("banco")) return "💰"
    return "📋"
  }

  const handleSelectService = async (serviceId, serviceName) => {
    setRequesting(true)
    setError("")

    try {
      // Crear turno público usando documento + servicio
      const response = await turnService.CreatePublic({
        clientDocument: documento,
        clientName: clientName,
        serviceId: serviceId,
      })

      if (response) {
        // Turno creado, mostrar confirmación
        navigate("/confirmacion-turno", {
          state: {
            turnNumber: response.number,
            serviceName: serviceName,
            clientName: clientName,
            documento: documento,
          },
        })
      }
    } catch (err) {
      console.error("Error al crear turno público:", err)

      const backendMessage =
        err.response?.data?.message ||               // excepciones de tu servicio
        err.response?.data?.title ||                 // errores de validación ModelState
        JSON.stringify(err.response?.data ?? {})     // fallback

      setError(
        backendMessage ||
        "Error al solicitar el turno. Intente nuevamente."
      )
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-gradient-primary d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="fs-5">Cargando servicios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5" style={{ overflow: "hidden" }}>
      <div className="container">
        <div className="text-center mb-4">
          <button className="btn btn-light btn-lg" onClick={() => navigate("/")} disabled={requesting}>
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        </div>

        <div className="card shadow-lg border-0 fade-in">
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <h2 className="kairos-logo-small mb-2">Por favor, elija el servicio</h2>
              <p className="text-muted mb-0">
                Bienvenido/a, <strong>{clientName}</strong>
              </p>
            </div>

            {error && (
              <div className="alert alert-danger alert-kairos mb-4" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {services.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: "3rem" }}></i>
                <p className="text-muted mt-3">No hay servicios disponibles en este momento</p>
              </div>
            ) : (
              <div className="row g-4">
                {services.map((service) => (
                  <div key={service.idService} className="col-md-6 col-lg-4">
                    <button
                      className="btn btn-touch btn-touch-primary w-100 d-flex flex-column align-items-center justify-content-center gap-2"
                      onClick={() => handleSelectService(service.idService, service.name)}
                      disabled={requesting}
                    >
                      <span style={{ fontSize: "3rem" }}>{getServiceIcon(service.name)}</span>
                      <span className="text-center">{service.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {requesting && (
              <div className="text-center mt-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Procesando...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Generando su turno...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
