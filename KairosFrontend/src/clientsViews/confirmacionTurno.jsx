"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export default function ConfirmacionTurno() {
  const navigate = useNavigate()
  const location = useLocation()
  const { turnNumber, serviceName, clientName, documento } = location.state || {}

  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    if (!turnNumber) {
      navigate("/")
    }
  }, [turnNumber, navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  const handlePrint = () => {
    window.print()
  }

  const handleFinish = () => {
    navigate("/")
  }

  return (
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5">
      <div className="container">
        <div className="card shadow-lg border-0 fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="card-body p-5 text-center">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success pulse" style={{ fontSize: "5rem" }}></i>
            </div>

            <h2 className="kairos-logo-small mb-4">Se ha generado su turno</h2>

            <div className="bg-light rounded-4 p-5 mb-4">
              <p className="text-muted mb-2">SERVICIO</p>
              <h3 className="text-primary fw-bold mb-4">{serviceName}</h3>

              <div className="turn-code mb-3">{turnNumber}</div>

              <p className="text-muted mb-1">Cliente: {clientName}</p>
              <p className="text-muted small">Documento: {documento}</p>
            </div>

            <div className="alert alert-info alert-kairos mb-4">
              <i className="bi bi-info-circle me-2"></i>
              Por favor, espere a que su turno sea llamado
            </div>

            <div className="d-flex gap-3 justify-content-center mb-4">
              <button className="btn btn-primary btn-lg" onClick={handlePrint}>
                <i className="bi bi-printer me-2"></i>
                Imprimir
              </button>

              <button className="btn btn-outline-primary btn-lg" onClick={handleFinish}>
                <i className="bi bi-check-lg me-2"></i>
                Terminar
              </button>
            </div>

            <p className="text-muted small mb-0">Volviendo al inicio en {countdown} segundos...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
