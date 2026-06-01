import { timeEstimateService } from '../../services/timeEstimateService'

describe('timeEstimateService', () => {
  test('getEstimatedTime calcula tiempo correcto', () => {
    const result = timeEstimateService.getEstimatedTime(3, 1, 10)

    expect(result).toHaveProperty('minutes')
    expect(result).toHaveProperty('serviceInfo')
    expect(result).toHaveProperty('turnsAhead')
    expect(result.turnsAhead).toBe(2)
    expect(result.serviceInfo.name).toBe('Atención al Cliente')
    expect(result.minutes).toBeGreaterThan(0)
  })

  test('getEstimatedTime retorna null si servicio no existe', () => {
    const result = timeEstimateService.getEstimatedTime(1, 999, 5)

    expect(result).toBeNull()
  })

  test('formatEstimatedTime formatea en minutos', () => {
    const estimate = { minutes: 15, serviceInfo: {} }
    const formatted = timeEstimateService.formatEstimatedTime(estimate)

    expect(formatted).toContain('15')
    expect(formatted).toContain('min')
  })

  test('formatEstimatedTime formatea en horas y minutos', () => {
    const estimate = { minutes: 85, serviceInfo: {} }
    const formatted = timeEstimateService.formatEstimatedTime(estimate)

    expect(formatted).toContain('1h')
    expect(formatted).toContain('25m')
  })

  test('formatEstimatedTime retorna valor default si no hay estimate', () => {
    const formatted = timeEstimateService.formatEstimatedTime(null)

    expect(formatted).toBe('No disponible')
  })

  test('getAllServices retorna lista de servicios', () => {
    const services = timeEstimateService.getAllServices()

    expect(Array.isArray(services)).toBe(true)
    expect(services.length).toBeGreaterThan(0)
    expect(services[0]).toHaveProperty('id')
    expect(services[0]).toHaveProperty('name')
    expect(services[0]).toHaveProperty('minutes')
  })
})
