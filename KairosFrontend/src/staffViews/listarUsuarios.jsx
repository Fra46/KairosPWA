"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { userService } from "../services/userService"
import { useAuth } from "../context/useAuth"

export default function ListarUsuarios() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError("")

    try {
      const data = await userService.GetAll()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (user?.idUser === id) {
      alert("No puede eliminar su propia cuenta mientras está logueado.")
      return
    }

    if (!window.confirm("¿Está seguro de eliminar este usuario?")) return

    try {
      await userService.Delete(id)
      // actualizar la lista en memoria sin recargar todo
      setUsers((prev) => prev.filter((u) => u.idUser !== id))
    } catch (err) {
      console.error("Error eliminando usuario:", err)
      const serverMessage = err?.response?.data?.message || err?.message || "Error al eliminar usuario"
      // mostrar error al usuario de forma más descriptiva
      alert(serverMessage)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center py-5" style={{ position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="card shadow-lg border-0 fade-in rounded-5" style={{ maxWidth: "1000px", margin: "0 auto" }}>
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

              <h2 className="kairos-logo-small mb-1">Administrar Usuarios</h2>
              <p className="text-muted mb-0">Lista de usuarios del sistema</p>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
              <div></div>
              <div className="d-flex gap-2">
                <button className="btn btn-light" onClick={() => navigate("/registro")}>
                  <i className="bi bi-plus-circle me-2"></i> Nuevo Usuario
                </button>
              </div>
            </div>

            {loading && <p>Cargando usuarios...</p>}
            {error && <div className="alert alert-danger alert-kairos">{error}</div>}

            {!loading && !error && users.length === 0 && (
              <p className="text-muted">No hay usuarios registrados</p>
            )}

            {!loading && !error && users.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u) => (
                      <tr key={u.idUser}>
                        <td>{u.name}</td>
                        <td>
                          <span className="badge bg-primary">
                            {u.rolName}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${u.state === "Activo" ? "bg-success" : "bg-secondary"}`}
                          >
                            {u.state}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(u.idUser)}
                            disabled={user?.idUser === u.idUser}
                            title={user?.idUser === u.idUser ? "No puede eliminar su propia cuenta" : "Eliminar usuario"}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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
