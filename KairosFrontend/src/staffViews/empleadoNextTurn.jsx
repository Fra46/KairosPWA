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

  // Lista local de turnos llamados (persistida por user + service)
  const [calledTurns, setCalledTurns] = useState([])

  // Helper para obtener número de documento con múltiples fallbacks
  const getDocument = (t) => {
    if (!t) return ""
    const doc = (
      t.document ||
      t.documentNumber ||
      t.documento ||
      t.dni ||
      t.cedula ||
      t.clientDocument ||
      t.identification ||
      ""
    )
    console.log("getDocument result:", doc, "from turn:", t)
    return doc
  }

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
        // Aquí podrías agregar algún refresco si luego lo necesitas
      })
    } catch (err) {
      console.error("Error en SignalR:", err)
    }
  }

  // Cargar último servicio seleccionado desde localStorage
  useEffect(() => {
    if (!services.length) return;

    const lastServiceId = localStorage.getItem("kairos_last_service");
    if (lastServiceId) {
      const svc = services.find(
        (s) => s.idService === Number.parseInt(lastServiceId)
      );
      if (svc) {
        setSelectedService(svc);
      }
    }
  }, [services]);

  // Generador de key para persistir llamados por usuario+servicio
  const calledKey = () =>
    `kairos_called_turns_${user?.id ?? "anon"}_${selectedService?.idService ?? "none"}`

  // Cargar lista de turnos llamados desde localStorage cuando cambia servicio o user
  useEffect(() => {
    if (!user || !selectedService) {
      setCalledTurns([])
      return
    }
    try {
      const raw = localStorage.getItem(calledKey())
      if (raw) {
        setCalledTurns(JSON.parse(raw))
      }
    } catch (e) {
      console.error("Error cargando turnos llamados:", e)
    }
  }, [user, selectedService])

  // Cargar turno actual en atención para el empleado y servicio seleccionados
  useEffect(() => {
    const fetchCurrentTurn = async () => {
      if (!selectedService || !user?.id) return;

      try {
        setLoading(true);
        setError("");
        const response = await turnService.GetCurrent(
          selectedService.idService,
          user.id
        );
        setCurrentTurn(response);
        // si viene un turno actual, asegurarse que esté también en la lista local
        if (response) {
          setCalledTurns((prev) => {
            const id = response.idTurn ?? response.id ?? response._id ?? response.turnId
            if (!prev.find((t) => (t.idTurn ?? t.id ?? t._id ?? t.turnId) === id)) {
              const next = [response, ...prev]
              try { localStorage.setItem(calledKey(), JSON.stringify(next)) } catch (e) {}
              return next
            }
            return prev
          })
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // No hay turno en atención para este servicio y usuario
          setCurrentTurn(null);
          setInfo(err.response?.data?.message || "");
        } else {
          console.error(err);
          setError(
            err.response?.data?.message ||
            "Error al cargar el turno actual."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentTurn();
  }, [selectedService, user]);

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
      // agregar a lista local (persistida)
      setCalledTurns((prev) => {
        const id = response.idTurn ?? response.id ?? response._id ?? response.turnId
        if (prev.find((t) => (t.idTurn ?? t.id ?? t._id ?? t.turnId) === id)) {
          return prev
        }
        const next = [response, ...prev]
        try { localStorage.setItem(calledKey(), JSON.stringify(next)) } catch (e) {}
        return next
      })
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
      // Intentar completar por id si el servicio lo provee, si no usar CompleteCurrent como fallback
      const turnId = currentTurn.idTurn ?? currentTurn.id ?? currentTurn._id ?? currentTurn.turnId
      let response
      if (typeof turnService.CompleteById === "function" && turnId) {
        response = await turnService.CompleteById(turnId)
      } else {
        response = await turnService.CompleteCurrent(
          selectedService.idService,
          user.id
        );
      }

      if (response?.message) {
        setInfo(response.message);
        return;
      }

      // El turno completado ya NO debe mostrarse como actual
      setCurrentTurn(null);
      // eliminar de lista local
      setCalledTurns((prev) => {
        const next = prev.filter((t) => {
          const id = t.idTurn ?? t.id ?? t._id ?? t.turnId
          return id !== turnId
        })
        try { localStorage.setItem(calledKey(), JSON.stringify(next)) } catch (e) {}
        return next
      })
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

  // Persistir lista local cuando cambie (por si hay cambios fuera del flujo anterior)
  useEffect(() => {
    try {
      if (user && selectedService) {
        localStorage.setItem(calledKey(), JSON.stringify(calledTurns))
      }
    } catch (e) {
      console.error("Error guardando turnos llamados:", e)
    }
  }, [calledTurns])

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row g-4">
          {/* Panel de control */}
          <div className="col-lg-5">
            <div className="card shadow-xl border-0 fade-in rounded-5">
              <div className="card-header bg-gradient-orange text-white py-3 d-flex align-items-center">
                <div className="icon-circle bg-gradient-orange-soft bg-opacity-10 me-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
                <h2 className="h5 mb-0 fw-bold">
                  <span className="d-inline-block border-start border-3 border-warning me-2"></span>
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
                      const value = e.target.value;

                      if (!value) {
                        setSelectedService(null);
                        localStorage.removeItem("kairos_last_service");
                        return;
                      }

                      const svc = services.find(
                        (s) => s.idService === Number.parseInt(value)
                      );

                      setSelectedService(svc || null);

                      if (svc) {
                        localStorage.setItem(
                          "kairos_last_service",
                          String(svc.idService)
                        );
                      }
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
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
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
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Marcar como Atendido
                      </>
                    )}
                  </button>
                </div>

                {/* Lista de turnos llamados localmente */}
                {calledTurns?.length > 0 && (
                  <div className="mt-4">
                    <label className="form-label fw-semibold">Turnos llamados</label>
                    <div className="list-group">
                      {calledTurns.map((t) => {
                        const id = t.idTurn ?? t.id ?? t._id ?? t.turnId
                        return (
                          <button
                            key={id}
                            type="button"
                            className={"list-group-item list-group-item-action d-flex justify-content-between align-items-center " + ( (currentTurn && ((currentTurn.idTurn ?? currentTurn.id ?? currentTurn._id ?? currentTurn.turnId) === id)) ? "active" : "" )}
                            onClick={() => {
                              setCurrentTurn(t)
                              setInfo("Turno seleccionado desde la lista local.")
                              setError("")
                            }}
                          >
                            <div>
                              <strong className="me-2">#{t.number}</strong>
                              <div>
                                <small className="text-muted d-block">{t.clientName}</small>
                                {getDocument(t) && (
                                  <small className="text-muted">Doc: {getDocument(t)}</small>
                                )}
                              </div>
                            </div>
                            <div className="text-end">
                              <small className="d-block">{t.serviceName}</small>
                              <small className="badge bg-secondary">{t.state}</small>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Mensajes de estado */}
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
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
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
            <div className="card shadow-xl border-0 fade-in delay-1 rounded-5">
              <div className="card-header bg-gradient-orange text-white py-3 d-flex align-items-center">
                <div className="icon-circle bg-gradient-orange-soft bg-opacity-10 me-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 className="h5 mb-0 fw-bold text-white">Turno en Atención</h2>
                </div>
              </div>

              <div className="card-body p-4">
                {currentTurn ? (
                  <div className="turno-actual-container">
                    <div className="row g-4 align-items-center">
                      <div className="col-md-4">
                        <div className="turno-badge bg-gradient-orange text-white text-center p-4 rounded-4 shadow-sm">
                          <p className="mb-1 text-uppercase small opacity-75 text-black">
                            Turno
                          </p>
                          <h1 className="display-3 fw-black mb-0 text-black">
                            {currentTurn.number}
                          </h1>
                        </div>
                      </div>

                      <div className="col-md-8">
                        <div className="row g-3">
                          <div className="col-12">
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
                                  <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
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
                                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                              </div>
                              <p className="text-muted small mb-1">Documento</p>
                              <p className="fw-bold mb-0">{getDocument(currentTurn) || <span className="text-muted">No disponible</span>}</p>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="info-card">
                              <div className="icon-circle bg-info bg-opacity-10 mb-3">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-info"
                                >
                                  <path d="M4 6h16"></path>
                                  <path d="M4 10h16"></path>
                                  <path d="M4 14h16"></path>
                                  <path d="M4 18h16"></path>
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
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="icon-circle mb-3">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <h4 className="text-muted mb-2">No hay turno en atención</h4>
                    <p className="text-muted mb-0">
                      Selecciona un servicio y llama al siguiente turno
                    </p>
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
