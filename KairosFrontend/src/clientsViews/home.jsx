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
    {
      id: "pasaporte",
      label: "Pasaporte",
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
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 16h10" />
          <path d="M7 18h10" />
        </svg>
      ),
    },
    {
      id: "licencia_conduccion",
      label: "Licencia de Conducción",
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
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <circle cx="8" cy="11" r="2" />
          <path d="M14 9h4M14 13h4" />
          <path d="M7 16h10" />
        </svg>
      ),
    },
    {
      id: "ppt",
      label: "PPT",
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
          <path d="M15 8h3M15 12h3" />
          <path d="M7 15h10" />
        </svg>
      ),
    },
  ]

  const handleSelectDocument = (docType) => {
    setSelectedDocType(docType)
    navigate("/ingresar-documento", { state: { docType } })
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>

        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="kairos-logo-small mb-2">Por favor, elija el tipo de documento</h2>
            </div>

            <div className="row g-3 mb-4">
              {documentTypes.map((doc) => (
                <div key={doc.id} className="col-6 col-md-4">
                  <button
                    className="numpad-btn w-100 d-flex flex-column align-items-center justify-content-center gap-2 py-4"
                    onClick={() => handleSelectDocument(doc.id)}
                    style={{ minHeight: "140px", fontSize: "0.9rem" }}
                  >
                    <div className="doc-icon" style={{ color: "var(--kairos-primary)", display: "flex" }}>
                      {doc.icon}
                    </div>
                    <span className="text-center" style={{ lineHeight: 1.3, fontWeight: 600 }}>
                      {doc.label}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <div
                className="d-inline-flex align-items-center gap-2 px-4 py-3 rounded-pill"
                style={{
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(251, 146, 60, 0.08) 100%)",
                  border: "2px solid rgba(249, 115, 22, 0.15)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--kairos-primary)"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p
                  className="mb-0"
                  style={{
                    color: "var(--kairos-gray-700)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Toque el tipo de documento para continuar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
