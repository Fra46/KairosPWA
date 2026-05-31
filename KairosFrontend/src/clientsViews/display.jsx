"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import { turnService } from "../services/turnService"
import { startConnection } from "../services/signalR"
import { timeEstimateService } from "../services/timeEstimateService"

export default function Display({ mode: propMode }) {
  const [turns, setTurns] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const location = useLocation()

  // Para detectar nuevos turnos en atención
  const prevTurnIdsRef = useRef([])
  const hasMountedRef = useRef(false)

  const loadTurns = useCallback(async () => {
    try {
      const mode = propMode || (location.pathname.includes("proximos") ? "proximos" : "atencion")

      if (mode === "proximos") {
        const pending = await turnService.GetPending()
        setTurns(pending.slice(0, 8))
      } else {
        // En atención: intentar obtener los turnos cuya state sea EnAtencion
        const data = await turnService.GetAll()
        const inAttention = data.filter((t) => t.state === "EnAtencion")
        setTurns(inAttention.slice(0, 5))
      }
    } catch (err) {
      console.error("Error cargando turnos (pantalla):", err)
      setTurns([])
    }
  }, [propMode, location.pathname])

  const setupSignalR = useCallback(async () => {
    try {
      const connection = await startConnection()
      // Reload turns cuando se actualice un turno en el backend
      connection.on("TurnUpdated", () => {
        // Pequeño delay para que el backend procese completamente
        setTimeout(() => loadTurns(), 100)
      })
      // Actualizar cada 5 segundos como fallback (en caso de que SignalR falle)
      const interval = setInterval(() => loadTurns(), 5000)
      return () => clearInterval(interval)
    } catch (err) {
      console.error("Error en SignalR:", err)
      // Fallback: actualizar cada 5 segundos si SignalR no funciona
      const interval = setInterval(() => loadTurns(), 5000)
      return () => clearInterval(interval)
    }
  }, [loadTurns])

  useEffect(() => {
    const initialLoad = async () => {
      await loadTurns()
      const signalRCleanup = await setupSignalR()
      return signalRCleanup
    }

    let signalRCleanup
    void initialLoad().then((cleanup) => {
      signalRCleanup = cleanup
    })

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timeInterval)
      if (signalRCleanup) signalRCleanup()
    }
  }, [loadTurns, setupSignalR])

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
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  //Reproducir sonido
  const playTurnSound = useCallback(() => {
    try {
      const audio = new Audio("/sounds/turno.mp3")
      audio.play().catch((err) => {
        // Algunos navegadores bloquean el autoplay sin interacción previa
        console.warn("No se pudo reproducir el sonido del turno:", err)
      })
    } catch (err) {
      console.error("Error creando el audio del turno:", err)
    }
  }, [])

  // Anunciar turno con voz (Web Speech API)
  const announceTurn = useCallback((turn) => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return

    const { number, serviceName } = turn
    const text = `Turno ${number}, servicio ${serviceName}`

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 1
    utterance.pitch = 1

    window.speechSynthesis.speak(utterance)
  }, [])

  // Efecto para detectar nuevos turnos y anunciar SOLO los nuevos
  useEffect(() => {
    const currentIds = turns.map((t) => t.id)
    const prevIds = prevTurnIdsRef.current

    // Buscar turnos que SALIERON de la lista (ya fueron atendidos/finalizados)
    const removedTurns = prevIds.filter((id) => !currentIds.includes(id))

    // Buscar turnos NUEVOS que no estaban antes
    const newTurns = turns.filter((t) => !prevIds.includes(t.id))

    // IMPORTANTE: Si es el primer render, no anunciar
    // Solo anunciar si ya estamos montados y hay realmente turnos nuevos
    if (hasMountedRef.current) {
      // Si se removieron turnos significa que alguien fue atendido
      // Anunciar a todos en la lista
      if (removedTurns.length > 0 && newTurns.length === 0) {
        // Turnos fueron reordenados/atendidos, reproducir sonido
        playTurnSound()
        turns.slice(0, 2).forEach((t) => announceTurn(t)) // Anunciar solo los primeros 2
      }
      // Si hay turnos completamente nuevos
      else if (newTurns.length > 0) {
        playTurnSound()
        newTurns.forEach((t) => announceTurn(t))
      }
    }

    prevTurnIdsRef.current = currentIds
    hasMountedRef.current = true
  }, [turns.map((t) => t.id).join(","), playTurnSound, announceTurn])

  // turns ya contiene hasta 5 turnos "EnAtencion"
  const turnsInProgress = turns
  const videoUrl = "/videos/display-evade.mp4"

  // Agrupar turnos por servicio (máximo 2 cajas por servicio)
  const turnsByService = () => {
    const grouped = {}
    turns.forEach((turn) => {
      if (!grouped[turn.serviceId]) {
        grouped[turn.serviceId] = {
          serviceId: turn.serviceId,
          serviceName: turn.serviceName,
          turns: [],
        }
      }
      if (grouped[turn.serviceId].turns.length < 2) {
        grouped[turn.serviceId].turns.push(turn)
      }
    })
    return Object.values(grouped).sort((a, b) => a.serviceId - b.serviceId)
  }

  const serviceGroups = turnsByService()

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "#f5f5f5" }}>
      {/* Sección superior - Video (12 columnas) */}
      <div className="container-fluid px-0" style={{ height: "60vh", background: "#000" }}>
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <video
            width="100%"
            height="100%"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={(e) => console.error("Video error:", e)}
            style={{ display: "block", objectFit: "cover", background: "#1a1a1a" }}
          />

          {/* Header overlay en el video (texto en negro para visibilidad según petición) */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              zIndex: 30,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 style={{ color: "black", margin: 0, fontSize: 20, fontWeight: 700 }}>KAIROS</h2>
            </div>

            <div style={{ textAlign: "right", color: "black", pointerEvents: "none" }}>
              <div style={{ textTransform: "capitalize", fontSize: 14, opacity: 0.95 }}>{formatDate(currentTime)}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{formatTime(currentTime)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior - Turnos por Servicio (2 cajas c/u) */}
      <div className="container-fluid px-4 py-5" style={{ background: "#f5f5f5", flex: 1 }}>
        {turnsInProgress.length > 0 ? (
          <div style={{ width: "100%" }}>
            <div className="text-center mb-4">
              <span
                className="badge pulse-badge"
                style={{
                  background: "linear-gradient(135deg, var(--kairos-success) 0%, #059669 100%)",
                  fontSize: "1.1rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "999px",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.18)",
                  display: "inline-block",
                  fontWeight: 700,
                }}
              >
                {propMode === "proximos" || location.pathname.includes("proximos") ? "PRÓXIMOS" : "EN ATENCIÓN"}
              </span>
            </div>

            {/* Grid de servicios */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                maxWidth: "100%",
              }}
            >
              {serviceGroups.map((service) => (
                <div
                  key={service.serviceId}
                  style={{
                    border: "2px solid rgba(243, 160, 56, 0.2)",
                    borderRadius: 16,
                    padding: "1.5rem",
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {/* Encabezado del servicio */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: 16, fontWeight: 700, color: "var(--kairos-primary)" }}>
                      {service.serviceName}
                    </h3>
                    <div style={{ fontSize: 12, color: "var(--kairos-gray-600)", fontWeight: 500 }}>
                      {service.turns.length} caja{service.turns.length !== 1 ? "s" : ""} activa{service.turns.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Cajas de atención (máximo 2) */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: service.turns.length === 1 ? "1fr" : "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    {service.turns.map((turn, boxIndex) => (
                      <div
                        key={`${turn.id}-box-${boxIndex}`}
                        style={{
                          padding: "1rem",
                          borderRadius: 12,
                          border: "2px solid rgba(243, 160, 56, 0.12)",
                          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%)",
                          boxShadow: "0 8px 20px rgba(16,24,40,0.06)",
                          textAlign: "center",
                          minHeight: 130,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        {/* Etiqueta de caja */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "var(--kairos-primary)",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Caja {boxIndex + 1}
                        </div>

                        {/* Número de turno */}
                        <div
                          style={{
                            fontSize: 52,
                            fontWeight: 900,
                            color: "var(--kairos-primary)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {turn.number}
                        </div>

                        {/* Nombre cliente */}
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kairos-gray-900)", marginBottom: "0.5rem" }}>
                          {turn.clientName}
                        </div>

                        {/* Tiempo estimado */}
                        <div style={{ fontSize: 11, color: "var(--kairos-primary)", fontWeight: 600 }}>
                          ⏱️ Est. ~{timeEstimateService.formatEstimatedTime(
                            timeEstimateService.getEstimatedTime(turns.indexOf(turn) + 1, turn.serviceId, turns.length)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" className="mb-3">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-black fw-bold fs-5 mb-0">No hay turnos en atención</p>
          </div>
        )}
      </div>
    </div>
  )
}
