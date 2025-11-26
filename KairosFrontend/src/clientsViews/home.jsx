"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()
  const [selectedDocType, setSelectedDocType] = useState("")

  const documentTypes = [
    { id: "cedula", label: "Cédula de Ciudadanía", icon: "🪪" },
    { id: "cedula_extranjera", label: "Cédula de Extranjería", icon: "🛂" },
    { id: "tarjeta_identidad", label: "Tarjeta de Identidad", icon: "🆔" },
  ]

  const handleSelectDocument = (docType) => {
    setSelectedDocType(docType)
    // Navegar a la pantalla de ingreso de documento
    navigate("/ingresar-documento", { state: { docType } })
  }

  return (
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5">
      <div className="container">
        <div className="text-center mb-5 fade-in">
          <div className="mb-4">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="display-3 fw-bold text-white mb-3">BIENVENIDOS</h1>
          <p className="fs-4 text-white mb-0">Kairos - Sistema de Gestión de Turnos</p>
        </div>

        <div className="card shadow-lg border-0 fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="card-body p-5">
            <h2 className="text-center mb-4 kairos-logo-small">Por favor, elija el tipo de documento</h2>

            <div className="row g-4">
              {documentTypes.map((doc) => (
                <div key={doc.id} className="col-md-6 col-lg-4">
                  <button
                    className="btn btn-touch btn-touch-primary w-100 d-flex flex-column align-items-center justify-content-center gap-2"
                    onClick={() => handleSelectDocument(doc.id)}
                  >
                    <span style={{ fontSize: "2.5rem" }}>{doc.icon}</span>
                    <span className="text-center">{doc.label}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <p className="text-muted mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Toque el tipo de documento correspondiente para continuar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
