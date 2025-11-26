"use client"

import { useEffect, useState } from "react"
import { turnService } from "../services/turnService"
import { startConnection } from "../services/signalR"

export default function Display() {
  const [turns, setTurns] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    loadTurns()
    setupSignalR()

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timeInterval)
  }, [])

  const loadTurns = async () => {
    try {
      const data = await turnService.GetAll()
      const activeOrInProgress = data.filter((t) => t.state === "Pendiente" || t.state === "EnAtencion")
      setTurns(activeOrInProgress)
    } catch (err) {
      console.error("Error cargando turnos:", err)
    }
  }

  const setupSignalR = async () => {
    try {
      const connection = await startConnection()
      connection.on("TurnUpdated", () => {
        console.log("Display: Turno actualizado")
        loadTurns()
      })
    } catch (err) {
      console.error("Error en SignalR:", err)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const turnsInProgress = turns.filter((t) => t.state === "EnAtencion")
  const turnsPending = turns.filter((t) => t.state === "Pendiente")

  return (
    <div className="min-vh-100 bg-gradient-display py-4">
      <div className="container-fluid">
        {/* Header con reloj */}
        <div className="display-header mb-4">
          <div className="row align-items-center">
            <div className="col-md-4">
              <div className="d-flex align-items-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white me-3"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <h1 className="display-4 fw-bold text-white mb-0 glow-text">KAIROS</h1>
                  <p className="text-white-50 mb-0 small">Sistema de Gestión de Turnos</p>
                </div>
              </div>
            </div>
            <div className="col-md-8 text-md-end">
              <div className="display-clock">
                <div className="clock-time text-white fw-bold">{formatTime(currentTime)}</div>
                <div className="clock-date text-white-50">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Turnos en atención */}
        <div className="mb-4">
          <div className="section-header mb-3">
            <h2 className="text-white fw-bold d-flex align-items-center">
              <span className="badge bg-success me-3 pulse-badge">{turnsInProgress.length}</span>
              EN ATENCIÓN
            </h2>
          </div>

          {turnsInProgress.length === 0 ? (
            <div className="card glass-card text-center py-5">
              <div className="card-body">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted mb-3 opacity-50"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="text-white-50 mb-0 fs-5">No hay turnos en atención en este momento</p>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {turnsInProgress.map((turn) => (
                <div key={turn.idTurn} className="col-md-6 col-lg-4">
                  <div className="turn-card turn-card-active">
                    <div className="turn-card-header">
                      <span className="badge bg-success mb-2">EN ATENCIÓN</span>
                      <div className="turn-number-large">{turn.number}</div>
                    </div>
                    <div className="turn-card-body">
                      <div className="turn-info-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                        <span>{turn.serviceName}</span>
                      </div>
                      <div className="turn-info-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{turn.clientName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Turnos pendientes */}
        <div>
          <div className="section-header mb-3">
            <h2 className="text-white fw-bold d-flex align-items-center">
              <span className="badge bg-warning text-dark me-3">{turnsPending.length}</span>
              PENDIENTES
            </h2>
          </div>

          {turnsPending.length === 0 ? (
            <div className="card glass-card text-center py-5">
              <div className="card-body">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted mb-3 opacity-50"
                >
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p className="text-white-50 mb-0 fs-5">No hay turnos pendientes</p>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {turnsPending.slice(0, 6).map((turn) => (
                <div key={turn.idTurn} className="col-md-6 col-lg-4 col-xl-3">
                  <div className="turn-card turn-card-pending">
                    <div className="turn-card-header">
                      <span className="badge bg-warning text-dark mb-2">PENDIENTE</span>
                      <div className="turn-number-medium">{turn.number}</div>
                    </div>
                    <div className="turn-card-body">
                      <div className="turn-info-item">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                        <span className="small">{turn.serviceName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {turnsPending.length > 6 && (
            <div className="text-center mt-3">
              <span className="badge bg-secondary fs-6 px-4 py-2">+{turnsPending.length - 6} turnos más en espera</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
