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

    if (!user?.id) {
      setError("No se pudo determinar el usuario actual.");
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
        setCurrentTurn(null);
        setInfo(response.message);
        return;
      }

      setCurrentTurn(response);
      setInfo("Turno asignado correctamente.");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Error al avanzar turno."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Llamar Siguiente Turno</h2>

      {/* Selección de servicio */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Servicio</label>
        <select
          className="form-select"
          value={selectedService?.idService || ""}
          onChange={(e) => {
            const svc = services.find(s => s.idService === parseInt(e.target.value))
            setSelectedService(svc)
          }}
        >
          <option value="">Seleccione un servicio</option>
          {services.map(s => (
            <option key={s.idService} value={s.idService}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Botón llamar turno */}
      <button
        className="btn btn-primary mb-4"
        onClick={handleAdvance}
        disabled={loading || !selectedService}
      >
        {loading ? "Llamando..." : "Llamar Siguiente Turno"}
      </button>

      {/* Mensajes */}
      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-info">{info}</div>}

      {/* Turno Actual */}
      {currentTurn && (
        <div className="card shadow p-3 mt-3">
          <h4 className="fw-bold">Turno Actual</h4>
          <p className="mb-1"><strong>Número:</strong> {currentTurn.number}</p>
          <p className="mb-1"><strong>Cliente:</strong> {currentTurn.clientName}</p>
          <p className="mb-1"><strong>Servicio:</strong> {currentTurn.serviceName}</p>
          <p className="mb-1"><strong>Estado:</strong> {currentTurn.state}</p>
        </div>
      )}
    </div>
  )
}
