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
        <div className="card shadow-lg border-0 fade-in">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0 h4">
              <i className="bi bi-person-lines-fill me-2"></i>
              Consultar Clientes
            </h2>
          </div>

          <div className="card-body p-4">
            <p className="text-muted mb-4">
              Aquí puedes consultar los clientes que han tomado turnos en el sistema.
            </p>

            {/* Buscador */}
            <div className="mb-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Estado de carga */}
            {loading && (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted mt-3">Cargando clientes...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-danger alert-kairos" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Sin resultados */}
            {!loading && !error && filteredClients.length === 0 && (
              <div className="alert alert-light border text-muted" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                No se encontraron clientes que coincidan con la búsqueda.
              </div>
            )}

            {/* Tabla de clientes */}
            {!loading && !error && filteredClients.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>
                        <i className="bi bi-card-text me-2"></i>
                        Documento
                      </th>
                      <th>
                        <i className="bi bi-person me-2"></i>
                        Nombre
                      </th>
                      <th>
                        <i className="bi bi-circle-fill me-2"></i>
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((c) => (
                      <tr key={c.idClient}>
                        <td className="fw-semibold">{c.id}</td>
                        <td>{c.name}</td>
                        <td>
                          <span
                            className={`badge ${
                              c.state?.toLowerCase() === "activo"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
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
          </div>
        </div>
      </div>
    </div>
  )
}
