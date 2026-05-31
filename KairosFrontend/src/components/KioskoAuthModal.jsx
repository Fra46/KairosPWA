"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"

export default function KioskoAuthModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const KIOSKO_PIN = "1234" // PIN por defecto

  useEffect(() => {
    if (isOpen) {
      setPin("")
      setError("")
    }
  }, [isOpen])

  const handlePinInput = (num) => {
    if (pin.length < 4) {
      setPin(pin + num)
      setError("")
    }
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("Ingrese un PIN de 4 dígitos")
      return
    }

    setIsLoading(true)

    // Simular pequeño delay para UX
    setTimeout(() => {
      if (pin === KIOSKO_PIN) {
        setPin("")
        setError("")
        onClose()
        navigate("/kiosko/home")
      } else {
        setError("PIN incorrecto. Intente de nuevo.")
        setPin("")
        setIsLoading(false)
      }
    }, 500)
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="modal d-block"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="modal-content border-0 shadow-lg rounded-5">
          <div className="modal-header bg-light border-0 p-4">
            <h5 className="modal-title fw-bold">Acceso Modo Kiosko</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Ícono */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, var(--kairos-primary) 0%, var(--kairos-primary-dark) 100%)",
                  boxShadow: "var(--shadow-primary)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="20" x2="22" y2="20"></line>
                </svg>
              </div>
              <p className="text-muted small">Ingrese el PIN de acceso</p>
            </div>

            {/* Display del PIN */}
            <div className="mb-4">
              <div
                className="d-flex justify-content-center gap-2"
                style={{ minHeight: "50px" }}
              >
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="border-2 border-secondary rounded-3"
                    style={{
                      width: "50px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      backgroundColor: pin[idx] ? "var(--kairos-primary)" : "transparent",
                      borderColor: pin[idx] ? "var(--kairos-primary)" : "#ccc",
                      color: pin[idx] ? "white" : "transparent",
                    }}
                  >
                    {pin[idx] ? "•" : ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="alert alert-danger alert-sm mb-3" role="alert">
                <small>{error}</small>
              </div>
            )}

            {/* Teclado numérico */}
            <div className="mb-4">
              <div className="row g-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div key={num} className="col-4">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100 py-3 fw-bold"
                      onClick={() => handlePinInput(String(num))}
                      disabled={isLoading || pin.length >= 4}
                    >
                      {num}
                    </button>
                  </div>
                ))}
                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 py-3 fw-bold"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    C
                  </button>
                </div>
                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 py-3 fw-bold"
                    onClick={() => handlePinInput("0")}
                    disabled={isLoading || pin.length >= 4}
                  >
                    0
                  </button>
                </div>
                <div className="col-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 py-3 fw-bold"
                    onClick={handleBackspace}
                    disabled={isLoading}
                  >
                    ⌫
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="button"
              className="btn btn-primary w-100 py-3 fw-bold"
              onClick={handleSubmit}
              disabled={isLoading || pin.length !== 4}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Verificando...
                </>
              ) : (
                "Acceder"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
