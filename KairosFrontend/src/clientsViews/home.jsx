"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()
  const [selectedDocType, setSelectedDocType] = useState("")

  const documentTypes = [
    {
      id: "cedula",
      label: "Cédula de Ciudadanía",
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 15h0M7 12h0M7 9h4" />
          <path d="M15 9h2M15 12h2M15 15h2" />
        </svg>
      ),
    },
    {
      id: "cedula_extranjera",
      label: "Cédula de Extranjería",
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <circle cx="8" cy="11" r="2" />
          <path d="M15 8h2M15 12h2M15 16h2" />
          <path d="M6 16c0-1.5 2-2 2-2s2 .5 2 2" />
        </svg>
      ),
    },
    {
      id: "tarjeta_identidad",
      label: "Tarjeta de Identidad",
      icon: (
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M15 8h2M15 12h2" />
          <path d="M7 15c0-1 1-2 2-2s2 1 2 2" />
        </svg>
      ),
    },
  ]

  const handleSelectDocument = (docType) => {
    setSelectedDocType(docType)
    navigate("/ingresar-documento", { state: { docType } })
  }

  return (
    <div className="min-vh-100 bg-gradient-primary d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-5 fade-in">
          <div className="mb-4">
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))" }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1
            className="display-2 fw-bold text-white mb-3"
            style={{
              textShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              letterSpacing: "-0.02em",
            }}
          >
            BIENVENIDOS
          </h1>
          <p
            className="fs-3 text-white mb-0"
            style={{
              fontWeight: 500,
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            Sistema de Gestión de Turnos
          </p>
        </div>

        <div
          className="card shadow-lg border-0 fade-in"
          style={{
            animationDelay: "0.2s",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div className="card-body p-5">
            <h2 className="text-center mb-4 kairos-logo-small">Por favor, elija el tipo de documento</h2>

            <div className="row g-4">
              {documentTypes.map((doc, index) => (
                <div
                  key={doc.id}
                  className="col-md-4"
                  style={{
                    animation: `fadeIn 0.6s ease-out ${0.3 + index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <button
                    className="btn btn-touch w-100 d-flex flex-column align-items-center justify-content-center gap-3 p-4"
                    onClick={() => handleSelectDocument(doc.id)}
                  >
                    <div style={{ color: "var(--kairos-primary)" }}>{doc.icon}</div>
                    <span className="text-center" style={{ fontSize: "1rem", lineHeight: 1.4 }}>
                      {doc.label}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-pill"
                style={{
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.1) 100%)",
                  border: "2px solid rgba(249, 115, 22, 0.2)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-primary)"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p
                  className="mb-0"
                  style={{
                    color: "var(--kairos-gray-700)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Toque el tipo de documento correspondiente para continuar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
