"use client"

import { useEffect, useState } from "react"
import { clientService } from "../services/clientService"

export default function EmpleadoClientes() {
  const [allClients, setAllClients] = useState([]) // lista completa
  const [clients, setClients] = useState([]) // lista mostrada por defecto (10 recientes)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")

      try {
        const data = await clientService.GetAll()
        const list = data || []

        // ordenar por fecha de creación si existe, si no por id numérico descendente
        const sorted = [...list].sort((a, b) => {
          const keyA = a.createdAt || a.createdAtUtc || a.created_at
          const keyB = b.createdAt || b.createdAtUtc || b.created_at
          const dateA = keyA ? Date.parse(keyA) : null
          const dateB = keyB ? Date.parse(keyB) : null

          if (dateA && dateB) return dateB - dateA

          const idA = Number(a.idClient ?? a.id ?? 0) || 0
          const idB = Number(b.idClient ?? b.id ?? 0) || 0
          return idB - idA
        })

        setAllClients(sorted)
        // por defecto mostrar solo los 10 más recientes
        setClients(sorted.slice(0, 10))
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

  // Si hay búsqueda, filtrar en toda la lista allClients.
  // Si no hay búsqueda, usar la lista clients (los 10 recientes).
  const filteredClients = normalizedSearch
    ? allClients.filter((c) => {
        const doc = (c.idClient ?? c.id ?? c.document ?? "").toString().toLowerCase()
        const name = (c.name ?? c.fullName ?? "").toString().toLowerCase()
        const email = (c.email ?? "").toString().toLowerCase()

        return (
          doc.includes(normalizedSearch) ||
          name.includes(normalizedSearch) ||
          email.includes(normalizedSearch)
        )
      })
    : clients

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>

              <h2 className="kairos-logo-small mb-1">Consultar Clientes</h2>
              <p className="text-muted mb-3">
                {normalizedSearch ? `Resultados de búsqueda (${filteredClients.length})` : "Mostrando hasta los 10 clientes más recientes"}
              </p>
            </div>

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
                  placeholder="Buscar (busca en todos los clientes)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {normalizedSearch && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm("")}
                    title="Limpiar búsqueda"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted mt-3">Cargando clientes...</p>
              </div>
            )}

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
                <p className="text-muted mb-0">No se encontraron clientes.</p>
              </div>
            )}

            {!loading && !error && filteredClients.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 text-uppercase small fw-semibold">Documento</th>
                      <th className="border-0 text-uppercase small fw-semibold">Nombre</th>
                      <th className="border-0 text-uppercase small fw-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c) => (
                      <tr key={c.idClient ?? c.id} className="hover-lift">
                        <td className="fw-semibold">{c.idClient ?? c.id}</td>
                        <td>{c.name ?? c.fullName}</td>
                        <td>
                          <span
                            className={`badge ${String(c.state ?? "").toLowerCase() === "activo" ? "bg-success" : "bg-secondary"}`}
                          >
                            {c.state ?? "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && !normalizedSearch && (
              <div className="text-muted small text-center mt-3">Mostrando {clients.length} de {allClients.length} cliente(s)</div>
            )}

            {!loading && !error && normalizedSearch && (
              <div className="text-muted small text-center mt-3">Resultados: {filteredClients.length} de {allClients.length}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
