"use client"

import { useEffect, useState } from "react"
import { turnService } from "../services/turnService"
import { serviceService } from "../services/serviceService"
import { startConnection } from "../services/signalR"
import { useAuth } from "../context/useAuth";

export default function EmpleadoNextTurn() {
  const { user } = useAuth();
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [currentTurn, setCurrentTurn] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  // Load available services
  useEffect(() => {
    loadServices()
    setupSignalR()
  }, [])

  const loadServices = async () => {
    try {
      const response = await serviceService.GetAll()
      // Mostrar solo servicios activos
      const active = response.filter(s => s.state === "Activo")
      setServices(active)
    } catch (err) {
      console.error(err)
      setError("Error cargando servicios.")
    }
  }

  const setupSignalR = async () => {
    try {
      const connection = await startConnection()
      connection.on("TurnUpdated", () => {
        console.log("SignalR: TurnUpdated recibido")
        // No recargamos nada aquí. Solo aviso visual si quieres.
      })
    } catch (err) {
      console.error("Error en SignalR:", err)
    }
  }

  const handleAdvance = async () => {
    if (!selectedService) {
      setError("Debe seleccionar un servicio.");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await turnService.AdvanceByService(
        selectedService.idService,
        user.id
      );

      if (response?.message) {
        // Por ejemplo: "No hay más turnos pendientes"
        setCurrentTurn(null);
        setInfo(response.message);
        return;
      }

      // Turno pasa a "EnAtencion" → lo mostramos como actual
      setCurrentTurn(response);
      setInfo("Turno llamado correctamente.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Error al avanzar turno."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleComplete = async () => {
    if (!selectedService) {
      setError("Debe seleccionar un servicio.");
      return;
    }

    if (!currentTurn) {
      setError("No hay turno en atención para este servicio.");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await turnService.CompleteCurrent(
        selectedService.idService,
        user.id
      );

      if (response?.message) {
        setInfo(response.message);
        return;
      }

      // El turno completado ya NO debe mostrarse como actual
      setCurrentTurn(null);
      setInfo("Turno marcado como atendido.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Error al marcar el turno como atendido."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row g-4">
          {/* Panel de control */}
          <div className="col-lg-5">
            <div className="card shadow-xl border-0 fade-in">
              <div className="card-header bg-gradient-orange text-white py-4">
                <h2 className="mb-0 h3 fw-bold d-flex align-items-center">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="me-3"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  Llamar Siguiente Turno
                </h2>
              </div>

              <div className="card-body p-4">
                {/* Selección de servicio */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Servicio</label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedService?.idService || ""}
                    onChange={(e) => {
                      const svc = services.find((s) => s.idService === Number.parseInt(e.target.value))
                      setSelectedService(svc)
                    }}
                  >
                    <option value="">Seleccione un servicio</option>
                    {services.map((s) => (
                      <option key={s.idService} value={s.idService}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botones */}
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-warning btn-lg d-flex align-items-center justify-content-center"
                    onClick={handleAdvance}
                    disabled={loading || !selectedService}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
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
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Llamar Siguiente Turno
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-success btn-lg d-flex align-items-center justify-content-center"
                    onClick={handleComplete}
                    disabled={loading || !currentTurn}
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
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Marcar como Atendido
                  </button>
                </div>

                {/* Mensajes */}
                {error && (
                  <div className="alert alert-danger alert-kairos mt-4" role="alert">
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
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    {error}
                  </div>
                )}
                {info && (
                  <div className="alert alert-info alert-kairos mt-4" role="alert">
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
                    {info}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Turno Actual */}
          <div className="col-lg-7">
            {currentTurn ? (
              <div className="card shadow-xl border-0 slide-in-right">
                <div className="card-header bg-success text-white py-4">
                  <h3 className="mb-0 h4 fw-bold d-flex align-items-center">
                    <span className="badge bg-white text-success me-3 pulse-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </span>
                    Turno en Atención
                  </h3>
                </div>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <p className="text-muted mb-2 text-uppercase small fw-semibold">Número de Turno</p>
                    <div className="display-1 fw-bold text-gradient-orange">{currentTurn.number}</div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="info-card">
                        <div className="icon-circle bg-primary bg-opacity-10 mb-3">
                          <svg
                            width="24"
                            height="24"
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
                        <p className="text-muted small mb-1">Cliente</p>
                        <p className="fw-bold mb-0 fs-5">{currentTurn.clientName}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-card">
                        <div className="icon-circle bg-success bg-opacity-10 mb-3">
                          <svg
                            width="24"
                            height="24"
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
                        <p className="text-muted small mb-1">Servicio</p>
                        <p className="fw-bold mb-0 fs-5">{currentTurn.serviceName}</p>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="info-card">
                        <div className="icon-circle bg-warning bg-opacity-10 mb-3">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-warning"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <p className="text-muted small mb-1">Estado</p>
                        <span className="badge bg-success fs-6">{currentTurn.state}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card shadow-lg border-0 h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-5">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-muted mb-4 opacity-25"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <h4 className="text-muted mb-2">No hay turno en atención</h4>
                  <p className="text-muted mb-0">Selecciona un servicio y llama al siguiente turno</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
