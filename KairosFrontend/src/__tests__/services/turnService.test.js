import { turnService } from '../../services/turnService'
import api from '../../services/api'
import { vi } from 'vitest'

vi.mock('../../services/api')

describe('turnService', () => {
  afterEach(() => vi.clearAllMocks())

  test('GetAll obtiene todos los turnos', async () => {
    const mockTurns = [{ id: 1, number: 101 }, { id: 2, number: 102 }]
    api.get.mockResolvedValue({ data: mockTurns })

    const result = await turnService.GetAll()

    expect(api.get).toHaveBeenCalledWith('/turns')
    expect(result).toEqual(mockTurns)
  })

  test('GetById obtiene un turno por ID', async () => {
    const mockTurn = { id: 1, number: 101, serviceId: 5 }
    api.get.mockResolvedValue({ data: mockTurn })

    const result = await turnService.GetById(1)

    expect(api.get).toHaveBeenCalledWith('/turns/1')
    expect(result).toEqual(mockTurn)
  })

  test('Create crea un nuevo turno', async () => {
    const turnData = { serviceId: 1, priority: 0 }
    const mockResponse = { id: 10, ...turnData, number: 105 }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await turnService.Create(turnData)

    expect(api.post).toHaveBeenCalledWith('/turns', turnData)
    expect(result).toEqual(mockResponse)
  })

  test('CreatePublic crea turno público', async () => {
    const data = { serviceId: 2, document: '12345678' }
    const mockResponse = { id: 20, ...data, number: 201, state: 'Creado' }
    api.post.mockResolvedValue({ data: mockResponse })

    const result = await turnService.CreatePublic(data)

    expect(api.post).toHaveBeenCalledWith('/turns/public', data)
    expect(result).toEqual(mockResponse)
  })

  test('GetServiceSummary obtiene resumen de servicio', async () => {
    const mockSummary = { serviceId: 1, totalTurns: 5, turnsInQueue: 3 }
    api.get.mockResolvedValue({ data: mockSummary })

    const result = await turnService.GetServiceSummary(1)

    expect(api.get).toHaveBeenCalledWith('/turns/service/1/summary')
    expect(result).toEqual(mockSummary)
  })

  test('GetPublicStatus obtiene estado de turno público', async () => {
    const mockStatus = { document: '12345678', serviceId: 1, state: 'Pendiente', position: 2 }
    api.get.mockResolvedValue({ data: mockStatus })

    const result = await turnService.GetPublicStatus('12345678', 1)

    expect(api.get).toHaveBeenCalledWith('/turns/public/status', {
      params: { document: '12345678', serviceId: 1 },
    })
    expect(result).toEqual(mockStatus)
  })
})
