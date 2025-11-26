"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Recover() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Simulación - En producción conectar con el backend
    setTimeout(() => {
      setMessage("Se ha enviado un correo con instrucciones para recuperar tu contraseña.")
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-4">
              <button className="btn btn-outline-primary" onClick={() => navigate("/login")}>
                <i className="bi bi-arrow-left me-2"></i>
                Volver al inicio de sesión
              </button>
            </div>

            <div className="card shadow-lg border-0 fade-in">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-key text-primary" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h2 className="kairos-logo-small mb-2">Recuperar Contraseña</h2>
                  <p className="text-muted mb-0">Ingresa tu correo electrónico y te enviaremos instrucciones</p>
                </div>

                {message && (
                  <div className="alert alert-success alert-kairos mb-4" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Correo Electrónico</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Enviar Instrucciones
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
