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
    if (!window.confirm("¿Está seguro de eliminar este usuario?")) return

    try {
      await userService.Delete(id)
      loadUsers()
    } catch (err) {
      console.error(err)
      alert("Error al eliminar usuario")
    }
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 fade-in">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0 h4">
            <i className="bi bi-people me-2"></i>
            Administrar Usuarios
          </h2>

          <button className="btn btn-light btn-sm" onClick={() => navigate("/registro")}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Usuario
          </button>
        </div>

        <div className="card-body p-4">
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
                      {/* Nombre */}
                      <td>{u.name}</td>

                      {/* Rol */}
                      <td>
                        <span className="badge bg-primary">
                          {u.rolName}
                        </span>
                      </td>

                      {/* Estado */}
                      <td>
                        <span
                          className={`badge ${u.state === "Activo" ? "bg-success" : "bg-secondary"
                            }`}
                        >
                          {u.state}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(u.idUser)}
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
  )
}
