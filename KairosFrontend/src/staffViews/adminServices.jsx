"use client"

import { useState, useEffect } from "react"
import { serviceService } from "../services/serviceService"

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const data = await serviceService.GetAll()
      setServices(data || [])
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los servicios")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editing) {
        await serviceService.Update(editing, {
          ...formData,
          state: "Activo",
        })
      } else {
        await serviceService.Create({
          ...formData,
          state: "Activo",
        })
      }

      setFormData({ name: "", description: "" })
      setEditing(null)
      loadServices()
    } catch (err) {
      console.error(err)
      alert("Error al guardar servicio")
    }
  }

  const handleEdit = (svc) => {
    setFormData({ name: svc.name, description: svc.description || "" })
    setEditing(svc.idService)
  }

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este servicio?")) return
    try {
      await serviceService.Delete(id)
      loadServices()
    } catch (err) {
      console.error(err)
      alert("Error al eliminar servicio")
    }
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 fade-in">

        <div className="card-header bg-primary text-white">
          <h2 className="mb-0 h4">
            <i className="bi bi-grid-3x3-gap me-2"></i>
            Administrar Servicios
          </h2>
        </div>

        <div className="card-body p-4">

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre del servicio"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descripción"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  {editing ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </div>
          </form>

          {loading && <p>Cargando servicios...</p>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && services.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {services.map((svc) => (
                    <tr key={svc.idService}>
                      <td className="fw-semibold">{svc.name}</td>
                      <td>{svc.description || "-"}</td>
                      <td><span className="badge bg-success">{svc.state}</span></td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(svc)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(svc.idService)}
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
