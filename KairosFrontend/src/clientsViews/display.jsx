"use client"

import { useState, useEffect } from "react"
import { startConnection } from "../services/signalR"
import { turnService } from "../services/turnService"

export default function DisplayView() {
  const [turns, setTurns] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTurns()
    setupSignalR()

    // Actualizar reloj cada segundo
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(clockInterval)
  }, [])

  const loadTurns = async () => {
    try {
      // 1) últimos turnos llamados (atendidos)
      const recentCalled = await turnService.GetRecentCalled(20)

      // 2) turnos pendientes actuales
      const pending = await turnService.GetPending()

      // Normalizamos:
      // - los llamados recientes se mostrarán como "En atención"
      // - los pendientes se quedan con su estado real
      const normalizedCalled = (recentCalled || []).map((t) => ({
        ...t,
        state: "En atención",
      }))

      const normalizedPending = pending || []

      const all = [...normalizedCalled, ...normalizedPending]

      setTurns(all)
    } catch (err) {
      console.error("Error loading turns for display:", err)
    } finally {
      setLoading(false)
    }
  }


  const setupSignalR = async () => {
    try {
      const connection = await startConnection()

      connection.on("TurnUpdated", () => {
        loadTurns()
      })
    } catch (err) {
      console.error("SignalR connection error:", err)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const turnsEnAtencion = turns.filter((t) => t.state === "En atención")
  const turnsPendientes = turns.filter((t) => t.state === "Pendiente")

  return (
    <div className="display-container">
      <div className="container-fluid py-4">
        {/* Header con logo y fecha/hora */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-3"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h1 className="kairos-logo mb-0">KAIROS</h1>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <div className="text-white">
              <div className="fs-2 fw-bold">{formatTime(currentTime)}</div>
              <div className="fs-6 text-capitalize">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-light"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Turnos en atención */}
            {turnsEnAtencion.length > 0 && (
              <div className="mb-4">
                <h2 className="text-white mb-3 fs-3 fw-bold">
                  <i className="bi bi-megaphone me-2"></i>
                  EN ATENCIÓN
                </h2>
                <div className="row g-3">
                  {turnsEnAtencion.map((turn) => (
                    <div key={turn.idTurn} className="col-md-6 col-lg-4">
                      <div className="display-turn-card fade-in">
                        <div className="display-turn-number pulse">
                          {turn.number}
                        </div>
                        <div className="display-service-name mt-2">
                          {turn.serviceName}
                        </div>
                        <div className="text-muted mt-2">
                          <i className="bi bi-person me-2"></i>
                          {turn.clientName || "Cliente"}
                        </div>
                        <div className="text-muted small mt-1">
                          <i className="bi bi-clock-history me-1"></i>
                          Llamado recientemente
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Turnos pendientes */}
            <div>
              <h2 className="text-white mb-3 fs-3 fw-bold">
                <i className="bi bi-list-ol me-2"></i>
                PENDIENTES
              </h2>
              {turnsPendientes.length === 0 ? (
                <div className="alert alert-light bg-opacity-10 text-black text-center">
                  No hay turnos pendientes en este momento.
                </div>
              ) : (
                <div className="row g-3">
                  {turnsPendientes.map((turn) => (
                    <div key={turn.idTurn} className="col-sm-6 col-md-4 col-lg-3">
                      <div className="display-turn-card small fade-in">
                        <div className="display-turn-number-sm">
                          {turn.number}
                        </div>
                        <div className="display-service-name-sm mt-2">
                          {turn.serviceName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
