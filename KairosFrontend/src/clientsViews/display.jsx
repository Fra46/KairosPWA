"use client"

import { useEffect, useState, useRef } from "react"
import { turnService } from "../services/turnService"
import { startConnection } from "../services/signalR"

export default function Display() {
  const [turns, setTurns] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  // Para detectar nuevos turnos en atención
  const prevTurnIdsRef = useRef([])
  const hasMountedRef = useRef(false)

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
      // Trae todos los turnos y filtra los que están "EnAtencion"
      const data = await turnService.GetAll()
      const inAttention = data.filter((t) => t.state === "EnAtencion")
      // Mantener sólo los primeros 5
      setTurns(inAttention.slice(0, 5))
    } catch (err) {
      console.error("Error cargando turnos (pantalla):", err)
      setTurns([])
    }
  }

  const setupSignalR = async () => {
    try {
      const connection = await startConnection()
      connection.on("TurnUpdated", () => {
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
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  //Reproducir sonido
  const playTurnSound = () => {
    try {
      const audio = new Audio("/sounds/turno.mp3")
      audio.play().catch((err) => {
        // Algunos navegadores bloquean el autoplay sin interacción previa
        console.warn("No se pudo reproducir el sonido del turno:", err)
      })
    } catch (err) {
      console.error("Error creando el audio del turno:", err)
    }
  }

  // Anunciar turno con voz (Web Speech API)
  const announceTurn = (turn) => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return

    const { number, serviceName } = turn
    const text = `Turno ${number}, servicio ${serviceName}`

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 1
    utterance.pitch = 1

    window.speechSynthesis.speak(utterance)
  }

  // Efecto para detectar nuevos turnos "EnAtencion"
  useEffect(() => {
    const currentIds = turns.map((t) => t.id)
    const prevIds = prevTurnIdsRef.current

    // Buscar turnos nuevos que no estaban antes
    const newTurns = turns.filter((t) => !prevIds.includes(t.id))

    // Evitar que suene en el primer render (solo queremos cambios posteriores)
    if (hasMountedRef.current && newTurns.length > 0) {
      playTurnSound()
      newTurns.forEach((t) => announceTurn(t))
    }

    prevTurnIdsRef.current = currentIds
    hasMountedRef.current = true
  }, [turns])

  // turns ya contiene hasta 5 turnos "EnAtencion"
  const turnsInProgress = turns
  const mainTurn = turnsInProgress[0] // principal (si existe)
  const otherTurns = turnsInProgress.slice(1) // hasta 4 restantes

  return (
    <div className="min-vh-100" style={{ display: "flex", flexDirection: "column" }}>
      {/* Contenedor principal */}
      <div className="flex-grow-1 container-fluid px-0 py-4" style={{ display: "flex" }}>
        {/* Sección izquierda - Video de fondo */}
        <div
          className="col-8 px-4"
          style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "24px",
              background: "linear-gradient(135deg, rgba(87, 83, 79, 0.42) 0%, rgba(80, 79, 79, 0.2) 100%)",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Header dentro del canvas del video (top-left) */}
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
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 style={{ color: "white", margin: 0, fontSize: 20, fontWeight: 700 }}>KAIROS</h2>
              </div>

              <div style={{ textAlign: "right", color: "white", pointerEvents: "none" }}>
                <div style={{ textTransform: "capitalize", fontSize: 14, opacity: 0.95 }}>{formatDate(currentTime)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{formatTime(currentTime)}</div>
              </div>
            </div>

            {/* Aquí irá el video */}
            <video
              autoPlay
              muted
              loop
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "20px",
              }}
            >
              {/* Reemplaza con tu video */}
              <source src="/videos/display-evade.mp4" type="video/mp4" />
            </video>

            {/* Overlay oscuro semi-transparente si necesitas */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.1)",
                borderRadius: "20px",
              }}
            />
          </div>
        </div>

        {/* Sección derecha - Turnos en atención (col-4) - tarjetas homogéneas */}
        <div className="col-4 px-4 d-flex flex-column justify-content-start align-items-stretch">
          {turnsInProgress.length > 0 ? (
            <div style={{ width: "100%", display: "grid", gap: "1rem", alignContent: "start" }}>
              <div className="text-center mb-2">
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
                  EN ATENCIÓN
                </span>
              </div>

              {turnsInProgress.map((t) => (
                <button
                  key={t.id}
                  className="numpad-btn d-flex align-items-center justify-content-between"
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: 14,
                    border: "1px solid rgba(243, 160, 56, 0.12)",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.95) 100%)",
                    boxShadow: "0 12px 30px rgba(16,24,40,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    cursor: "default",
                    textAlign: "left",
                    minHeight: 86,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, rgba(251,146,60,0.12), rgba(249,115,22,0.06))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "inset 0 -6px 12px rgba(234,88,12,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--kairos-primary)" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                      </svg>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--kairos-primary)" }}>{t.serviceName}</div>
                      <div style={{ fontSize: 13, color: "var(--kairos-gray-700)", marginTop: 6 }}>{t.clientName}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: 64,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.45rem 0.6rem",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, rgba(251,146,60,0.12) 0%, rgba(249,115,22,0.06) 100%)",
                      fontSize: 22,
                      fontWeight: 900,
                      color: "var(--kairos-primary-dark)",
                      boxShadow: "0 6px 18px rgba(234,88,12,0.06)",
                    }}
                  >
                    {t.number}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center" style={{ paddingTop: 24 }}>
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
    </div>
  )
}
