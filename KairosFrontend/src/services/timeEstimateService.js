// Tiempos estimados por servicio (en minutos)
// En producción, estos datos vendrían del backend
const serviceEstimates = {
  1: { name: "Atención al Cliente", minutes: 5 },
  2: { name: "Depósitos", minutes: 8 },
  3: { name: "Retiros", minutes: 5 },
  4: { name: "Transferencias", minutes: 10 },
  5: { name: "Consultas", minutes: 3 },
  6: { name: "Logística y Transporte", minutes: 15 },
  7: { name: "Atención Médica", minutes: 20 },
}

export const timeEstimateService = {
  /**
   * Calcula tiempo estimado basado en:
   * - Posición en la cola (número de turnos antes del actual)
   * - Duración promedio del servicio
   */
  getEstimatedTime: (turnPosition, serviceId, turnsInQueue) => {
    const service = serviceEstimates[serviceId]
    if (!service) return null

    // Tiempo promedio por turno en este servicio
    const avgTimePerTurn = service.minutes

    // Turnos pendientes antes del actual
    const turnsAhead = turnPosition - 1

    // Estimado = turnos adelante × tiempo promedio + variación
    const baseEstimate = Math.max(turnsAhead * avgTimePerTurn, avgTimePerTurn / 2)

    // Agregar margen (20%)
    const estimateWithMargin = Math.ceil(baseEstimate * 1.2)

    return {
      minutes: estimateWithMargin,
      serviceInfo: service,
      turnsAhead,
    }
  },

  /**
   * Formatea el tiempo estimado para mostrar en UI
   */
  formatEstimatedTime: (estimate) => {
    if (!estimate) return "No disponible"

    const { minutes } = estimate

    if (minutes < 1) return "< 1 min"
    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  },

  /**
   * Retorna todos los servicios disponibles
   */
  getAllServices: () =>
    Object.entries(serviceEstimates).map(([id, service]) => ({
      id: Number(id),
      name: service.name,
      minutes: service.minutes,
    })),
}
