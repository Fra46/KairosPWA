"use client"

import { useEffect, useState } from "react"
import { clientService } from "../services/clientService"

export default function EmpleadoClientes() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")

      try {
        const data = await clientService.GetAll()
        setClients(data || [])
      } catch (err) {
        console.error("Error cargando clientes:", err)
        setError("Error al cargar los clientes. Intente nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredClients = clients.filter((c) => {
    if (!normalizedSearch) return true

    const doc = (c.id || "").toString().toLowerCase()
    const name = (c.name || "").toLowerCase()

    return (
      doc.includes(normalizedSearch) ||
      name.includes(normalizedSearch)
    )
  })

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="card shadow-xl border-0 fade-in">
          <div className="card-header bg-gradient-orange text-white py-4">
            <h2 className="mb-0 h3 fw-bold d-flex align-items-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="me-3"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Consultar Clientes
            </h2>
          </div>

          <div className="card-body p-4">
            <p className="text-muted mb-4">Aquí puedes consultar los clientes que han tomado turnos en el sistema.</p>

            {/* Buscador */}
            <div className="mb-4">
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar por nombre, documento o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Estado de carga */}
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted mt-3">Cargando clientes...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-danger alert-kairos" role="alert">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="me-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && !error && filteredClients.length === 0 && (
              <div className="alert alert-light border text-center py-5" role="alert">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted mb-3 opacity-50"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p className="text-muted mb-0">No se encontraron clientes que coincidan con la búsqueda.</p>
              </div>
            )}

            {/* Tabla de clientes */}
            {!loading && !error && filteredClients.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 text-uppercase small fw-semibold">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="M7 15h0M2 9.5h20"></path>
                        </svg>
                        Documento
                      </th>
                      <th className="border-0 text-uppercase small fw-semibold">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Nombre
                      </th>
                      <th className="border-0 text-uppercase small fw-semibold">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="me-2"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c) => (
                      <tr key={c.idClient} className="hover-lift">
                        <td className="fw-semibold">{c.id}</td>
                        <td>{c.name}</td>
                        <td>
                          <span
                            className={`badge ${c.state?.toLowerCase() === "activo" ? "bg-success" : "bg-secondary"}`}
                          >
                            {c.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && filteredClients.length > 0 && (
              <div className="text-muted small text-center mt-3">Mostrando {filteredClients.length} cliente(s)</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
